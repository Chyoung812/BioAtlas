import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PATHWAYS, findPathwayLocation, getOrgan, getPathway, getTissue } from "@/lib/atlas";
import { GENES } from "@/lib/genes";
import { SITE_NAME } from "@/lib/site";

// 공유·검색 유입용 패스웨이 페이지. 네트워크 탐색은 메인 지도(/)에서 이어진다.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PATHWAYS).map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPathway((await params).id);
  if (!p) return {};
  const title = `${p.name} — ${SITE_NAME}`;
  return {
    title,
    description: p.summary,
    alternates: { canonical: `/pathway/${p.id}` },
    openGraph: { title, description: p.summary, url: `/pathway/${p.id}` },
    twitter: { card: "summary_large_image", title, description: p.summary },
  };
}

const EDGE_SYMBOL = { activation: "→", inhibition: "⊣", interaction: "┈" } as const;

export default async function PathwayPage({ params }: Props) {
  const p = getPathway((await params).id);
  if (!p) notFound();
  const loc = findPathwayLocation(p.id);
  const organ = loc ? getOrgan(loc.organId) : undefined;
  const tissue = loc ? getTissue(loc.organId, loc.tissueId) : undefined;
  const members = p.network.nodes.filter((n) => n.membership !== "contextual");
  const context = p.network.nodes.filter((n) => n.membership === "contextual");
  const related = p.relatedPathwayIds.map(getPathway).filter((r) => r !== undefined);

  const link = "text-brand-400 hover:underline";
  const geneLink = (id: string) =>
    GENES[id] ? (
      <Link key={id} href={`/gene/${id}`} className={link}>
        {id}
      </Link>
    ) : (
      <span key={id}>{id}</span>
    );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <Link href="/" className="text-sm text-fg-muted hover:text-fg">
        ← {SITE_NAME} 인체 지도
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-brand-400 sm:text-3xl">{p.name}</h1>
      <p className="mt-1 text-fg-muted">{p.nameEn}</p>
      <p className="mt-1 text-xs text-fg-faint">
        {p.source} {p.sourceId} · {p.category}
        {organ && tissue && ` · ${organ.name} › ${tissue.name}`}
      </p>

      <section className="mt-6 rounded-xl bg-brand-500/10 p-4 ring-1 ring-brand-500/20">
        <h2 className="mb-1 text-xs font-semibold text-brand-400">요약</h2>
        <p className="leading-relaxed text-fg">{p.summary}</p>
      </section>

      {p.guide && (
        <dl className="mt-4 space-y-3 rounded-xl border border-line p-4 text-sm leading-relaxed">
          {[
            ["하는 일", p.guide.role],
            ["작동 방식", p.guide.how],
            ["문제가 생기면", p.guide.ifBroken],
          ].map(([label, text]) => (
            <div key={label}>
              <dt className="text-xs font-semibold text-brand-400">{label}</dt>
              <dd className="text-fg">{text}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6">
        <Link
          href={`/?pathway=${p.id}`}
          className="inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          유전자 네트워크로 보기
        </Link>
      </div>

      <section className="mt-8 space-y-4 text-sm">
        <div>
          <h2 className="mb-1 text-xs font-semibold text-fg-faint">{p.source} 경로 유전자</h2>
          <p className="flex flex-wrap gap-x-3 gap-y-1">{members.map((n) => geneLink(n.id))}</p>
        </div>
        {context.length > 0 && (
          <div>
            <h2 className="mb-1 text-xs font-semibold text-fg-faint">
              관련 맥락 ({p.source} 경로 밖, 이해를 돕기 위해 함께 표시)
            </h2>
            <p className="flex flex-wrap gap-x-3 gap-y-1">{context.map((n) => geneLink(n.id))}</p>
          </div>
        )}
        <div>
          <h2 className="mb-1 text-xs font-semibold text-fg-faint">
            연결 (→ 촉진 · ⊣ 억제 · ┈ 상호작용, 이해를 돕기 위해 단순화)
          </h2>
          <ul className="space-y-0.5 font-mono text-xs text-fg-muted">
            {p.network.edges.map((e, i) => (
              <li key={i}>
                {e.source} {EDGE_SYMBOL[e.mechanism]} {e.target}
              </li>
            ))}
          </ul>
        </div>
        {related.length > 0 && (
          <div>
            <h2 className="mb-1 text-xs font-semibold text-fg-faint">연관 패스웨이</h2>
            <ul className="space-y-1">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/pathway/${r.id}`} className={link}>
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className="mb-1 text-xs font-semibold text-fg-faint">원본 데이터</h2>
          <a href={`https://reactome.org/content/detail/${p.sourceId}`} className={link}>
            {p.source} {p.sourceId} ↗
          </a>
        </div>
      </section>

      <p className="mt-10 text-[11px] leading-relaxed text-fg-faint">
        학습·연구 참고용 정보입니다. 의학적 진단이나 치료 판단에 쓸 수 없으며, 건강
        문제는 의료진과 상담하세요.
      </p>
    </main>
  );
}
