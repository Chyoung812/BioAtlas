"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Interactive Micro-Map — 단백질이 세포 안에서 벌이는 사건을 "비트(장면) 시퀀스"로 연기.
// 같은 배우(id)가 비트마다 위치를 옮기며 스토리를 진행한다.
// (예: 시토크롬 c가 미토콘드리아 안 → 구멍 → 밖으로 빠져나오는 흐름)

import {
  Actor,
  INDIGO,
  STORIES,
  genericStory,
} from "@/lib/micromap-stories";

export function MicroMap({
  asset,
  symbol,
}: {
  asset: string;
  symbol: string;
}) {
  const beats = useMemo(
    () => STORIES[asset] ?? genericStory(symbol),
    [asset, symbol]
  );

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => setI(0), [asset]);
  // 매 장면마다 타이머를 다시 건다 → 사용자가 점을 눌러 점프해도 그 장면을
  // 온전히 보여준 뒤 이어서 진행. 마우스를 올리면(paused) 자동진행 정지.
  useEffect(() => {
    if (beats.length <= 1 || paused) return;
    const t = setTimeout(() => setI((p) => (p + 1) % beats.length), 2600);
    return () => clearTimeout(t);
  }, [i, beats.length, paused]);

  const beat = beats[Math.min(i, beats.length - 1)];

  return (
    <div
      className="mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-brand-500/15 via-purple-500/10 to-sky-500/10 p-4 ring-1 ring-brand-500/25"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-brand-300">
        <span className="flex items-center gap-2">
          <span className={paused ? "" : "animate-pulse"}>●</span> Interactive
          Micro-Map
        </span>
        {beats.length > 1 && (
          <span className="text-[10px] font-normal text-fg-faint">
            {paused ? "⏸ 정지 · 점 클릭으로 이동" : "▶ 자동재생"}
          </span>
        )}
      </div>

      {/* 무대 */}
      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[radial-gradient(circle_at_50%_45%,rgba(99,102,241,0.10),transparent_70%)]">
        <AnimatePresence>
          {beat.actors.map((a) => (
            <ActorView key={a.id} actor={a} />
          ))}
        </AnimatePresence>
      </div>

      {/* 캡션 (비트마다 교체) */}
      <div className="mt-2 flex min-h-[2.5rem] items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs leading-relaxed text-fg-muted"
          >
            {beat.caption}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* 진행 표시 겸 장면 선택 (클릭하면 해당 장면으로 점프) */}
      {beats.length > 1 && (
        <div className="mt-1 flex items-center justify-center gap-1">
          {beats.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`${k + 1}번째 장면 보기`}
              aria-current={k === i}
              className="group flex h-5 items-center px-1"
            >
              <span
                className={`h-1.5 rounded-full transition-all ${
                  k === i
                    ? "w-4 bg-brand-400"
                    : "w-1.5 bg-fg-faint/40 group-hover:bg-fg-faint"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActorView({ actor }: { actor: Actor }) {
  const size = actor.size ?? 40;
  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      initial={{ opacity: 0, scale: 0.4, left: `${actor.x}%`, top: `${actor.y}%` }}
      animate={{ opacity: 1, scale: 1, left: `${actor.x}%`, top: `${actor.y}%` }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={{ type: "spring", stiffness: 130, damping: 20 }}
    >
      {actor.emoji ? (
        <span style={{ fontSize: size * 0.82, lineHeight: 1 }}>
          {actor.emoji}
        </span>
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full font-bold text-white shadow-lg"
          style={{ background: actor.color ?? INDIGO, fontSize: size * 0.34 }}
        >
          {actor.label}
        </span>
      )}
    </motion.div>
  );
}
