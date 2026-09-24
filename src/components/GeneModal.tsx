"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { GENES, SYNONYMS } from "@/lib/genes";
import { getPathway } from "@/lib/atlas";
import { useAtlas } from "@/store/useAtlas";
import { useGeneDetail } from "@/hooks/useGeneDetail";
import { MicroMap } from "./MicroMap";
import { GuideCard } from "./GuideCard";

// WebGL 뷰어 — 브라우저 전용이라 SSR 비활성화 + 청크 지연 로드
const ProteinViewer = dynamic(
  () => import("./ProteinViewer").then((m) => m.ProteinViewer),
  { ssr: false, loading: () => <ViewerSkeleton /> }
);

// 마이크로 도감 팝업 (PRD ⑤)
export function GeneModal() {
  const activeGene = useAtlas((s) => s.activeGene);
  const closeGene = useAtlas((s) => s.closeGene);

  return (
    <AnimatePresence>
      {activeGene && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeGene}
          />
          <motion.div
            className="panel relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl shadow-2xl"
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            {/* 실데이터 페칭 중에는 스켈레톤. 그동안 배경 클릭으로 닫기 가능. */}
            <Suspense fallback={<GeneSkeleton />}>
              <GeneBody symbol={activeGene} />
            </Suspense>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GeneBody({ symbol }: { symbol: string }) {
  const gene = useGeneDetail(symbol); // NCBI 실데이터 (실패 시 큐레이션 폴백)
  const closeGene = useAtlas((s) => s.closeGene);
  const easyMode = useAtlas((s) => s.easyMode);
  const jumpTo = useAtlas((s) => s.jumpTo);
  const isFallback = gene._meta?.source === "fallback";
  const syn = SYNONYMS[gene.symbol];
  const pathwayId = useAtlas((s) => s.pathwayId);
  const pathwayOfGene = getPathway(pathwayId ?? "");
  const contextNode = pathwayOfGene?.network.nodes.find(
    (n) => n.id === gene.symbol && n.membership === "contextual"
  );

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-start justify-between border-b border-line p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-brand-400">{gene.symbol}</h2>
            <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] text-fg-muted">
              Gene ID {gene.geneId}
            </span>
            {isFallback ? (
              <span
                className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-400 ring-1 ring-amber-500/30"
                title="NCBI 응답을 받지 못해 큐레이션 데이터로 표시 중입니다."
              >
                오프라인 데이터
              </span>
            ) : (
              <span
                className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-400 ring-1 ring-emerald-500/30"
                title="NCBI E-utilities 실시간 데이터"
              >
                NCBI 실데이터
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-fg-muted">{gene.fullName}</p>
          {syn && syn.symbols.length > 0 && (
            <p className="mt-0.5 text-xs text-fg-faint">
              다른 이름: {syn.symbols.slice(0, 4).join(" · ")}
              {syn.symbols.length > 4 && " …"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <BookmarkButton />
          <button
            onClick={closeGene}
            className="rounded-full p-1.5 text-fg-muted hover:bg-subtle hover:text-white"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 쉬운 설명 (상단) */}
      <div className="p-5">
        <div className="rounded-xl bg-brand-500/10 p-4 ring-1 ring-brand-500/20">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-400">
            쉬운 설명
          </div>
          <p className="text-[15px] leading-relaxed text-fg">
            {gene.easyExplanation}
          </p>
        </div>
        {gene.guide && <GuideCard guide={gene.guide} />}
        {contextNode?.context && (
          <p className="mt-3 rounded-lg bg-subtle/60 px-3 py-2 text-xs leading-relaxed text-fg-muted">
            <span className="font-medium text-fg">
              {pathwayOfGene?.name}에서는 {pathwayOfGene?.source} 경로 밖의 관련
              맥락으로 표시돼요.
            </span>{" "}
            {contextNode.context.reason}
          </p>
        )}

        {/* 단백질 3D 구조 — 실험 구조가 없으면 AlphaFold 예측 모델로 폴백 */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-400">
              단백질 3D 구조
            </span>
            {!gene.proteinPdbId && (
              <span
                className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-400 ring-1 ring-sky-500/30"
                title="실험으로 밝혀진 구조가 아직 없어 AlphaFold 예측 모델을 표시합니다."
              >
                AlphaFold 예측
              </span>
            )}
          </div>
          <Suspense fallback={<ViewerSkeleton />}>
            <ProteinViewer
              pdbId={gene.proteinPdbId}
              chain={gene.proteinPdbChain}
              uniprot={gene.uniprot}
            />
          </Suspense>
        </div>

        {/* 쉬운 설명 모드 ON → Interactive Micro-Map.
            애셋이 비어도 MicroMap이 폴백 장면을 그리므로, 유전자를 새로 추가했을 때
            애니메이션이 조용히 사라지는 일은 없다. */}
        <AnimatePresence>
          {easyMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <MicroMap
                asset={gene.microMapAsset ?? ""}
                symbol={gene.symbol}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 전문 데이터 아코디언 */}
        <ExpertAccordion
          gene={gene}
          onJumpPathway={(id) => jumpTo({ pathwayId: id })}
        />
      </div>
    </>
  );
}

// 실데이터 페칭 동안 표시되는 스켈레톤 (헤더/본문 레이아웃과 대략 일치)
function GeneSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start justify-between border-b border-line p-5">
        <div className="space-y-2">
          <div className="h-6 w-24 rounded bg-subtle" />
          <div className="h-4 w-40 rounded bg-subtle/70" />
        </div>
        <div className="h-8 w-8 rounded-full bg-subtle" />
      </div>
      <div className="space-y-3 p-5">
        <div className="h-24 w-full rounded-xl bg-subtle/60" />
        <div className="h-10 w-full rounded-xl bg-subtle/40" />
      </div>
    </div>
  );
}

// 단백질 3D 구조 로딩(청크 + PDB 다운로드) 동안의 스켈레톤
function ViewerSkeleton() {
  return (
    <div className="flex h-56 w-full animate-pulse items-center justify-center rounded-xl bg-raised/60 text-xs text-fg-faint">
      단백질 구조 불러오는 중…
    </div>
  );
}

function BookmarkButton() {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => {
          // 비로그인 상태: 로그인 유도 (Phase 2 인증 연동 자리)
          setToast(true);
          setSaved((s) => !s);
          setTimeout(() => setToast(false), 2200);
        }}
        className={`rounded-full p-1.5 ${
          saved ? "text-brand-400" : "text-fg-muted hover:text-brand-400"
        } hover:bg-subtle`}
        aria-label="북마크"
        title="북마크"
      >
        {saved ? "★" : "☆"}
      </button>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="panel absolute right-0 top-9 z-20 w-48 rounded-lg p-2 text-[11px] text-fg-muted"
          >
            로그인이 필요합니다. (Phase 2: 로그인/마이페이지 연동)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpertAccordion({
  gene,
  onJumpPathway,
}: {
  gene: (typeof GENES)[string];
  onJumpPathway: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const syn = SYNONYMS[gene.symbol];
  return (
    <div className="mt-4 rounded-xl border border-line">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-fg"
      >
        전문 데이터
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4 text-sm">
              <Row label="공식 심볼 / HGNC">
                {gene.symbol} · {gene.hgnc}
              </Row>
              {syn && (syn.symbols.length > 0 || syn.names.length > 0) && (
                <Row label="다른 이름">
                  <div className="flex flex-wrap gap-1">
                    {syn.symbols.map((a) => (
                      <span
                        key={a}
                        className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[11px] text-fg"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  {syn.names.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-xs text-fg-muted">
                      {syn.names.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1.5 text-[10px] text-fg-faint">
                    HGNC·NCBI 기준 · 예전 기호, 별칭, 질환 유전자좌 이름이
                    섞여 있을 수 있어요
                  </p>
                </Row>
              )}
              <Row label="크로모좀 위치">{gene.chromosome}</Row>
              {gene.ncbiSummary && (
                <Row label="NCBI 요약 (영문)">
                  <p className="text-xs leading-relaxed text-fg-muted">
                    {gene.ncbiSummary}
                  </p>
                </Row>
              )}
              <Row label="단백질 구조">
                {gene.proteinPdbId ? (
                  <a
                    href={`https://www.rcsb.org/structure/${gene.proteinPdbId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-400 hover:underline"
                  >
                    PDB {gene.proteinPdbId} ↗
                  </a>
                ) : (
                  <a
                    href={`https://alphafold.ebi.ac.uk/entry/${gene.uniprot}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-400 hover:underline"
                  >
                    AlphaFold 예측 모델 ↗
                  </a>
                )}
              </Row>
              <Row label="UniProt">
                <a
                  href={`https://www.uniprot.org/uniprotkb/${gene.uniprot}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-400 hover:underline"
                >
                  {gene.uniprot} ↗
                </a>
              </Row>
              <Row label="발현 조직">{gene.expression.join(", ")}</Row>
              <Row label="관련 논문 (PubMed)">
                <ul className="space-y-1">
                  {gene.pubmed.map((p) => (
                    <li key={p.pmid}>
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-400 hover:underline"
                      >
                        {p.title} (PMID:{p.pmid}) ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </Row>
              <Row label="관련 패스웨이">
                <div className="flex flex-wrap gap-1.5">
                  {gene.relatedPathwayIds.map((pid) => {
                    const p = getPathway(pid);
                    if (!p) return null;
                    return (
                      <button
                        key={pid}
                        onClick={() => onJumpPathway(pid)}
                        className="rounded-full bg-subtle px-2.5 py-1 text-xs text-fg hover:bg-brand-500 hover:text-white"
                      >
                        {p.name} →
                      </button>
                    );
                  })}
                </div>
              </Row>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <div className="text-xs font-medium text-fg-faint">{label}</div>
      <div className="text-fg">{children}</div>
    </div>
  );
}
