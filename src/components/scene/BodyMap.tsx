"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ORGANS } from "@/lib/atlas";
import { findGeneDistribution } from "@/lib/expression";
import { useAtlas } from "@/store/useAtlas";

/**
 * 전신 탐색 진입 화면.
 * PRD의 "3D 인체 → 장기" 진입을 누구나 즉시 알아볼 수 있는
 * 정면 해부학 실루엣(2D SVG) + 장기 핫스팟으로 재구성했습니다.
 * 3D는 장기 내부(뇌 조직) 탐색부터 사용합니다.
 */

// SVG viewBox(240×480) 기준 장기의 해부학적 위치
const ORGAN_SPOTS: Record<
  string,
  { x: number; y: number; r: number }
> = {
  brain: { x: 120, y: 44, r: 18 },
  lung: { x: 143, y: 148, r: 14 },
  heart: { x: 111, y: 160, r: 13 },
  liver: { x: 101, y: 194, r: 15 },
  stomach: { x: 139, y: 196, r: 13 },
  pancreas: { x: 121, y: 214, r: 11 },
  kidney: { x: 100, y: 226, r: 11 },
  intestine: { x: 123, y: 246, r: 14 },
};

export function BodyMap() {
  const enterOrgan = useAtlas((s) => s.enterOrgan);
  const geneFocus = useAtlas((s) => s.geneFocus);

  // 유전자 분포 뷰(드릴다운의 역방향). geneFocus가 없으면 null → 전부 평소대로.
  const hitOrgans = useMemo(() => {
    if (!geneFocus) return null;
    const dist = findGeneDistribution(geneFocus);
    return dist ? new Set(dist.organIds) : new Set<string>();
  }, [geneFocus]);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="relative grid h-full w-full place-items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, var(--scene-from), var(--scene-to))",
      }}
    >
      {/* 배경 그리드 (은은한 격자) — 현재 글자색을 따라가 라이트/다크 모두 은은하게 */}
      <div
        className="pointer-events-none absolute inset-0 text-fg opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* 상단 안내 헤더 */}
      <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 text-center">
        <h1 className="text-lg font-semibold text-fg sm:text-xl">
          인체 지도
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          탐색할 장기를 선택하세요 ·{" "}
          <b className="text-brand-400">뇌·심장·폐·간·위·췌장·장·신장</b>을 탐험할 수 있어요
        </p>
      </div>

      {/* 인체 실루엣 */}
      <motion.svg
        viewBox="0 0 240 480"
        className="h-[70vh] max-h-[560px] w-auto drop-shadow-2xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#455a82" />
            <stop offset="55%" stopColor="#33456a" />
            <stop offset="100%" stopColor="#212e49" />
          </linearGradient>
          <radialGradient id="bodyGlow" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 인체 뒤 은은한 광채 */}
        <ellipse cx="120" cy="210" rx="150" ry="230" fill="url(#bodyGlow)" />

        {/* 몸통 실루엣 (해부도 느낌의 매끄러운 형태) */}
        <g fill="url(#bodyGrad)" stroke="#5b7098" strokeWidth="1.5" strokeLinejoin="round">
          {/* 머리 + 턱선 */}
          <path d="M120 8 C138 8 152 24 152 44 C152 60 144 72 134 78 L134 88 L106 88 L106 78 C96 72 88 60 88 44 C88 24 102 8 120 8 Z" />
          {/* 목 */}
          <path d="M108 82 L132 82 L134 98 L106 98 Z" />
          {/* 팔 (어깨→손, 살짝 벌린 자연스러운 곡선) */}
          <path d="M78 106 C64 110 56 124 52 146 L40 232 C39 242 47 248 55 246 C61 244 64 236 65 228 L74 150 C76 134 82 122 92 116 Z" />
          <path d="M162 106 C176 110 184 124 188 146 L200 232 C201 242 193 248 185 246 C179 244 176 236 175 228 L166 150 C164 134 158 122 148 116 Z" />
          {/* 몸통 (어깨→허리 잘록하게) */}
          <path d="M84 100 C100 92 140 92 156 100 C160 128 158 150 154 178 C152 206 150 232 146 252 C120 264 120 264 94 252 C90 232 88 206 86 178 C82 150 80 128 84 100 Z" />
          {/* 골반 */}
          <path d="M92 246 L148 246 C150 268 146 286 140 300 C128 306 112 306 100 300 C94 286 90 268 92 246 Z" />
          {/* 다리 */}
          <path d="M100 292 C96 320 96 360 98 400 C99 430 101 452 104 470 C112 474 118 474 118 470 L119 320 C119 306 116 298 112 292 Z" />
          <path d="M140 292 C144 320 144 360 142 400 C141 430 139 452 136 470 C128 474 122 474 122 470 L121 320 C121 306 124 298 128 292 Z" />
        </g>

        {/* 해부학적 내부 힌트 (아주 옅게 — 갈비뼈·척추·쇄골) */}
        <g
          fill="none"
          stroke="#9fb3d6"
          strokeOpacity="0.16"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          {/* 쇄골 */}
          <path d="M96 108 Q120 118 144 108" />
          {/* 갈비뼈 */}
          <path d="M100 128 Q120 138 140 128" />
          <path d="M98 144 Q120 155 142 144" />
          <path d="M98 160 Q120 171 142 160" />
          <path d="M100 176 Q120 186 140 176" />
          {/* 척추 */}
          <line x1="120" y1="100" x2="120" y2="248" strokeDasharray="2 5" />
          {/* 복부 중심선 */}
          <path d="M120 196 Q118 220 120 246" />
        </g>

        {/* 좌측 하이라이트(광원) */}
        <path
          d="M84 100 C100 92 118 92 120 96 C110 120 106 180 106 252 C100 250 94 250 94 252 C90 232 88 206 86 178 C82 150 80 128 84 100 Z"
          fill="#ffffff"
          fillOpacity="0.05"
        />

        {/* 장기 핫스팟 */}
        {ORGANS.map((organ) => {
          const spot = ORGAN_SPOTS[organ.id];
          if (!spot) return null;
          const isHover = hovered === organ.id;
          return (
            <OrganSpot
              key={organ.id}
              x={spot.x}
              y={spot.y}
              r={spot.r}
              available={organ.available}
              hovered={isHover}
              // 3D(HumanScene)와 동일한 유전자 분포 강조 — glb 폴백 시에도
              // 패널만 뜨고 몸엔 불이 안 켜지는 반쪽 상태가 되지 않게 한다.
              highlighted={hitOrgans?.has(organ.id) ?? false}
              dimmed={hitOrgans ? !hitOrgans.has(organ.id) : false}
              onOver={() => setHovered(organ.id)}
              onOut={() => setHovered((h) => (h === organ.id ? null : h))}
              onClick={() => organ.available && enterOrgan(organ.id)}
            />
          );
        })}
      </motion.svg>

      {/* 장기 라벨 (HTML 오버레이 — SVG 위 절대 위치) */}
      <BodyLabels hovered={hovered} onHover={setHovered} onEnter={enterOrgan} />
    </div>
  );
}

function OrganSpot({
  x,
  y,
  r,
  available,
  hovered,
  highlighted = false,
  dimmed = false,
  onOver,
  onOut,
  onClick,
}: {
  x: number;
  y: number;
  r: number;
  available: boolean;
  hovered: boolean;
  /** 유전자 분포 뷰에서 발현되는 장기 */
  highlighted?: boolean;
  /** 유전자 분포 뷰에서 발현되지 않는 장기 */
  dimmed?: boolean;
  onOver: () => void;
  onOut: () => void;
  onClick: () => void;
}) {
  const color = highlighted ? "#f97316" : available ? "#6366f1" : "#64748b";
  return (
    <g
      style={{ cursor: available ? "pointer" : "not-allowed" }}
      opacity={dimmed ? 0.25 : 1}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={onClick}
    >
      {/* 클릭을 위한 넉넉한 히트 영역 */}
      <circle cx={x} cy={y} r={r + 12} fill="transparent" />

      {/* 사용 가능한 장기: 클릭 유도 펄스 링 */}
      {available && (
        <motion.circle
          cx={x}
          cy={y}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2.1, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      )}

      <motion.circle
        cx={x}
        cy={y}
        r={r}
        fill={color}
        fillOpacity={available ? 0.9 : 0.35}
        stroke={available ? "#c7d2fe" : "#475569"}
        strokeWidth={available ? 2 : 1}
        filter={available ? "url(#soft)" : undefined}
        animate={{ scale: hovered && available ? 1.18 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        style={{ transformOrigin: `${x}px ${y}px` }}
      />

      {/* 잠금 장기: 자물쇠 점 */}
      {!available && (
        <text
          x={x}
          y={y + 3.5}
          textAnchor="middle"
          fontSize="11"
          fill="#cbd5e1"
        >
          🔒
        </text>
      )}
    </g>
  );
}

/** SVG 위에 얹는 장기 이름표 — 사람이 위치/이름을 즉시 인지하도록 */
function BodyLabels({
  hovered,
  onHover,
  onEnter,
}: {
  hovered: string | null;
  onHover: (id: string | null) => void;
  onEnter: (id: string) => void;
}) {
  // SVG(240×480, 70vh)와 정렬되도록 퍼센트로 배치
  const pct = (n: number, total: number) => `${(n / total) * 100}%`;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="relative h-[70vh] max-h-[560px]" style={{ aspectRatio: "240 / 480" }}>
        {ORGANS.map((organ) => {
          const spot = ORGAN_SPOTS[organ.id];
          if (!spot) return null;
          const active = hovered === organ.id;
          return (
            <button
              key={organ.id}
              disabled={!organ.available}
              onPointerOver={() => onHover(organ.id)}
              onPointerOut={() => onHover(null)}
              onClick={() => organ.available && onEnter(organ.id)}
              className={`pointer-events-auto absolute -translate-y-1/2 translate-x-3 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium shadow-lg transition-all ${
                organ.available
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "cursor-not-allowed bg-raised/90 text-fg-muted"
              } ${active ? "scale-105" : ""}`}
              style={{ left: pct(spot.x + spot.r, 240), top: pct(spot.y, 480) }}
            >
              {organ.name}
              {organ.available ? " · 클릭" : " · Phase 2"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
