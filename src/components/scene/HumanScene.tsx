"use client";

import {
  Component,
  ReactNode,
  Suspense,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Html,
  Line,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { useAtlas } from "@/store/useAtlas";
import { ORGANS } from "@/lib/atlas";
import { findGeneDistribution } from "@/lib/expression";
import { BodyMap } from "./BodyMap";

/**
 * 정규화된 인체(키=TARGET_HEIGHT, 중심=원점) 기준 장기별 핫스팟 위치.
 * y는 정수리(topY)에 대한 비율, x·z는 씬 단위(+x=화면 오른쪽, +z=정면).
 * 머리(위)→골반(아래) 순서로 해부학적 높이에 맞춰 배치한다.
 *
 * labelDx/labelDy는 이름표만 밀어내는 값(점의 위치는 그대로).
 * 유전자 분포 뷰에서는 여러 장기의 이름표가 동시에 켜지는데, 복부는 핫스팟이
 * 몰려 있어 그대로 두면 이름표끼리 겹쳐 읽을 수 없다. 겹치는 것들만 좌우로 벌린다.
 */
const ORGAN_HOTSPOTS: Record<
  string,
  { x: number; yFactor: number; z: number; labelDx?: number; labelDy?: number }
> = {
  brain: { x: 0.0, yFactor: 0.95, z: 0.08 },
  // 오른쪽 열 — 아래로 갈수록 x를 엇갈리게 벌려 이름표가 세로로 쌓이지 않게 한다.
  lung: { x: 0.12, yFactor: 0.56, z: 0.12, labelDx: 0.32 },
  stomach: { x: 0.2, yFactor: 0.31, z: 0.15, labelDx: 0.54, labelDy: 0.1 },
  pancreas: { x: 0.0, yFactor: 0.25, z: 0.1, labelDx: 0.66, labelDy: -0.02 },
  intestine: { x: 0.02, yFactor: 0.13, z: 0.14, labelDx: 0.46, labelDy: -0.08 },
  // 왼쪽 열
  heart: { x: -0.07, yFactor: 0.47, z: 0.16, labelDx: -0.34 },
  liver: { x: -0.2, yFactor: 0.34, z: 0.15, labelDx: -0.46 },
  kidney: { x: -0.26, yFactor: 0.28, z: -0.02, labelDx: -0.6, labelDy: -0.12 },
};

/**
 * 실제 인체 .glb 파일 경로.
 * `public/models/human.glb`를 넣으면 자동으로 이 3D 모델이 뜨고,
 * 로딩에 실패하면(404·네트워크·손상 등) 2D 바디맵(BodyMap)으로 안전하게 대체됩니다.
 * (CC0/무료 모델 구하는 법은 public/models/README.md 참고)
 */
const HUMAN_GLB_URL = "/models/human.glb";
const TARGET_HEIGHT = 3.2; // 씬 안에서 모델을 이 키(높이)로 자동 정규화

// 모듈 로드 시점부터 glb를 미리 받아 스피너 노출 시간을 최소화한다.
useGLTF.preload(HUMAN_GLB_URL);

export function HumanScene() {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "linear-gradient(to bottom, var(--scene-from), var(--scene-to))",
      }}
    >
      {/* 안내는 상단 브레드크럼 + 하단 StepGuide가 담당 (중복 헤더 제거) */}

      {/* glb 로딩에 실패했을 때만 BodyMap(2D)으로 영구 대체(런타임 안전망).
          로딩 중에는 중립 스피너를 보여줘 2D 졸라맨이 깜빡이지 않게 한다. */}
      <GLBErrorBoundary fallback={<BodyMap />}>
        <Suspense fallback={<SceneLoading />}>
          <Canvas
            camera={{ position: [0, 0.2, 6], fov: 42 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            shadows
          >
            {/* Canvas를 투명하게 두고 래퍼 div의 테마 그라디언트가 비치게 한다 */}
            <hemisphereLight args={["#dfe7ff", "#1a2238", 0.7]} />
            <directionalLight
              position={[4, 8, 6]}
              intensity={1.3}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight position={[-6, 3, -4]} intensity={0.4} color="#818cf8" />

            <HumanModelFit url={HUMAN_GLB_URL} />

            <ContactShadows
              position={[0, -TARGET_HEIGHT / 2, 0]}
              opacity={0.5}
              scale={8}
              blur={2.4}
              far={4}
              color="#000000"
            />

            <OrbitControls
              enablePan={false}
              minDistance={3.5}
              maxDistance={9}
              target={[0, 0, 0]}
              makeDefault
            />
          </Canvas>
        </Suspense>
      </GLBErrorBoundary>
    </div>
  );
}

/** glb 로딩 중 표시할 중립 스피너 (2D 졸라맨 대신). 씬 배경과 톤을 맞춘다. */
function SceneLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
        <div className="text-xs text-fg-faint">인체 모델 불러오는 중…</div>
      </div>
    </div>
  );
}

/** glb를 불러와 자동으로 중심 정렬 + 키 정규화하고, 장기 클릭 핫스팟을 얹는다 */
function HumanModelFit({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const enterOrgan = useAtlas((s) => s.enterOrgan);
  const geneFocus = useAtlas((s) => s.geneFocus);
  const group = useRef<THREE.Group>(null);

  // 유전자 분포 뷰: 해당 유전자가 발현되는 장기만 살리고 나머지는 죽인다.
  // geneFocus가 없으면 hitOrgans는 null → 전부 평소대로.
  const hitOrgans = useMemo(() => {
    if (!geneFocus) return null;
    const dist = findGeneDistribution(geneFocus);
    return dist ? new Set(dist.organIds) : new Set<string>();
  }, [geneFocus]);

  // 다운로드한 모델마다 크기·중심이 제각각 → 자동 보정
  const { object, topY } = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = TARGET_HEIGHT / (size.y || 1);
    clone.scale.setScalar(scale);
    clone.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale
    );
    return { object: clone, topY: (size.y / 2) * scale };
  }, [scene]);

  // 자동 회전은 하지 않는다. 몸이 저절로 돌면 핫스팟이 뒷면으로 넘어가 클릭하기
  // 어렵기 때문. 사용자는 OrbitControls로 필요할 때만 직접 돌려 볼 수 있고,
  // 핫스팟은 같은 그룹에 있어 그때도 몸에 붙은 채 함께 움직인다.

  return (
    // 핫스팟을 회전 그룹 안에 두어 인체가 돌아도 장기가 몸에 정확히 붙어 있게 한다.
    // (이름표는 Html이라 항상 카메라를 향하고, 점은 구체라 회전에 영향받지 않는다.)
    <group ref={group}>
      <primitive object={object} />
      {ORGANS.map((organ) => {
        const spot = ORGAN_HOTSPOTS[organ.id];
        if (!spot) return null;
        return (
          <OrganHotspot
            key={organ.id}
            position={[spot.x, topY * spot.yFactor, spot.z]}
            labelOffset={[spot.labelDx ?? 0, 0.2 + (spot.labelDy ?? 0), 0]}
            label={organ.name}
            color={organ.color}
            onClick={() => enterOrgan(organ.id)}
            // 분포 뷰가 켜져 있을 때만 강조/약화. 꺼져 있으면 둘 다 false.
            highlighted={hitOrgans?.has(organ.id) ?? false}
            dimmed={hitOrgans ? !hitOrgans.has(organ.id) : false}
          />
        );
      })}
    </group>
  );
}

/**
 * 장기 핫스팟: 기본은 장기색 점만 표시하고, 마우스를 올리면 이름표가 나타난다.
 * (여러 장기가 몸통에 몰려 있어 이름표를 항상 띄우면 서로 겹치므로 호버 시에만 노출)
 */
function OrganHotspot({
  position,
  labelOffset = [0, 0.2, 0],
  label,
  color,
  onClick,
  highlighted = false,
  dimmed = false,
}: {
  position: [number, number, number];
  /** 이름표만 밀어내는 오프셋 — 복부 이름표 겹침 방지 */
  labelOffset?: [number, number, number];
  label: string;
  color: string;
  onClick: () => void;
  /** 분포 뷰에서 이 유전자가 발현되는 장기 */
  highlighted?: boolean;
  /** 분포 뷰에서 발현되지 않는 장기 */
  dimmed?: boolean;
}) {
  const dot = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dot.current) {
      // 강조된 장기는 더 크고 확실하게 뛴다. 약화된 장기는 아예 멈춘다.
      const pulse = dimmed ? 1 : 1 + Math.sin(t * 2.5) * (highlighted ? 0.3 : 0.18);
      const base = highlighted ? 1.6 : dimmed ? 0.7 : 1;
      dot.current.scale.setScalar(pulse * base * (hovered ? 1.5 : 1));
    }
    // 강조 장기 주변에 퍼지는 후광 — 어디가 켜졌는지 멀리서도 읽히게.
    if (halo.current) {
      const cycle = (t * 0.8) % 1;
      halo.current.scale.setScalar(1 + cycle * 2.2);
      (halo.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 * (1 - cycle);
    }
  });

  const over = () => {
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const out = () => {
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  return (
    <group position={position}>
      {/* 넉넉한 투명 히트 영역 (작은 점을 쉽게 겨냥) */}
      <mesh onClick={onClick} onPointerOver={over} onPointerOut={out}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 강조 장기의 퍼지는 후광 */}
      {highlighted && (
        <mesh ref={halo} raycast={() => null}>
          <sphereGeometry args={[0.06, 20, 20]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.35}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* 보이는 장기색 점 */}
      <mesh ref={dot} raycast={() => null}>
        <sphereGeometry args={[0.045, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={highlighted ? 2.2 : 1}
          transparent
          opacity={dimmed ? 0.25 : 1}
          toneMapped={false}
        />
      </mesh>

      {/* 이름표를 옆으로 밀었을 때 어느 점의 것인지 모호해지므로 지시선으로 잇는다.
          (R3F의 raw <line>은 TS가 SVG line으로 해석하므로 drei의 Line을 쓴다) */}
      {highlighted && (labelOffset[0] !== 0 || labelOffset[1] !== 0) && (
        <Line
          points={[[0, 0, 0], labelOffset]}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.5}
        />
      )}

      {/* 강조 장기는 이름표를 상시 노출 (한 화면에서 바로 읽혀야 하므로).
          평소에는 겹침을 피해 호버 시에만 띄운다. */}
      {(hovered || highlighted) && (
        <Html center distanceFactor={11} position={labelOffset}>
          <div
            className={`pointer-events-none whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium shadow-lg ring-1 ${
              highlighted
                ? "bg-brand-500 text-white ring-brand-300/50"
                : "bg-raised/95 text-fg ring-white/10"
            }`}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// glb 로딩 실패(404·네트워크·손상 등) 시 fallback(BodyMap)을 렌더하는 런타임 안전망
class GLBErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
