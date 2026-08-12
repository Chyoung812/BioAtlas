"use client";

import { Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtlas } from "@/store/useAtlas";
import { usePathwayDetail } from "@/hooks/usePathwayDetail";
import {
  getOrgan,
  getTissue,
  getPathway,
  getPathwaysForTissue,
} from "@/lib/atlas";
import { Pathway } from "@/lib/types";

export function Sidebar() {
  const {
    level,
    organId,
    tissueId,
    pathwayId,
    pathwaySort,
    setPathwaySort,
    enterTissue,
    enterPathway,
    jumpTo,
  } = useAtlas();

  const organ = organId ? getOrgan(organId) : null;
  const tissue = organId && tissueId ? getTissue(organId, tissueId) : null;
  const pathway = pathwayId ? getPathway(pathwayId) : null;

  const pathways = useMemo(() => {
    if (!organId || !tissueId) return [];
    const list = getPathwaysForTissue(organId, tissueId);
    const sorted = [...list];
    if (pathwaySort === "relevance")
      sorted.sort((a, b) => b.relevance - a.relevance);
    else if (pathwaySort === "name")
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    else sorted.sort((a, b) => a.category.localeCompare(b.category, "ko"));
    return sorted;
  }, [organId, tissueId, pathwaySort]);

  return (
    <aside className="panel absolute bottom-4 right-4 top-16 z-20 flex w-80 flex-col overflow-hidden rounded-2xl">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-fg">
          {level === "body" && "장기를 선택하세요"}
          {level === "organ" && `${organ?.name} · 조직 선택`}
          {(level === "tissue" || level === "pathway") &&
            `${tissue?.name ?? ""} · 패스웨이`}
        </h2>
        {organ && (
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
            {tissue?.description ?? organ.description}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* body 레벨: 안내 */}
        {level === "body" && (
          <div className="space-y-3 px-1 py-2 text-sm text-fg-muted">
            <p>
              인체 지도에서 빛나는{" "}
              <b className="text-brand-400">장기</b>를 클릭하면 탐색이 시작됩니다.
            </p>
            <div className="rounded-xl bg-raised/60 p-3 text-xs leading-relaxed">
              <div className="mb-1.5 font-medium text-fg-muted">
                탐색 순서
              </div>
              <ol className="list-inside list-decimal space-y-0.5 text-fg-muted">
                <li>장기 선택 (뇌·심장·폐·간·위·췌장·장·신장)</li>
                <li>조직 선택 (해마·심근·간세포 등)</li>
                <li>패스웨이 선택</li>
                <li>유전자 클릭 → 도감 열람</li>
              </ol>
            </div>
            <p className="text-xs">
              <b className="text-brand-400">8개 장기(뇌·심장·폐·간·위·췌장·장·신장)</b>가
              조직→패스웨이→유전자 전 구간까지 탐색 가능합니다.
            </p>
          </div>
        )}

        {/* organ 레벨: 조직 리스트 */}
        {level === "organ" && organ && (
          <ul className="space-y-1.5">
            {organ.tissues.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => enterTissue(t.id)}
                  className="w-full rounded-xl border border-line px-3 py-2.5 text-left hover:border-brand-500 hover:bg-raised"
                >
                  <div className="text-sm font-medium text-fg">
                    {t.name}{" "}
                    <span className="text-xs text-fg-faint">{t.nameEn}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-fg-muted">
                    패스웨이 {t.pathwayIds.length}개
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* tissue / pathway 레벨: 패스웨이 리스트 + 정렬 */}
        {(level === "tissue" || level === "pathway") && (
          <>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs text-fg-faint">
                {pathways.length}개 패스웨이
              </span>
              <select
                value={pathwaySort}
                onChange={(e) =>
                  setPathwaySort(e.target.value as typeof pathwaySort)
                }
                className="rounded-md border border-line bg-canvas/60 px-2 py-1 text-xs text-fg-muted focus:outline-none"
              >
                <option value="relevance">연관도순</option>
                <option value="category">카테고리별</option>
                <option value="name">이름순</option>
              </select>
            </div>
            <ul className="space-y-1.5">
              {pathways.map((p) => (
                <PathwayItem
                  key={p.id}
                  pathway={p}
                  active={p.id === pathwayId}
                  onClick={() => enterPathway(p.id)}
                />
              ))}
            </ul>

            {/* 선택된 패스웨이 정보 + 연관 패스웨이 이동 */}
            <AnimatePresence>
              {pathway && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl bg-raised/60 p-3"
                >
                  <div className="text-xs font-semibold text-brand-400">
                    {pathway.name}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                    {pathway.summary}
                  </p>
                  <div className="mt-2 text-[11px] text-fg-faint">
                    출처: {pathway.source} · {pathway.sourceId}
                  </div>
                  {/* 실 API 확인 배지 + 원문(영문) 설명 — 로딩 동안엔 조용히 없음 */}
                  <Suspense fallback={null}>
                    <PathwayLiveMeta id={pathway.id} />
                  </Suspense>
                  {pathway.relatedPathwayIds.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 text-[11px] font-medium text-fg-faint">
                        연관 패스웨이
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {pathway.relatedPathwayIds.map((rid) => {
                          const rp = getPathway(rid);
                          if (!rp) return null;
                          return (
                            <button
                              key={rid}
                              onClick={() => jumpTo({ pathwayId: rid })}
                              className="rounded-full bg-subtle px-2 py-0.5 text-[11px] text-fg hover:bg-brand-500 hover:text-white"
                            >
                              {rp.name} →
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </aside>
  );
}

// 선택된 패스웨이의 실 API(KEGG/Reactome) 확인 상태 + 원문 설명을 보강 렌더.
// 큐레이션 name/summary는 이미 상위에서 즉시 표시되므로, 이건 순수 부가 정보.
function PathwayLiveMeta({ id }: { id: string }) {
  const p = usePathwayDetail(id);
  const isFallback = p._meta?.source === "fallback";
  return (
    <div className="mt-1.5">
      <span
        className={
          isFallback
            ? "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-400 ring-1 ring-amber-500/30"
            : "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400 ring-1 ring-emerald-500/30"
        }
        title={
          isFallback
            ? "출처 응답을 받지 못해 큐레이션 데이터로 표시 중입니다."
            : `${p.source} 실시간 확인됨`
        }
      >
        {isFallback ? "출처 미확인(오프라인)" : `${p.source} 확인됨`}
      </span>
      {p.sourceDescription && (
        <p
          className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-fg-faint"
          title={p.sourceDescription}
        >
          <span className="text-fg-muted">원문(영문): </span>
          {p.sourceDescription}
        </p>
      )}
    </div>
  );
}

function PathwayItem({
  pathway,
  active,
  onClick,
}: {
  pathway: Pathway;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
          active
            ? "border-brand-500 bg-brand-500/10"
            : "border-line hover:border-brand-500/60 hover:bg-raised"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-fg">
            {pathway.name}
          </span>
          <span className="shrink-0 rounded-full bg-subtle px-1.5 py-0.5 text-[10px] text-fg-muted">
            {pathway.category}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-subtle">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.round(pathway.relevance * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-fg-faint">
            {Math.round(pathway.relevance * 100)}%
          </span>
        </div>
      </button>
    </li>
  );
}
