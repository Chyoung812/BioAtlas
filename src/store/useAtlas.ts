import { create } from "zustand";
import { NavLevel } from "@/lib/types";
import {
  findPathwayLocation,
  getOrgan,
  getPathway,
  getTissue,
} from "@/lib/atlas";
import { GENES } from "@/lib/genes";

interface AtlasState {
  // ── 탐색 상태 ──
  level: NavLevel;
  organId: string | null;
  tissueId: string | null;
  pathwayId: string | null;
  /** 마이크로 도감 팝업에 띄울 유전자 심볼 */
  activeGene: string | null;

  /**
   * 인체 위에 분포를 그릴 유전자 심볼 (드릴다운의 역방향).
   * level="body"에 얹히는 별도 축 — 드릴다운 상태(organId/tissueId/pathwayId)와
   * 독립적이라 기존 탐색 흐름을 건드리지 않는다.
   */
  geneFocus: string | null;

  // ── UI 상태 ──
  easyMode: boolean; // 쉬운 설명 모드
  minimapOpen: boolean;
  pathwaySort: "relevance" | "category" | "name";

  // ── 액션 ──
  enterOrgan: (organId: string) => void;
  enterTissue: (tissueId: string) => void;
  enterPathway: (pathwayId: string) => void;
  openGene: (symbol: string) => void;
  closeGene: () => void;
  goTo: (level: NavLevel) => void;
  reset: () => void;

  /** 유전자를 인체 위 분포로 본다 (검색 등에서 진입). */
  focusGene: (symbol: string) => void;
  clearGeneFocus: () => void;

  /** 검색 결과 등에서 임의 위치로 점프 */
  jumpTo: (target: {
    organId?: string;
    tissueId?: string;
    pathwayId?: string;
  }) => void;

  toggleEasyMode: () => void;
  toggleMinimap: () => void;
  setPathwaySort: (sort: "relevance" | "category" | "name") => void;
}

export const useAtlas = create<AtlasState>((set) => ({
  level: "body",
  organId: null,
  tissueId: null,
  pathwayId: null,
  activeGene: null,
  geneFocus: null,

  easyMode: false,
  minimapOpen: true,
  pathwaySort: "relevance",

  // 드릴다운으로 들어가는 순간 유전자 분포 뷰는 역할이 끝난다 → 함께 해제.
  enterOrgan: (organId) =>
    set({
      level: "organ",
      organId,
      tissueId: null,
      pathwayId: null,
      geneFocus: null,
    }),

  enterTissue: (tissueId) =>
    set({ level: "tissue", tissueId, pathwayId: null }),

  enterPathway: (pathwayId) => set({ level: "pathway", pathwayId }),

  openGene: (symbol) => set({ activeGene: symbol }),
  closeGene: () => set({ activeGene: null }),

  // 인체 위 분포 뷰로. 드릴다운 상태를 비우고 body로 되돌린 뒤 유전자만 얹는다.
  focusGene: (symbol) =>
    set({
      level: "body",
      organId: null,
      tissueId: null,
      pathwayId: null,
      activeGene: null,
      geneFocus: symbol,
    }),

  clearGeneFocus: () => set({ geneFocus: null }),

  goTo: (level) =>
    set((s) => {
      if (level === "body")
        return {
          level,
          organId: null,
          tissueId: null,
          pathwayId: null,
          activeGene: null,
          geneFocus: null,
        };
      if (level === "organ")
        return { level, tissueId: null, pathwayId: null, activeGene: null };
      if (level === "tissue")
        return { level, pathwayId: null, activeGene: null };
      return { level, activeGene: null };
    }),

  reset: () =>
    set({
      level: "body",
      organId: null,
      tissueId: null,
      pathwayId: null,
      activeGene: null,
      geneFocus: null,
    }),

  jumpTo: ({ organId, tissueId, pathwayId }) =>
    set(() => {
      if (pathwayId) {
        // 패스웨이만 주어지면 소속 장기·조직을 역추적해 정확한 위치를 복원한다.
        const loc = findPathwayLocation(pathwayId);
        return {
          level: "pathway" as NavLevel,
          organId: organId ?? loc?.organId ?? "brain",
          tissueId: tissueId ?? loc?.tissueId ?? "hippocampus",
          pathwayId,
          activeGene: null,
          geneFocus: null,
        };
      }
      if (tissueId)
        return {
          level: "tissue" as NavLevel,
          organId: organId ?? "brain",
          tissueId,
          pathwayId: null,
          activeGene: null,
          geneFocus: null,
        };
      if (organId)
        return {
          level: "organ" as NavLevel,
          organId,
          tissueId: null,
          pathwayId: null,
          activeGene: null,
          geneFocus: null,
        };
      return {};
    }),

  toggleEasyMode: () => set((s) => ({ easyMode: !s.easyMode })),
  toggleMinimap: () => set((s) => ({ minimapOpen: !s.minimapOpen })),
  setPathwaySort: (pathwaySort) => set({ pathwaySort }),
}));

// ── URL 딥링크 ──────────────────────────────────────────────
// ?organ=&tissue=&pathway=&gene=&focus= 로 탐색 위치를 공유·복원한다.
function toQuery(s: AtlasState) {
  const q = new URLSearchParams();
  if (s.organId) q.set("organ", s.organId);
  if (s.tissueId) q.set("tissue", s.tissueId);
  if (s.pathwayId) q.set("pathway", s.pathwayId);
  if (s.activeGene) q.set("gene", s.activeGene);
  if (s.geneFocus) q.set("focus", s.geneFocus);
  const str = q.toString();
  return str ? `?${str}` : "";
}

function applyQuery(search: string) {
  const q = new URLSearchParams(search);
  const { jumpTo, focusGene, reset } = useAtlas.getState();
  const organ = q.get("organ");
  const tissue = q.get("tissue");
  const pathway = q.get("pathway");
  const gene = q.get("gene");
  const focus = q.get("focus");

  const validOrgan = organ && getOrgan(organ) ? organ : undefined;
  const validTissue =
    validOrgan && tissue && getTissue(validOrgan, tissue) ? tissue : undefined;
  if (pathway && getPathway(pathway)) {
    // 조직과 맞지 않는 패스웨이면 조직 정보를 버리고 소속 위치를 역추적한다
    const fits = validTissue
      ? getTissue(validOrgan!, validTissue)!.pathwayIds.includes(pathway)
      : false;
    jumpTo(
      fits
        ? { organId: validOrgan, tissueId: validTissue, pathwayId: pathway }
        : { pathwayId: pathway }
    );
  } else if (validOrgan) {
    jumpTo({ organId: validOrgan, tissueId: validTissue });
  } else if (focus && GENES[focus]) {
    focusGene(focus);
  } else {
    reset();
  }
  useAtlas.setState({ activeGene: gene && GENES[gene] ? gene : null });
}

/** 첫 진입 시 URL을 읽어 상태를 복원하고, 이후 상태 변화를 URL에 반영한다. */
export function bindAtlasToUrl() {
  applyQuery(window.location.search);
  let last = toQuery(useAtlas.getState());
  history.replaceState(null, "", window.location.pathname + last);

  let restoring = false;
  const unsubscribe = useAtlas.subscribe((s) => {
    if (restoring) return;
    const next = toQuery(s);
    if (next === last) return;
    last = next;
    history.pushState(null, "", window.location.pathname + next);
  });
  const onPop = () => {
    restoring = true;
    applyQuery(window.location.search);
    restoring = false;
    last = toQuery(useAtlas.getState());
  };
  window.addEventListener("popstate", onPop);
  return () => {
    unsubscribe();
    window.removeEventListener("popstate", onPop);
  };
}
