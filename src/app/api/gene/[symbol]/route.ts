import { GENES } from "@/lib/genes";
import { fetchNcbiGene, fetchPubmed, mergeGene } from "@/lib/ncbi";

// 유전자 정보는 거의 변하지 않음 → 라우트/upstream 모두 하루 캐시
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const base = GENES[symbol]; // 큐레이션 = 씨앗(geneId) + 폴백

  if (!base) {
    return Response.json({ error: "unknown symbol" }, { status: 404 });
  }

  try {
    const [ncbi, pubmed] = await Promise.all([
      fetchNcbiGene(base.geneId),
      fetchPubmed(base.symbol),
    ]);
    return Response.json(mergeGene(base, { ncbi, pubmed }));
  } catch {
    // API 장애/rate limit 등 → 앱이 깨지지 않도록 큐레이션을 폴백으로 200 반환
    return Response.json({
      ...base,
      _meta: { source: "fallback" as const },
    });
  }
}
