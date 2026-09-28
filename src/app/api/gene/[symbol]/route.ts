import { GENES } from "@/lib/genes";
import { fetchExternalGene, fetchNcbiGene, fetchPubmed, mergeGene } from "@/lib/ncbi";
import { GENE_SYMBOL } from "@/lib/types";

// 유전자 정보는 거의 변하지 않음 → 라우트/upstream 모두 하루 캐시
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const base = GENES[symbol]; // 큐레이션 = 씨앗(geneId) + 폴백

  if (!base) {
    // 도감 밖 유전자 — 기호 형태만 받아 NCBI 기본 정보를 돌려준다
    if (!GENE_SYMBOL.test(symbol)) {
      return Response.json({ error: "unknown symbol" }, { status: 404 });
    }
    try {
      const ext = await fetchExternalGene(symbol);
      if (!ext) {
        return Response.json({ error: "unknown symbol" }, { status: 404 });
      }
      return Response.json(ext, {
        headers: { "cache-control": `public, s-maxage=${revalidate}` },
      });
    } catch {
      return Response.json({ error: "upstream" }, { status: 502 });
    }
  }

  try {
    const [ncbi, pubmed] = await Promise.all([
      fetchNcbiGene(base.geneId),
      fetchPubmed(base.geneId),
    ]);
    // 폴백 응답은 CDN에 남기지 않는다 — 장애가 풀리면 바로 실데이터로 돌아오도록
    return Response.json(mergeGene(base, { ncbi, pubmed }), {
      headers: { "cache-control": `public, s-maxage=${revalidate}` },
    });
  } catch {
    // API 장애/rate limit 등 → 앱이 깨지지 않도록 큐레이션을 폴백으로 200 반환
    return Response.json({
      ...base,
      _meta: { source: "fallback" as const },
    });
  }
}
