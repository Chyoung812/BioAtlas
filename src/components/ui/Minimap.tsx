"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAtlas } from "@/store/useAtlas";
import { getOrgan } from "@/lib/atlas";

// 미니맵 SVG(120×150) 위 장기 마커 위치 (해부학적 대략 위치)
const ORGAN_MARKERS: { id: string; x: number; y: number }[] = [
  { id: "brain", x: 60, y: 24 },
  { id: "lung", x: 52, y: 58 },
  { id: "heart", x: 64, y: 62 },
  { id: "liver", x: 54, y: 76 },
  { id: "kidney", x: 66, y: 86 },
];

// 미니맵 (PRD ⑥): 축소된 전체 인체 + 현재 위치 하이라이트, 열기/닫기 토글
export function Minimap() {
  const { minimapOpen, toggleMinimap, level, organId, tissueId, reset } =
    useAtlas();
  const organName = organId ? getOrgan(organId)?.name : null;
  const activeMarker = ORGAN_MARKERS.find((m) => m.id === organId) ?? null;

  return (
    <div className="absolute left-4 top-16 z-20">
      <AnimatePresence>
        {minimapOpen ? (
          <motion.div
            key="map"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="panel w-44 rounded-2xl p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-fg-muted">
                미니맵
              </span>
              <button
                onClick={toggleMinimap}
                className="text-fg-faint hover:text-fg"
                aria-label="미니맵 닫기"
              >
                ✕
              </button>
            </div>

            {/* 인체 실루엣 SVG */}
            <button
              onClick={reset}
              className="relative mx-auto block"
              title="인체 전체 보기"
            >
              <svg width="120" height="150" viewBox="0 0 120 150">
                {/* 머리 */}
                <circle
                  cx="60"
                  cy="24"
                  r="16"
                  className={
                    organId === "brain"
                      ? "fill-brand-500"
                      : "fill-subtle dark:fill-subtle"
                  }
                  fillOpacity={organId === "brain" ? 0.95 : 0.5}
                />
                {/* 몸통 */}
                <rect
                  x="42"
                  y="42"
                  width="36"
                  height="56"
                  rx="14"
                  className="fill-subtle"
                  fillOpacity={0.45}
                />
                {/* 다리 */}
                <rect x="46" y="98" width="11" height="44" rx="5" className="fill-subtle" fillOpacity={0.4} />
                <rect x="63" y="98" width="11" height="44" rx="5" className="fill-subtle" fillOpacity={0.4} />

                {/* 장기 마커 (현재 위치 강조) */}
                {ORGAN_MARKERS.map((m) => {
                  const active = organId === m.id;
                  return (
                    <circle
                      key={m.id}
                      cx={m.x}
                      cy={m.y}
                      r={active ? 4.5 : 2.6}
                      className={active ? "fill-brand-500" : "fill-fg-muted"}
                      fillOpacity={active ? 1 : 0.5}
                    />
                  );
                })}

                {/* 현재 위치 하이라이트 링 */}
                {activeMarker && (
                  <circle
                    cx={activeMarker.x}
                    cy={activeMarker.y}
                    r="9"
                    className="fill-none stroke-brand-400"
                    strokeWidth="1.6"
                    strokeDasharray="3 2.5"
                  />
                )}
              </svg>
            </button>

            <div className="mt-1 text-center text-[11px] text-fg-muted">
              {level === "body"
                ? "전체 인체"
                : `${organName ?? ""}${tissueId ? " · 조직" : ""}`}
            </div>
          </motion.div>
        ) : (
          // 닫아도 재오픈 아이콘 유지
          <motion.button
            key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleMinimap}
            className="panel grid h-10 w-10 place-items-center rounded-xl text-lg hover:bg-subtle"
            title="미니맵 열기"
            aria-label="미니맵 열기"
          >
            🗺️
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
