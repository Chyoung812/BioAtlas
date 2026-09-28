import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GENES } from "@/lib/genes";
import { getOrgan, getPathway } from "@/lib/atlas";
import { findGeneDistribution } from "@/lib/expression";
import { SITE_NAME } from "@/lib/site";

// 공유·검색 유입용 유전자 페이지. 탐색은 메인 지도(/)에서 이어진다.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(GENES).map((symbol) => ({ symbol }));
}

type Props = { params: Promise<{ symbol: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gene = GENES[(await params).symbol];
  if (!gene) return {};
  const title = `${gene.symbol} (${gene.fullName}) — ${SITE_NAME}`;
  return {
    title,
    description: gene.easyExplanation,
    alternates: { canonical: `/gene/${gene.symbol}` },
    openGraph: { title, description: gene.easyExplanation, url: `/gene/${gene.symbol}` },
    twitter: { card: "summary_large_image", title, description: gene.easyExplanation },
  };
}

export default async function GenePage({ params }: Props) {
  const gene = GENES[(await params).symbol];
  if (!gene) notFound();
  const organs = (findGeneDistribution(gene.symbol)?.organIds ?? [])
    .map((id) => getOrgan(id))
    .filter((o) => o !== undefined);
  const pathways = gene.relatedPathwayIds
    .map((id) => getPathway(id))
    .filter((p) => p !== undefined);

  const link = "text-brand-400 hover:underline";
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <Link href="/" className="text-sm text-fg-muted hover:text-fg">
        ← {SITE_NAME} 인체 지도
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-brand-400">{gene.symbol}</h1>
      <p className="mt-1 text-fg-muted">{gene.fullName}</p>
      <p className="mt-1 text-xs text-fg-faint">
        NCBI Gene ID {gene.geneId} · {gene.hgnc} · 크로모좀 {gene.chromosome}
      </p>

      <section className="mt-6 rounded-xl bg-brand-500/10 p-4 ring-1 ring-brand-500/20">
        <h2 className="mb-1 text-xs font-semibold text-brand-400">쉬운 설명</h2>
        <p className="leading-relaxed text-fg">{gene.easyExplanation}</p>
      </section>

      {gene.guide && (
        <dl className="mt-4 space-y-3 rounded-xl border border-line p-4 text-sm leading-relaxed">
          {[
            ["하는 일", gene.guide.role],
            ["작동 방식", gene.guide.how],
            ["문제가 생기면", gene.guide.ifBroken],
          ].map(([label, text]) => (
            <div key={label}>
              <dt className="text-xs font-semibold text-brand-400">{label}</dt>
              <dd className="text-fg">{text}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/?focus=${gene.symbol}`}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          인체 지도에서 보기
        </Link>
        <Link
          href={`/?gene=${gene.symbol}`}
          className="rounded-lg border border-line px-4 py-2 text-sm text-fg hover:border-brand-500"
        >
          도감 열기 (단백질 3D 구조·최신 논문)
        </Link>
      </div>

      <section className="mt-8 space-y-4 text-sm">
        {organs.length > 0 && (
          <div>
            <h2 className="mb-1 text-xs font-semibold text-fg-faint">일하는 장기</h2>
            <p className="text-fg">{organs.map((o) => o.name).join(" · ")}</p>
          </div>
        )}
        {pathways.length > 0 && (
          <div>
            <h2 className="mb-1 text-xs font-semibold text-fg-faint">관련 패스웨이</h2>
            <ul className="space-y-1">
              {pathways.map((p) => (
                <li key={p.id}>
                  <Link href={`/pathway/${p.id}`} className={link}>
                    {p.name}
                  </Link>{" "}
                  <span className="text-xs text-fg-faint">
                    {p.source} {p.sourceId}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className="mb-1 text-xs font-semibold text-fg-faint">원본 데이터</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={`https://www.ncbi.nlm.nih.gov/gene/${gene.geneId}`} className={link}>
              NCBI Gene ↗
            </a>
            <a href={`https://www.uniprot.org/uniprotkb/${gene.uniprot}`} className={link}>
              UniProt {gene.uniprot} ↗
            </a>
            {gene.proteinPdbId && (
              <a href={`https://www.rcsb.org/structure/${gene.proteinPdbId}`} className={link}>
                PDB {gene.proteinPdbId} ↗
              </a>
            )}
          </div>
        </div>
      </section>

      <p className="mt-10 text-[11px] leading-relaxed text-fg-faint">
        학습·연구 참고용 정보입니다. 의학적 진단이나 치료 판단에 쓸 수 없으며, 건강
        문제는 의료진과 상담하세요.
      </p>
    </main>
  );
}
