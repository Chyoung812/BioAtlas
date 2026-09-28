"use client";

import { useEffect, useRef } from "react";
import cytoscape, { Core } from "cytoscape";
import { useTheme } from "next-themes";
import { getPathway } from "@/lib/atlas";
import { useAtlas } from "@/store/useAtlas";
import { GeneNode, GeneEdge } from "@/lib/types";

const ROLE_COLOR: Record<string, string> = {
  oncogene: "#ef4444",
  tumor_suppressor: "#3b82f6",
  signaling: "#f15b16",
  structural: "#a855f7",
};

const ROLE_LABEL: Record<string, string> = {
  oncogene: "종양 유전자",
  tumor_suppressor: "종양 억제 유전자",
  signaling: "신호 전달",
  structural: "구조 단백질",
};

// 유전자 네트워크 ("별자리" 느낌의 force-directed 시각화)
export function NetworkView() {
  const pathwayId = useAtlas((s) => s.pathwayId);
  const openGene = useAtlas((s) => s.openGene);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";

  useEffect(() => {
    if (!containerRef.current || !pathwayId) return;
    const pathway = getPathway(pathwayId);
    if (!pathway) return;

    const { nodes, edges } = pathway.network;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...nodes.map((n: GeneNode) => ({
          data: {
            id: n.id,
            label: n.label,
            color: ROLE_COLOR[n.role ?? "signaling"],
            contextual: n.membership === "contextual",
          },
        })),
        ...edges.map((e: GeneEdge, i) => ({
          data: {
            id: `e${i}`,
            source: e.source,
            target: e.target,
            mechanism: e.mechanism,
          },
        })),
      ],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            label: "data(label)",
            color: dark ? "#e2e8f0" : "#1e293b",
            "font-size": "13px",
            "font-weight": 600,
            "text-valign": "bottom",
            "text-margin-y": 5,
            // 라벨이 이웃 노드 위에 겹쳐도 읽히도록 배경을 깐다
            "text-background-color": dark ? "#0a0e1a" : "#ffffff",
            "text-background-opacity": 0.75,
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
            width: 28,
            height: 28,
            "border-width": 2,
            "border-color": dark ? "#0a0e1a" : "#ffffff",
            "transition-property": "width height border-width",
            "transition-duration": 150,
          },
        },
        // 출처 경로 밖의 교육용 맥락 유전자: 옅게 + 점선 테두리
        {
          selector: "node[?contextual]",
          style: {
            "background-opacity": 0.45,
            "border-style": "dashed",
            "border-color": dark ? "#94a3b8" : "#64748b",
          },
        },
        {
          selector: "node:active, node.hover",
          style: { width: 38, height: 38, "border-width": 4 },
        },
        // Activation: 실선 + 화살표 →
        {
          selector: 'edge[mechanism = "activation"]',
          style: {
            width: 2,
            "line-color": dark ? "#64748b" : "#94a3b8",
            "target-arrow-color": dark ? "#64748b" : "#94a3b8",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
        // Inhibition: 실선 + T자형 ⊣
        {
          selector: 'edge[mechanism = "inhibition"]',
          style: {
            width: 2,
            "line-color": "#ef4444",
            "target-arrow-color": "#ef4444",
            "target-arrow-shape": "tee",
            "curve-style": "bezier",
          },
        },
        // Interaction: 점선 (인과 미확정)
        {
          selector: 'edge[mechanism = "interaction"]',
          style: {
            width: 1.5,
            "line-color": dark ? "#475569" : "#cbd5e1",
            "line-style": "dashed",
            "target-arrow-shape": "none",
            "curve-style": "bezier",
          },
        },
      ],
      layout: {
        name: "cose",
        animate: true,
        animationDuration: 600,
        idealEdgeLength: () => 110,
        nodeRepulsion: () => 12000,
        nodeDimensionsIncludeLabels: true,
        padding: 50,
      } as cytoscape.LayoutOptions,
      minZoom: 0.4,
      // 노드가 적은 경로는 화면 맞춤 때 과하게 확대돼 라벨이 겹친다
      maxZoom: 1.6,
    });

    cy.on("tap", "node", (evt) => openGene(evt.target.id()));
    cy.on("mouseover", "node", (evt) => {
      evt.target.addClass("hover");
      if (containerRef.current) containerRef.current.style.cursor = "pointer";
    });
    cy.on("mouseout", "node", (evt) => {
      evt.target.removeClass("hover");
      if (containerRef.current) containerRef.current.style.cursor = "default";
    });

    cyRef.current = cy;
    return () => cy.destroy();
  }, [pathwayId, dark, openGene]);

  const nodes = getPathway(pathwayId ?? "")?.network.nodes ?? [];
  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <NetworkLegend
        source={getPathway(pathwayId ?? "")?.source}
        hasContextual={nodes.some((n) => n.membership === "contextual")}
        roles={[...new Set(nodes.map((n) => n.role ?? "signaling"))]}
      />
    </div>
  );
}

function NetworkLegend({
  source,
  hasContextual,
  roles,
}: {
  source?: string;
  hasContextual: boolean;
  roles: string[];
}) {
  return (
    <div className="panel pointer-events-none absolute left-3 top-[100px] rounded-xl px-3 py-2 text-[11px] leading-relaxed md:bottom-4 md:left-4 md:top-auto">
      <div className="mb-1 font-semibold text-brand-400">범례</div>
      <div className="mb-1 flex flex-wrap gap-x-3">
        {roles.map((r) => (
          <span key={r} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: ROLE_COLOR[r] }}
            />
            {ROLE_LABEL[r]}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-fg-muted">━▸</span> Activation (촉진)
      </div>
      <div className="flex items-center gap-2">
        <span className="text-red-400">━⊣</span> Inhibition (억제)
      </div>
      <div className="flex items-center gap-2">
        <span className="text-fg-faint">┈┈</span> Interaction (상호작용)
      </div>
      {hasContextual && (
        <div className="flex items-center gap-2">
          <span className="text-fg-faint">◌</span> 관련 맥락 ({source} 경로 밖)
        </div>
      )}
      <div className="mt-1 text-[10px] text-fg-faint">
        연결선은 이해를 돕기 위해 단순화한 흐름이에요
      </div>
    </div>
  );
}
