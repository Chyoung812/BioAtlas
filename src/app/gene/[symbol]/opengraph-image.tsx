import { ImageResponse } from "next/og";
import { GENES } from "@/lib/genes";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BioAtlas 유전자 도감";

export function generateStaticParams() {
  return Object.keys(GENES).map((symbol) => ({ symbol }));
}

// 기본 폰트에 한글 글리프가 없어 이미지에는 영문만 넣는다 (한글 설명은 메타 description이 담당)
export default async function Image({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const gene = GENES[(await params).symbol];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #0a0e1a 0%, #151b30 100%)",
          color: "#e2e8f0",
        }}
      >
        <div style={{ fontSize: 32, color: "#f15b16", fontWeight: 600 }}>BioAtlas</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 140, fontWeight: 700, color: "#ffffff" }}>
            {gene?.symbol ?? "Gene"}
          </div>
          <div style={{ fontSize: 44, color: "#94a3b8" }}>{gene?.fullName ?? ""}</div>
        </div>
        <div style={{ fontSize: 28, color: "#64748b" }}>
          {gene ? `NCBI Gene ID ${gene.geneId} · Chromosome ${gene.chromosome}` : ""}
        </div>
      </div>
    ),
    size
  );
}
