"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useAtlas } from "@/store/useAtlas";
import { TopBar } from "@/components/ui/TopBar";
import { Sidebar } from "@/components/ui/Sidebar";
import { Minimap } from "@/components/ui/Minimap";
import { StepGuide } from "@/components/ui/StepGuide";
import { GeneModal } from "@/components/GeneModal";
import { GeneBodyPanel, MultiOrganHint } from "@/components/ui/GeneBodyPanel";

// 브라우저 전용(WebGPU/WebGL, Cytoscape) — SSR 비활성화
const HumanScene = dynamic(
  () => import("@/components/scene/HumanScene").then((m) => m.HumanScene),
  { ssr: false, loading: () => <CenterLoader label="인체 모델 로딩 중…" /> }
);
const Scene3D = dynamic(
  () => import("@/components/scene/Scene3D").then((m) => m.Scene3D),
  { ssr: false, loading: () => <CenterLoader label="3D 씬 로딩 중…" /> }
);
const NetworkView = dynamic(
  () => import("@/components/network/NetworkView").then((m) => m.NetworkView),
  { ssr: false, loading: () => <CenterLoader label="네트워크 로딩 중…" /> }
);

export default function Home() {
  const level = useAtlas((s) => s.level);

  // 탐색 깊이에 따라 중앙 뷰 전환:
  //  body        → 2D 인체 바디맵 (누구나 알아보는 진입 화면)
  //  organ/tissue→ 3D 뇌 (조직 레이어 탐색)
  //  pathway     → 유전자 네트워크
  const view =
    level === "body" ? "body" : level === "pathway" ? "network" : "scene";

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* 중앙 뷰 (탐색 깊이에 따라 전환) */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            className="h-full w-full"
            initial={{ opacity: 0, scale: view === "network" ? 1.04 : 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {view === "body" && <HumanScene />}
            {view === "scene" && <Scene3D />}
            {view === "network" && <NetworkView />}
          </motion.div>
        </AnimatePresence>
      </div>

      <TopBar />
      <Minimap />
      <Sidebar />
      <StepGuide />
      <MultiOrganHint />
      <GeneBodyPanel />
      <GeneModal />
    </main>
  );
}

function CenterLoader({ label }: { label: string }) {
  return (
    <div className="grid h-full w-full place-items-center bg-canvas">
      <div className="flex flex-col items-center gap-3 text-fg-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand-500" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
