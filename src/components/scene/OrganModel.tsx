"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getOrgan } from "@/lib/atlas";
import { useAtlas } from "@/store/useAtlas";
import { GLBErrorBoundary } from "./HumanScene";

/**
 * 장기 내부 탐색용 3D 모델.
 * 중앙에 장기 형태(HRA 해부학 메시, 없거나 로드 실패 시 절차적 형태)를 그리고,
 * 그 주위로 조직 레이어 노드를 띄워 클릭하면 조직 단계로 진입합니다.
 * 모든 조직 노드/연결선은 atlas 데이터(organ.tissues)에서 그대로 구동됩니다.
 */
export function OrganModel({
  onHraShown,
}: {
  onHraShown?: (shown: boolean) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const organId = useAtlas((s) => s.organId);
  const tissueId = useAtlas((s) => s.tissueId);
  const enterTissue = useAtlas((s) => s.enterTissue);
  const organ = organId ? getOrgan(organId) : null;

  // 조직을 아직 고르지 않았을 때만 아주 천천히 회전 (클릭 방해 최소화)
  useFrame((_, delta) => {
    if (group.current && !tissueId) group.current.rotation.y += delta * 0.04;
  });

  if (!organ) return null;

  return (
    <group ref={group}>
      {/* 장기 본체 (HRA 해부학 메시 또는 절차적 형태) */}
      <OrganCentralMesh
        organId={organ.id}
        color={organ.color}
        onHraShown={onHraShown}
      />

      {/* 조직 레이어 + 중심 연결선 */}
      {organ.tissues.map((tissue) => {
        const active = tissue.id === tissueId;
        return (
          <group key={tissue.id}>
            <Line
              points={[[0, 0.05, 0], tissue.position]}
              color={active ? "#6366f1" : "#7a6f9a"}
              lineWidth={active ? 2 : 1}
              transparent
              opacity={active ? 0.9 : 0.45}
            />
            <TissueLayer
              position={tissue.position}
              name={tissue.name}
              active={active}
              onSelect={() => enterTissue(tissue.id)}
            />
          </group>
        );
      })}

      {/* 조작 안내 (조직 미선택 시) */}
      {!tissueId && (
        <Html center position={[0, 1.5, 0]} distanceFactor={7}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-raised/90 px-3 py-1 text-xs text-fg shadow-lg">
            💡 조직 이름표를 클릭하세요 · 드래그로 회전
          </div>
        </Html>
      )}
    </group>
  );
}

// ── 장기별 중앙 메시 선택 ───────────────────────────────────
// Human Reference Atlas(HuBMAP) 3D Reference Object Library, CC BY 4.0.
// 위는 HRA 레코드가 없어 절차적 형태를 유지한다.
const HRA_MODELS: Record<string, string[]> = {
  brain: ["/models/hra/brain.glb"],
  heart: ["/models/hra/heart.glb"],
  lung: ["/models/hra/lung.glb"],
  liver: ["/models/hra/liver.glb"],
  pancreas: ["/models/hra/pancreas.glb"],
  intestine: ["/models/hra/intestine.glb"],
  kidney: ["/models/hra/kidney-l.glb", "/models/hra/kidney-r.glb"],
};
const HRA_FIT_SIZE = 1.8;

function OrganCentralMesh({
  organId,
  color,
  onHraShown,
}: {
  organId: string;
  color: string;
  onHraShown?: (shown: boolean) => void;
}) {
  const urls = HRA_MODELS[organId];
  if (!urls) return <ProceduralOrgan organId={organId} color={color} />;
  const fallback = <ProceduralOrgan organId={organId} color={color} />;
  return (
    <GLBErrorBoundary key={organId} fallback={fallback}>
      <Suspense fallback={fallback}>
        <HraOrgan
          urls={urls}
          color={organId === "brain" ? "#d78f88" : color}
          onShown={onHraShown}
        />
      </Suspense>
    </GLBErrorBoundary>
  );
}

/** 여러 GLB(좌·우 신장 등)를 한 그룹으로 합친 뒤 중심·크기를 맞춘다. */
function HraOrgan({
  urls,
  color,
  onShown,
}: {
  urls: string[];
  color: string;
  onShown?: (shown: boolean) => void;
}) {
  const gltfs = useGLTF(urls);
  useEffect(() => {
    onShown?.(true);
    return () => onShown?.(false);
  }, [onShown]);
  const model = useMemo(() => {
    const root = new THREE.Group();
    const base = new THREE.Color(color);
    const clones = gltfs.map((g) => g.scene.clone(true));
    let meshCount = 0;
    clones.forEach((c) =>
      c.traverse((o) => o instanceof THREE.Mesh && meshCount++)
    );
    // 뇌처럼 영역 메시가 수백 개 겹치면 반투명이 누적돼 불투명해지므로 낮춘다
    const opacity = meshCount > 50 ? 0.16 : 0.5;
    let i = 0;
    for (const clone of clones) {
      clone.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        // 하위 구조(판막·엽·뇌 영역)가 구분되도록 명도만 조금씩 흔든다
        const tint = base.clone().offsetHSL(0, 0, ((i++ % 5) - 2) * 0.04);
        obj.material = new THREE.MeshStandardMaterial({
          color: tint,
          emissive: tint,
          emissiveIntensity: 0.12,
          roughness: 0.6,
          metalness: 0.05,
          transparent: true,
          opacity,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
      });
      root.add(clone);
    }
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = HRA_FIT_SIZE / Math.max(size.x, size.y, size.z, 1e-6);
    root.position.copy(center).multiplyScalar(-scale);
    root.scale.setScalar(scale);
    return root;
  }, [gltfs, color]);

  return <primitive object={model} />;
}

function ProceduralOrgan({
  organId,
  color,
}: {
  organId: string;
  color: string;
}) {
  switch (organId) {
    case "brain":
      return <BrainMesh />;
    case "heart":
      return <HeartMesh color={color} />;
    case "liver":
      return <LiverMesh color={color} />;
    case "lung":
      return <LungMesh color={color} />;
    case "kidney":
      return <KidneyMesh color={color} />;
    case "stomach":
      return <StomachMesh color={color} />;
    case "pancreas":
      return <PancreasMesh color={color} />;
    case "intestine":
      return <IntestineMesh color={color} />;
    default:
      return <GenericBlob color={color} />;
  }
}

/** 안쪽 조직 노드가 비쳐 보이도록 하는 공용 반투명 재질 */
function OrganMaterial({
  color,
  opacity = 0.5,
}: {
  color: string;
  opacity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.12}
      roughness={0.6}
      metalness={0.05}
      transparent
      opacity={opacity}
      depthWrite={false}
      side={THREE.DoubleSide}
    />
  );
}

// ── 뇌: 구를 노이즈로 변형해 이랑/고랑(주름)을 만든다 ──────────
function BrainMesh() {
  const geometry = useMemo(() => buildBrainGeometry(), []);
  const cerebellum = useMemo(() => buildBrainGeometry(0.7), []);

  return (
    <group>
      {/* 대뇌 (반투명) */}
      <mesh geometry={geometry} position={[0, 0.08, 0]}>
        <meshStandardMaterial
          color="#d78f88"
          emissive="#5a2a2a"
          emissiveIntensity={0.15}
          roughness={0.65}
          metalness={0.05}
          transparent
          opacity={0.5}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 소뇌 (뒤쪽 아래) */}
      <mesh
        geometry={cerebellum}
        position={[0, -0.42, -0.55]}
        scale={[0.5, 0.34, 0.42]}
      >
        <meshStandardMaterial
          color="#c97f78"
          roughness={0.7}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      {/* 뇌간 */}
      <mesh position={[0, -0.62, -0.28]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 0.55, 16]} />
        <meshStandardMaterial
          color="#c98"
          roughness={0.7}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── 심장: 위쪽 두 심방 융기 + 아래로 뾰족한 심첨 + 대동맥 ──────
function HeartMesh({ color }: { color: string }) {
  return (
    <group scale={0.95}>
      {/* 좌·우 심방 융기 */}
      <mesh position={[-0.28, 0.28, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <OrganMaterial color={color} />
      </mesh>
      <mesh position={[0.3, 0.24, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <OrganMaterial color={color} />
      </mesh>
      {/* 심실 본체 → 심첨(아래로 뾰족) */}
      <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0.12]}>
        <coneGeometry args={[0.62, 1.05, 32]} />
        <OrganMaterial color={color} />
      </mesh>
      {/* 대동맥 */}
      <mesh position={[0.02, 0.7, -0.05]} rotation={[0.2, 0, -0.15]}>
        <cylinderGeometry args={[0.12, 0.16, 0.5, 20]} />
        <OrganMaterial color="#f87171" opacity={0.55} />
      </mesh>
    </group>
  );
}

// ── 간: 크고 납작한 우엽 + 작은 좌엽 쐐기 ───────────────────
function LiverMesh({ color }: { color: string }) {
  return (
    <group rotation={[0, 0, -0.08]}>
      {/* 우엽 (크고 넓적) */}
      <mesh position={[0.2, 0, 0]} scale={[1.15, 0.62, 0.85]}>
        <sphereGeometry args={[0.8, 32, 24]} />
        <OrganMaterial color={color} />
      </mesh>
      {/* 좌엽 (작고 얇게) */}
      <mesh position={[-0.72, 0.06, 0.05]} scale={[0.62, 0.4, 0.7]}>
        <sphereGeometry args={[0.7, 28, 20]} />
        <OrganMaterial color={color} />
      </mesh>
    </group>
  );
}

// ── 폐: 좌·우 두 엽 + 중앙 기관/기관지 ─────────────────────
function LungMesh({ color }: { color: string }) {
  return (
    <group>
      {/* 좌·우 폐엽 (안쪽 면을 살짝 눌러 심장 자리 흉내) */}
      <mesh position={[-0.5, -0.05, 0]} scale={[0.5, 0.9, 0.55]}>
        <sphereGeometry args={[0.8, 32, 24]} />
        <OrganMaterial color={color} />
      </mesh>
      <mesh position={[0.5, -0.05, 0]} scale={[0.5, 0.9, 0.55]}>
        <sphereGeometry args={[0.8, 32, 24]} />
        <OrganMaterial color={color} />
      </mesh>
      {/* 기관 */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.5, 16]} />
        <OrganMaterial color="#7dd3fc" opacity={0.6} />
      </mesh>
      {/* 좌·우 주기관지 */}
      <mesh position={[-0.22, 0.42, 0]} rotation={[0, 0, 0.7]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
        <OrganMaterial color="#7dd3fc" opacity={0.6} />
      </mesh>
      <mesh position={[0.22, 0.42, 0]} rotation={[0, 0, -0.7]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
        <OrganMaterial color="#7dd3fc" opacity={0.6} />
      </mesh>
    </group>
  );
}

// ── 신장: 좌·우 강낭콩 모양 두 개 ───────────────────────────
function KidneyMesh({ color }: { color: string }) {
  const bean = useMemo(() => buildBeanGeometry(), []);
  return (
    <group>
      <mesh geometry={bean} position={[-0.5, 0, 0]} rotation={[0, 0, 0.1]}>
        <OrganMaterial color={color} />
      </mesh>
      <mesh
        geometry={bean}
        position={[0.5, 0, 0]}
        rotation={[0, Math.PI, -0.1]}
      >
        <OrganMaterial color={color} />
      </mesh>
    </group>
  );
}

// ── 위: J자 모양 주머니 + 식도·유문 ────────────────────────
function StomachMesh({ color }: { color: string }) {
  return (
    <group rotation={[0, 0, 0.35]}>
      {/* 위 본체 (부풀린 주머니) */}
      <mesh scale={[0.85, 1.15, 0.8]}>
        <sphereGeometry args={[0.75, 32, 24]} />
        <OrganMaterial color={color} />
      </mesh>
      {/* 유문부 (아래로 좁아지는 출구) */}
      <mesh position={[0.5, -0.55, 0]} rotation={[0, 0, -0.6]} scale={[0.55, 0.7, 0.55]}>
        <sphereGeometry args={[0.5, 24, 18]} />
        <OrganMaterial color={color} />
      </mesh>
      {/* 식도 유입부 */}
      <mesh position={[-0.4, 0.72, 0]} rotation={[0, 0, 0.45]}>
        <cylinderGeometry args={[0.1, 0.13, 0.5, 16]} />
        <OrganMaterial color={color} opacity={0.55} />
      </mesh>
    </group>
  );
}

// ── 췌장: 넓은 머리 → 가늘어지는 꼬리 ──────────────────────
function PancreasMesh({ color }: { color: string }) {
  return (
    <group rotation={[0, 0, -0.15]}>
      {/* 머리 (넓은 쪽) */}
      <mesh position={[0.55, -0.1, 0]} scale={[0.7, 0.7, 0.6]}>
        <sphereGeometry args={[0.6, 28, 20]} />
        <OrganMaterial color={color} />
      </mesh>
      {/* 몸통~꼬리 (길게 가늘어짐) */}
      <mesh position={[-0.2, 0.1, 0]} rotation={[0, 0, 0.25]} scale={[1.4, 0.42, 0.5]}>
        <sphereGeometry args={[0.6, 28, 20]} />
        <OrganMaterial color={color} />
      </mesh>
    </group>
  );
}

// ── 장: 구불구불 감긴 관 (torus knot으로 표현) ──────────────
function IntestineMesh({ color }: { color: string }) {
  return (
    <mesh rotation={[0.4, 0, 0]}>
      <torusKnotGeometry args={[0.62, 0.2, 140, 18, 2, 3]} />
      <OrganMaterial color={color} opacity={0.6} />
    </mesh>
  );
}

function GenericBlob({ color }: { color: string }) {
  return (
    <mesh>
      <icosahedronGeometry args={[0.9, 2]} />
      <OrganMaterial color={color} />
    </mesh>
  );
}

// ── 지오메트리 빌더 ─────────────────────────────────────────
/** 이랑/고랑 패턴 + 세로 대뇌열을 가진 뇌 지오메트리 */
function buildBrainGeometry(amp = 1) {
  const geo = new THREE.SphereGeometry(1, 160, 160);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const rx = 0.95;
  const ry = 0.74;
  const rz = 0.92;
  const dir = new THREE.Vector3();
  const wrinkle = 0.055 * amp;

  for (let i = 0; i < pos.count; i++) {
    dir.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();

    const s = 6.0;
    const n =
      Math.sin(dir.x * s) * Math.cos(dir.y * s * 1.1) * 0.5 +
      Math.sin(dir.y * s * 1.7 + 1.3) * Math.cos(dir.z * s * 1.3) * 0.3 +
      Math.sin(dir.z * s * 2.3 + 2.1) * Math.cos(dir.x * s * 1.9) * 0.2;

    const fissure =
      Math.exp(-(dir.x * dir.x) / 0.012) * Math.max(0, dir.y) * 0.16;

    const r = 1 + n * wrinkle - fissure;
    pos.setXYZ(i, dir.x * rx * r, dir.y * ry * r, dir.z * rz * r);
  }

  geo.computeVertexNormals();
  return geo;
}

/** 한쪽 옆구리를 안으로 눌러 강낭콩(신장) 형태를 만든 지오메트리 */
function buildBeanGeometry() {
  const geo = new THREE.SphereGeometry(0.55, 48, 48);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    // 세로로 길쭉하게
    v.y *= 1.5;
    v.x *= 0.85;
    // 안쪽(+x, 중앙 높이)을 오목하게 눌러 콩팥의 문(hilum)을 만든다
    const dent = Math.exp(-((v.y * v.y) / 0.25)) * Math.max(0, v.x) * 0.5;
    v.x -= dent;
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

// ── 조직 노드 (장기 공통) ───────────────────────────────────
function TissueLayer({
  position,
  name,
  active,
  onSelect,
}: {
  position: [number, number, number];
  name: string;
  active: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
  });

  const color = active ? "#6366f1" : "#6b82b3";

  return (
    <group position={position}>
      <mesh
        ref={ref}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.9 : 0.45}
          flatShading
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
      <Html center distanceFactor={6} position={[0, 0.38, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`cursor-pointer select-none whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium shadow-lg ${
            active
              ? "bg-brand-500 text-white"
              : "bg-raised/90 text-fg hover:bg-subtle"
          }`}
        >
          {name}
        </div>
      </Html>
    </group>
  );
}
