"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { PDBLoader } from "three/examples/jsm/loaders/PDBLoader.js";
import * as THREE from "three";
import { useStructure } from "@/hooks/useStructure";

// 결정 파일엔 단백질 복사본이 여러 개(체인 A·B·C·D) + 물 분자 수백 개가 섞여 있다.
// 깨끗한 "단백질 한 개"만 보이도록 체인 하나만 남기고 물(HOH)을 걷어낸다.
// 결합(CONECT)은 양쪽 원자가 모두 남아있는 것만 유지해 PDBLoader가 깨지지 않게 한다.
function filterPdb(text: string, chain = "A"): string {
  // NMR 구조는 같은 단백질의 모델 20여 개가 한 파일에 겹쳐 들어있다.
  // 그대로 파싱하면 전부 포개져 털뭉치가 되므로(예: PLN 2KYV = 89,100원자) 첫 모델만 쓴다.
  const endOfFirstModel = text.indexOf("\nENDMDL");
  const lines = (
    endOfFirstModel === -1 ? text : text.slice(0, endOfFirstModel)
  ).split("\n");

  const kept = new Set<number>();
  const out: string[] = [];

  // 1차: 지정 체인의 원자(물 제외)만 남기고 헤더 등은 그대로 통과
  for (const line of lines) {
    const rec = line.slice(0, 6);
    if (rec.startsWith("ATOM") || rec === "HETATM") {
      const ch = line[21];
      const res = line.slice(17, 20).trim();
      if (ch === chain && res !== "HOH") {
        kept.add(parseInt(line.slice(6, 11)));
        out.push(line);
      }
    } else if (!rec.startsWith("CONECT")) {
      out.push(line);
    }
  }

  // 지정 체인이 비어있는 특이 구조 → 원본 그대로 폴백
  if (kept.size === 0) return text;

  // 2차: 참조 원자가 모두 남아있는 CONECT만 유지 (헴 내부 결합 등)
  for (const line of lines) {
    if (!line.startsWith("CONECT")) continue;
    const serials: number[] = [];
    for (let s = 6; s + 5 <= line.length; s += 5) {
      const n = parseInt(line.slice(s, s + 5));
      if (!isNaN(n)) serials.push(n);
    }
    if (serials.length > 1 && serials.every((n) => kept.has(n))) out.push(line);
  }

  return out.join("\n");
}

// 유전자 단백질의 실제 3D 구조를 렌더 (원자=인스턴스 스피어, 결합=라인).
// 실험 구조(RCSB PDB)가 우선이고, 없으면 AlphaFold 예측 모델로 폴백한다.
// "공간으로 이해하는 생물학"을 유전자 레벨에서 그대로 실현하는 뷰어.
export function ProteinViewer({
  pdbId,
  chain = "A",
  uniprot,
}: {
  pdbId?: string;
  chain?: string;
  uniprot?: string;
}) {
  // 실험 구조가 없는 단백질(예: 네프린·포도신)도 AlphaFold로 항상 보여준다.
  const predicted = !pdbId;
  const key = pdbId ?? `AF-${uniprot}`;
  const pdbText = useStructure(key); // Suspense — 로딩 동안 상위 스켈레톤

  if (!pdbText) return <NoStructure pdbId={pdbId} uniprot={uniprot} />;

  return (
    <div
      className="relative h-56 w-full overflow-hidden rounded-xl ring-1 ring-line"
      style={{
        background:
          "linear-gradient(to bottom, var(--scene-from), var(--scene-to))",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 42], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[12, 14, 18]} intensity={1.1} />
        <directionalLight position={[-10, -6, -8]} intensity={0.35} color="#818cf8" />
        {/* 예측 모델은 체인이 하나뿐이라 항상 A */}
        <Molecule pdbText={pdbText} chain={predicted ? "A" : chain} />
        <OrbitControls enablePan={false} enableZoom minDistance={16} maxDistance={90} makeDefault />
      </Canvas>
      <div className="pointer-events-none absolute bottom-1.5 right-2 rounded bg-black/25 px-1.5 py-0.5 text-[10px] text-white/80">
        {predicted
          ? `AlphaFold 예측 · ${uniprot} · 드래그로 회전`
          : `PDB ${pdbId} · RCSB · 드래그로 회전`}
      </div>
    </div>
  );
}

function Molecule({ pdbText, chain }: { pdbText: string; chain: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // PDB 파싱 → 중심 정렬 + 화면에 맞는 스케일 계산 (한 번만)
  const { geometryAtoms, geometryBonds, count, scale } = useMemo(() => {
    const pdb = new PDBLoader().parse(filterPdb(pdbText, chain));
    const gAtoms = pdb.geometryAtoms as THREE.BufferGeometry;
    const gBonds = pdb.geometryBonds as THREE.BufferGeometry;

    gAtoms.computeBoundingBox();
    const box = gAtoms.boundingBox ?? new THREE.Box3();
    const center = new THREE.Vector3();
    box.getCenter(center).negate();
    gAtoms.translate(center.x, center.y, center.z);
    gBonds.translate(center.x, center.y, center.z);

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    return {
      geometryAtoms: gAtoms,
      geometryBonds: gBonds,
      count: gAtoms.getAttribute("position").count,
      scale: 26 / maxDim, // 카메라 z=42 화각에 맞춰 대략 채움
    };
  }, [pdbText, chain]);

  // 인스턴스별 위치·색(CPK) 주입
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const pos = geometryAtoms.getAttribute("position");
    const col = geometryAtoms.getAttribute("color");
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      dummy.position.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.setRGB(col.getX(i), col.getY(i), col.getZ(i)));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [geometryAtoms, count]);

  // 은은한 자동 회전 (사용자가 드래그하면 OrbitControls가 우선)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial roughness={0.45} metalness={0.1} />
      </instancedMesh>
      <lineSegments geometry={geometryBonds}>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.5} />
      </lineSegments>
    </group>
  );
}

function NoStructure({ pdbId, uniprot }: { pdbId?: string; uniprot?: string }) {
  const href = pdbId
    ? `https://www.rcsb.org/structure/${pdbId}`
    : `https://alphafold.ebi.ac.uk/entry/${uniprot}`;
  return (
    <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-line text-center">
      <span className="text-xs text-fg-faint">3D 구조를 불러오지 못했습니다</span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-brand-400 hover:underline"
      >
        {pdbId ? `RCSB에서 PDB ${pdbId} 보기 ↗` : `AlphaFold에서 ${uniprot} 보기 ↗`}
      </a>
    </div>
  );
}
