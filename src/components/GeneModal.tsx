"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { GENES, SYNONYMS } from "@/lib/genes";
import { getPathway } from "@/lib/atlas";
import { useAtlas } from "@/store/useAtlas";
import { useExternalGene, useGeneDetail } from "@/hooks/useGeneDetail";
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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeGene) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeGene();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeGene, closeGene]);

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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeGene} 유전자 도감`}
            tabIndex={-1}
            className="panel relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl !bg-surface shadow-2xl focus:outline-none"
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            {/* 실데이터 페칭 중에는 스켈레톤. 그동안 배경 클릭으로 닫기 가능. */}
            <Suspense fallback={<GeneSkeleton />}>
              {GENES[activeGene] ? (
                <GeneBody symbol={activeGene} />
              ) : (
                <ExternalGeneBody symbol={activeGene} />
              )}
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
                title="NCBI E-utilities에서 받아온 데이터"
              >
                NCBI 실데이터
                {gene._meta?.fetchedAt && ` · ${formatDate(gene._meta.fetchedAt)} 확인`}
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
          <BookmarkButton symbol={gene.symbol} />
          <button
            onClick={closeGene}
            className="rounded-full p-1.5 text-fg-muted hover:bg-subtle hover:text-fg"
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

        <CopyActions
          sharePath={`/gene/${gene.symbol}`}
          citation={citeGene(gene, pathwayOfGene)}
        />

        <p className="mt-4 text-[11px] leading-relaxed text-fg-faint">
          학습·연구 참고용 정보입니다. 의학적 진단이나 치료 판단에 쓸 수 없으며,
          건강 문제는 의료진과 상담하세요.
        </p>
      </div>
    </>
  );
}

// 도감에 없는 유전자 — NCBI 기본 정보만 보여주고, 쉬운 설명이 없다는 사실을 밝힌다
function ExternalGeneBody({ symbol }: { symbol: string }) {
  const result = useExternalGene(symbol);
  const closeGene = useAtlas((s) => s.closeGene);
  const openGene = useAtlas((s) => s.openGene);
  const curated = typeof result === "object" && GENES[result.symbol];

  // 별칭으로 찾았는데 공식 기호가 도감에 있으면(예: P53 → TP53) 도감으로 넘긴다
  useEffect(() => {
    if (curated) openGene(curated.symbol);
  }, [curated, openGene]);
  if (curated) return <GeneSkeleton />;

  if (typeof result === "string") {
    return (
      <div className="p-5">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-brand-400">{symbol}</h2>
          <button
            onClick={closeGene}
            className="rounded-full p-1.5 text-fg-muted hover:bg-subtle hover:text-fg"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          {result === "notfound"
            ? `‘${symbol}’라는 사람 유전자를 NCBI에서 찾지 못했어요. 공식 유전자 기호(예: TP53, BRCA1)로 다시 검색해 보세요.`
            : "NCBI 응답을 받지 못했어요. 잠시 뒤 다시 시도해 주세요."}
        </p>
      </div>
    );
  }

  const gene = result;
  return (
    <>
      <div className="flex items-start justify-between border-b border-line p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-brand-400">{gene.symbol}</h2>
            <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] text-fg-muted">
              Gene ID {gene.geneId}
            </span>
            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] text-sky-400 ring-1 ring-sky-500/30">
              도감 밖 유전자 · NCBI {formatDate(gene.fetchedAt)} 확인
            </span>
          </div>
          <p className="mt-0.5 text-sm text-fg-muted">{gene.fullName}</p>
          {gene.aliases.length > 0 && (
            <p className="mt-0.5 text-xs text-fg-faint">
              다른 이름: {gene.aliases.slice(0, 4).join(" · ")}
              {gene.aliases.length > 4 && " …"}
            </p>
          )}
        </div>
        <button
          onClick={closeGene}
          className="rounded-full p-1.5 text-fg-muted hover:bg-subtle hover:text-fg"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 p-5 text-sm">
        <p className="rounded-lg bg-subtle/60 px-3 py-2 text-xs leading-relaxed text-fg-muted">
          BioAtlas가 아직 쉬운 설명과 인체 지도를 만들지 않은 유전자예요. NCBI에서
          받은 기본 정보만 보여드려요.
        </p>
        {gene.chromosome && <Row label="크로모좀 위치">{gene.chromosome}</Row>}
        {gene.summary && (
          <Row label="NCBI 요약 (영문)">
            <p className="text-xs leading-relaxed text-fg-muted">{gene.summary}</p>
          </Row>
        )}
        {gene.pubmed.length > 0 && (
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
        )}
        <Row label="원본 보기">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <a
              href={`https://www.ncbi.nlm.nih.gov/gene/${gene.geneId}`}
              target="_blank"
              rel="noreferrer"
              className="text-brand-400 hover:underline"
            >
              NCBI Gene ↗
            </a>
            <a
              href={`https://www.uniprot.org/uniprotkb?query=gene_exact:${gene.symbol}+AND+organism_id:9606`}
              target="_blank"
              rel="noreferrer"
              className="text-brand-400 hover:underline"
            >
              UniProt ↗
            </a>
            <a
              href={`https://reactome.org/content/query?q=${gene.symbol}&species=Homo+sapiens`}
              target="_blank"
              rel="noreferrer"
              className="text-brand-400 hover:underline"
            >
              Reactome 경로 ↗
            </a>
          </div>
        </Row>
        <CopyActions citation={citeNcbi(gene.symbol, gene.fullName, gene.geneId, gene.fetchedAt)} />
      </div>
    </>
  );
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ko-KR", { dateStyle: "medium" });

function citeNcbi(symbol: string, fullName: string, geneId: string, checkedAt?: string) {
  const date = formatDate(checkedAt ?? new Date().toISOString());
  return `${symbol} (${fullName}). NCBI Gene ID ${geneId}. https://www.ncbi.nlm.nih.gov/gene/${geneId} (확인일 ${date})`;
}

// 지금 보고 있는 패스웨이에 속한 유전자면 Reactome 출처도 함께 적는다
function citeGene(
  gene: (typeof GENES)[string],
  pathway: ReturnType<typeof getPathway> | undefined
) {
  const lines = [citeNcbi(gene.symbol, gene.fullName, gene.geneId, gene._meta?.fetchedAt)];
  if (pathway?.network.nodes.some((n) => n.id === gene.symbol)) {
    lines.push(
      `${pathway.nameEn}. ${pathway.source} ${pathway.sourceId}. https://reactome.org/content/detail/${pathway.sourceId}`
    );
  }
  return lines.join("\n");
}

function CopyActions({
  sharePath,
  citation,
}: {
  sharePath?: string;
  citation: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (label: string, text: string) =>
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
      },
      () => setCopied("복사하지 못했어요")
    );
  const btn =
    "rounded-lg border border-line px-3 py-1.5 text-xs text-fg-muted hover:border-brand-500 hover:text-fg";
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {sharePath && (
        <button
          onClick={() => copy("링크를 복사했어요", window.location.origin + sharePath)}
          className={btn}
        >
          링크 복사
        </button>
      )}
      <button onClick={() => copy("인용 정보를 복사했어요", citation)} className={btn}>
        인용 정보 복사
      </button>
      <span role="status" className="text-[11px] text-fg-faint">
        {copied}
      </span>
    </div>
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

function BookmarkButton({ symbol }: { symbol: string }) {
  const saved = useAtlas((s) => s.bookmarks.includes(symbol));
  const toggleBookmark = useAtlas((s) => s.toggleBookmark);
  const [toast, setToast] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => {
          toggleBookmark(symbol);
          setToast(true);
          setTimeout(() => setToast(false), 2200);
        }}
        className={`rounded-full p-1.5 ${
          saved ? "text-brand-400" : "text-fg-muted hover:text-brand-400"
        } hover:bg-subtle`}
        aria-label={saved ? "북마크 해제" : "북마크"}
        aria-pressed={saved}
        title={saved ? "북마크 해제" : "북마크"}
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
            {saved
              ? "북마크에 저장했어요. 상단 ★ 메뉴에서 다시 볼 수 있어요."
              : "북마크에서 뺐어요."}
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
