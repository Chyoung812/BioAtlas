import { create } from "zustand";
import { NavLevel } from "@/lib/types";
import { findPathwayLocation } from "@/lib/atlas";

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
