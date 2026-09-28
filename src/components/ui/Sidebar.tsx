"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtlas } from "@/store/useAtlas";
import { usePathwayDetail } from "@/hooks/usePathwayDetail";
import {
  ORGANS,
  getOrgan,
  getTissue,
  getPathway,
  getPathwaysForTissue,
} from "@/lib/atlas";
import { Pathway } from "@/lib/types";
import { GuideCard } from "@/components/GuideCard";

export function Sidebar() {
  const {
    level,
    organId,
    tissueId,
    pathwayId,
    pathwaySort,
    setPathwaySort,
    enterOrgan,
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

  // 모바일 하단 시트: 목록에서 골라야 하는 단계(장기·조직)에서만 펼치고,
  // 인체·네트워크를 직접 눌러야 하는 단계에서는 제목만 남긴다.
  const sheetOpen = useAtlas((s) => s.sheetOpen);
  const setSheetOpen = useAtlas((s) => s.setSheetOpen);
  useEffect(() => {
    setSheetOpen(level === "organ" || level === "tissue");
  }, [level, setSheetOpen]);

  return (
    <aside
      className={`panel fixed inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl md:absolute md:bottom-4 md:left-auto md:right-4 md:top-16 md:h-auto md:w-80 md:rounded-2xl ${
        sheetOpen ? "h-[55dvh]" : ""
      }`}
    >
      <div
        onClick={() => setSheetOpen(!sheetOpen)}
        className="border-b border-line px-4 py-3 max-md:cursor-pointer"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-subtle md:hidden" />
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">
            {level === "body" && "장기를 선택하세요"}
            {level === "organ" && `${organ?.name} · 조직 선택`}
            {(level === "tissue" || level === "pathway") &&
              `${tissue?.name ?? ""} · 패스웨이`}
          </h2>
          <button
            className="shrink-0 text-xs text-fg-faint md:hidden"
            aria-expanded={sheetOpen}
          >
            {sheetOpen ? "접기 ▾" : "펼치기 ▴"}
          </button>
        </div>
        {organ && (
          <p
            className={`mt-1 text-xs leading-relaxed text-fg-muted ${
              sheetOpen ? "" : "max-md:hidden"
            }`}
          >
            {tissue?.description ?? organ.description}
          </p>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto p-3 ${sheetOpen ? "" : "max-md:hidden"}`}
      >
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
                <li>장기 선택 ({ORGANS.map((o) => o.name).join("·")})</li>
                <li>조직 선택 (해마·심근·간세포 등)</li>
                <li>패스웨이 선택</li>
                <li>유전자 클릭 → 도감 열람</li>
              </ol>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-fg-muted">
                바로 가기
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ORGANS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => enterOrgan(o.id)}
                    className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-fg hover:border-brand-500 hover:bg-raised"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: o.color }}
                    />
                    {o.name}
                  </button>
                ))}
              </div>
            </div>
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
                  {pathway.guide && (
                    <GuideCard guide={pathway.guide} compact />
                  )}
                  <PathwayMembers pathway={pathway} />
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-fg-faint">
                    <span>
                      출처: {pathway.source} · {pathway.sourceId}
                    </span>
                    <CopyLinkButton path={`/pathway/${pathway.id}`} />
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

function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() =>
        navigator.clipboard.writeText(window.location.origin + path).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
      }
      className="shrink-0 rounded-md border border-line px-2 py-0.5 text-fg-muted hover:border-brand-500 hover:text-fg"
    >
      {copied ? "복사했어요" : "링크 복사"}
    </button>
  );
}

// 출처 DB가 정한 경로 유전자와, 교육용으로 함께 보여주는 맥락 유전자를 나눠 보여준다.
function PathwayMembers({ pathway }: { pathway: Pathway }) {
  const nodes = pathway.network.nodes;
  const context = nodes.filter((n) => n.membership === "contextual");
  if (context.length === 0) return null;
  const members = nodes.filter((n) => n.membership !== "contextual");
  return (
    <div className="mt-2 space-y-0.5 text-[11px] leading-relaxed text-fg-faint">
      <div>
        <span className="text-fg-muted">{pathway.source} 경로 유전자: </span>
        {members.map((n) => n.id).join(" · ")}
      </div>
      <div>
        <span className="text-fg-muted">관련 맥락 (경로 밖): </span>
        {context.map((n) => n.id).join(" · ")}
      </div>
    </div>
  );
}

// 선택된 패스웨이의 실 API(Reactome) 확인 상태 + 원문 설명을 보강 렌더.
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
        {/* 측정값이 아니라 큐레이션한 정렬 기준이라 숫자는 보여주지 않는다 */}
        <div
          className="mt-1.5 h-1 overflow-hidden rounded-full bg-subtle"
          title="이 조직과의 연관도 (BioAtlas 큐레이션 기준 정렬 순서)"
        >
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${Math.round(pathway.relevance * 100)}%` }}
          />
        </div>
      </button>
    </li>
  );
}
