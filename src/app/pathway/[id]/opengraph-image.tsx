import { ImageResponse } from "next/og";
import { PATHWAYS } from "@/lib/atlas";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BioAtlas 패스웨이";

export function generateStaticParams() {
  return Object.keys(PATHWAYS).map((id) => ({ id }));
}

// 기본 폰트에 한글 글리프가 없어 이미지에는 영문만 넣는다 (한글 이름은 메타 title이 담당)
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const p = PATHWAYS[(await params).id];
  const genes = p?.network.nodes.map((n) => n.id).join(" · ") ?? "";
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
        <div style={{ fontSize: 32, color: "#f15b16", fontWeight: 600 }}>
          BioAtlas · Pathway
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff", lineHeight: 1.1 }}>
            {p?.nameEn ?? "Pathway"}
          </div>
          <div style={{ fontSize: 34, color: "#94a3b8", marginTop: 24 }}>{genes}</div>
        </div>
        <div style={{ fontSize: 28, color: "#64748b" }}>
          {p ? `${p.source} ${p.sourceId}` : ""}
        </div>
      </div>
    ),
    size
  );
}
