// NCBI E-utilities 어댑터
// 실 API 응답(esummary/esearch)을 기존 GeneDetail 타입으로 매핑하고,
// 큐레이션 데이터를 base(=폴백)로 삼아 실데이터를 그 위에 덮어씁니다.
// 서버 전용 모듈 — 클라이언트에서 import 하지 마세요.
import { GeneDetail } from "./types";

// 기본은 NCBI 공식 엔드포인트. 테스트/미러링을 위해 env로 오버라이드 가능.
const BASE =
  process.env.NCBI_BASE ?? "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const DAY = 86400;

// NCBI 예절: 모든 요청에 tool/email 식별자를 붙인다. 키가 있으면 10rps 허용.
function common(): Record<string, string> {
  const p: Record<string, string> = {
    tool: "bioatlas",
    email: process.env.NCBI_EMAIL ?? "bioatlas@example.com",
  };
  if (process.env.NCBI_API_KEY) p.api_key = process.env.NCBI_API_KEY;
  return p;
}

function url(path: string, params: Record<string, string>) {
  const q = new URLSearchParams({ ...common(), ...params });
  return `${BASE}/${path}?${q}`;
}

// upstream 응답을 하루 캐시 → rate limit 사실상 무해화
async function getJson(u: string) {
  const res = await fetch(u, { next: { revalidate: DAY } });
  if (!res.ok) throw new Error(`NCBI ${res.status}`);
  return res.json();
}

/** esummary db=gene → 공식 명칭 / 크로모좀 위치 */
export async function fetchNcbiGene(geneId: string) {
  const json = await getJson(
    url("esummary.fcgi", { db: "gene", id: geneId, retmode: "json" })
  );
  const rec = json?.result?.[geneId];
  if (!rec) throw new Error("gene not found");
  return {
    fullName: rec.nomenclaturename || rec.description || undefined,
    chromosome: rec.maplocation || undefined,
    summary: (rec.summary as string) || undefined,
    aliases:
      typeof rec.otheraliases === "string" && rec.otheraliases
        ? rec.otheraliases.split(",").map((s: string) => s.trim())
        : [],
  };
}

/** elink gene→pubmed(GeneRIF) + esummary → 이 유전자 기능을 다룬 최신 논문 상위 N건 */
export async function fetchPubmed(geneId: string, retmax = 5) {
  // 심볼 텍스트 검색은 SI·INS·APC 같은 일반 약어와 겹치고, 유전자를 목록에서 언급만 한 논문까지 잡힌다.
  // GeneRIF는 NCBI가 해당 geneId(사람)의 기능을 다룬다고 큐레이션한 논문이며, PMID 내림차순으로 온다.
  const link = await getJson(
    url("elink.fcgi", {
      dbfrom: "gene",
      db: "pubmed",
      id: geneId,
      linkname: "gene_pubmed_rif",
      retmode: "json",
    })
  );
  const ids: string[] = (
    link?.linksets?.[0]?.linksetdbs?.[0]?.links ?? []
  ).slice(0, retmax);
  if (ids.length === 0) return [];

  const sum = await getJson(
    url("esummary.fcgi", { db: "pubmed", id: ids.join(","), retmode: "json" })
  );
  return ids
    .map((pmid) => ({ pmid, title: sum?.result?.[pmid]?.title }))
    .filter((p): p is { pmid: string; title: string } => Boolean(p.title));
}

type LiveParts = {
  ncbi?: Awaited<ReturnType<typeof fetchNcbiGene>>;
  pubmed?: Awaited<ReturnType<typeof fetchPubmed>>;
};

/** 큐레이션(base) 위에 실데이터를 얹는다. 없는 필드는 base가 그대로 폴백. */
export function mergeGene(base: GeneDetail, live: LiveParts): GeneDetail {
  return {
    ...base,
    fullName: live.ncbi?.fullName ?? base.fullName,
    chromosome: live.ncbi?.chromosome ?? base.chromosome,
    pubmed: live.pubmed && live.pubmed.length > 0 ? live.pubmed : base.pubmed,
    ncbiSummary: live.ncbi?.summary,
    _meta: { source: "live", fetchedAt: new Date().toISOString() },
  };
}
