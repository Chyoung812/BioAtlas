import { PATHWAYS } from "@/lib/atlas";
import { fetchKegg, fetchReactome, mergePathway } from "@/lib/pathways-live";

// 패스웨이 정의는 거의 변하지 않음 → 라우트/upstream 모두 하루 캐시
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const base = PATHWAYS[id]; // 큐레이션 = 씨앗(source/sourceId) + 폴백

  if (!base) {
    return Response.json({ error: "unknown pathway" }, { status: 404 });
  }

  try {
    const live =
      base.source === "KEGG"
        ? await fetchKegg(base.sourceId)
        : base.source === "Reactome"
          ? await fetchReactome(base.sourceId)
          : {}; // NCBI 등: 실 연동 없음 → 확인만
    return Response.json(mergePathway(base, live));
  } catch {
    // API 장애 등 → 큐레이션을 폴백으로 200 반환
    return Response.json({ ...base, _meta: { source: "fallback" as const } });
  }
}
