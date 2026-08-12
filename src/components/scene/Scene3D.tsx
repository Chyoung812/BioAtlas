"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useTheme } from "next-themes";
import { OrganModel } from "./OrganModel";

// 장기 내부 탐색용 3D 씬.
// 전신 진입은 2D BodyMap이 담당하고, 이 씬은 선택된 장기의 조직 레이어를 보여준다.
export function Scene3D() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  const bg = dark ? "#0a0e1a" : "#eef2f7"; // 씬 배경/포그를 테마에 맞춤

  return (
    <Canvas
      camera={{ position: [0, 0.2, 3.6], fov: 45 }}
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
        <OrganModel />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        autoRotate={false}
        makeDefault
      />
    </Canvas>
  );
}
