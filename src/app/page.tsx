"use client";

import { useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { bindAtlasToUrl, useAtlas } from "@/store/useAtlas";
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
  const sheetOpen = useAtlas((s) => s.sheetOpen);
  // 자식 useEffect(Sidebar의 setSheetOpen 등)가 먼저 set 하면 persist 가 기본값으로
  // 저장소를 덮어쓴다. 레이아웃 이펙트는 모든 useEffect 보다 먼저 돌아 복원이 앞선다.
  useLayoutEffect(() => bindAtlasToUrl(), []);

  // 탐색 깊이에 따라 중앙 뷰 전환:
  //  body        → 2D 인체 바디맵 (누구나 알아보는 진입 화면)
  //  organ/tissue→ 3D 뇌 (조직 레이어 탐색)
  //  pathway     → 유전자 네트워크
  const view =
    level === "body" ? "body" : level === "pathway" ? "network" : "scene";

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* 중앙 뷰 (탐색 깊이에 따라 전환). 모바일에서 시트가 열리면 3D는 시트 위 공간에 맞춘다.
          네트워크(Cytoscape)는 컨테이너 크기 변화를 따라가지 않아 제외하고, 대신 데스크톱에서는
          노드가 사이드바 뒤에 배치되지 않도록 처음부터 사이드바 폭만큼 비운다. */}
      <div
        className={`absolute inset-0 ${
          sheetOpen && view !== "network" ? "max-lg:bottom-[55dvh]" : ""
        } ${view === "scene" ? "max-lg:top-24" : ""} ${
          view === "network" ? "lg:right-[21rem]" : ""
        }`}
      >
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
