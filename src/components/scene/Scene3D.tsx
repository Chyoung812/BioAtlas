"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useTheme } from "next-themes";
import { useAtlas } from "@/store/useAtlas";
import { getOrgan } from "@/lib/atlas";
import { OrganModel } from "./OrganModel";
import { hasWebGL } from "./HumanScene";

// 장기 내부 탐색용 3D 씬.
// 전신 진입은 2D BodyMap이 담당하고, 이 씬은 선택된 장기의 조직 레이어를 보여준다.
export function Scene3D() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  const bg = dark ? "#0a0e1a" : "#eef2f7"; // 씬 배경/포그를 테마에 맞춤
  const [hraShown, setHraShown] = useState(false);
  const [webgl] = useState(hasWebGL);

  if (!webgl) return <TissueList />;

  return (
    <div className="relative h-full w-full">
      <Canvas
        // 앞쪽 위 조직 이름표(y≈1.1)와 조작 안내(y=1.5)가 상단 바에 가리지 않을 거리
        camera={{ position: [0, 0.1, 4.4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, 6, 14]} />
        <ambientLight intensity={dark ? 0.6 : 0.9} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} />
        <pointLight position={[-5, -2, -5]} intensity={0.5} color="#6366f1" />

        {/* 별자리 배경은 어두운 배경에서만 보이므로 다크에서만 렌더 */}
        {dark && (
          <Stars radius={40} depth={30} count={1000} factor={3} fade speed={0.5} />
        )}

        <Suspense fallback={null}>
          <OrganModel onHraShown={setHraShown} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={6}
          autoRotate={false}
          makeDefault
        />
      </Canvas>
      {hraShown && (
        <a
          href="https://humanatlas.io/3d-reference-library"
          target="_blank"
          rel="noreferrer"
          className="absolute left-3 top-1 z-10 text-[10px] text-fg-faint hover:text-fg-muted md:bottom-4 md:left-4 md:top-auto"
        >
          3D 장기 모델: Human Reference Atlas (HuBMAP) · CC BY 4.0
        </a>
      )}
    </div>
  );
}

// WebGL을 쓸 수 없는 브라우저 — 캔버스 대신 조직 목록으로 탐색을 잇는다
function TissueList() {
  const organId = useAtlas((s) => s.organId);
  const tissueId = useAtlas((s) => s.tissueId);
  const enterTissue = useAtlas((s) => s.enterTissue);
  const organ = organId ? getOrgan(organId) : undefined;

  return (
    <div className="grid h-full w-full place-items-center bg-canvas p-6">
      <div className="max-w-sm text-center">
        <p className="text-sm text-fg-muted">
          이 브라우저에서는 3D 장기 모델을 표시할 수 없어요. 아래에서 조직을
          골라 계속 탐색하세요.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {organ?.tissues.map((t) => (
            <button
              key={t.id}
              onClick={() => enterTissue(t.id)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                t.id === tissueId
                  ? "border-brand-500 bg-brand-500/10 text-fg"
                  : "border-line text-fg-muted hover:border-brand-500 hover:text-fg"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
