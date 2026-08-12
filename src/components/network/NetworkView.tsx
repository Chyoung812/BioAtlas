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
            "text-margin-y": 6,
            width: 34,
            height: 34,
            "border-width": 2,
            "border-color": dark ? "#0a0e1a" : "#ffffff",
            "transition-property": "width height border-width",
            "transition-duration": 150,
          },
        },
        {
          selector: "node:active, node.hover",
          style: { width: 44, height: 44, "border-width": 4 },
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
        nodeRepulsion: () => 9000,
        padding: 50,
      } as cytoscape.LayoutOptions,
      minZoom: 0.4,
      maxZoom: 2.5,
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

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <NetworkLegend />
    </div>
  );
}

function NetworkLegend() {
  return (
    <div className="panel pointer-events-none absolute bottom-4 left-4 rounded-xl px-3 py-2 text-[11px] leading-relaxed">
      <div className="mb-1 font-semibold text-brand-400">범례</div>
      <div className="flex items-center gap-2">
        <span className="text-fg-muted">━▸</span> Activation (촉진)
      </div>
      <div className="flex items-center gap-2">
        <span className="text-red-400">━⊣</span> Inhibition (억제)
      </div>
      <div className="flex items-center gap-2">
        <span className="text-fg-faint">┈┈</span> Interaction (상호작용)
      </div>
    </div>
  );
}
