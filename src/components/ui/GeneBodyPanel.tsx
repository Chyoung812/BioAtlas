"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAtlas } from "@/store/useAtlas";
import { getOrgan } from "@/lib/atlas";
import { GENES } from "@/lib/genes";
import { findGeneDistribution, multiOrganGenes } from "@/lib/expression";

/**
 * 유전자 → 인체 분포 패널 (드릴다운의 역방향).
 *
 * 드릴다운은 "이 장기에 무엇이 있나"를 답한다. 이 패널은 그 반대 —
 * "이 유전자가 몸의 어디어디에서 일하나"를 한 화면에 답한다.
 * 다장기 유전자(CFTR·GLP1R 등)는 트리를 아무리 파고들어도 보이지 않는다.
 */
export function GeneBodyPanel() {
  const geneFocus = useAtlas((s) => s.geneFocus);
  const clearGeneFocus = useAtlas((s) => s.clearGeneFocus);
  const enterOrgan = useAtlas((s) => s.enterOrgan);
  const openGene = useAtlas((s) => s.openGene);

  const dist = geneFocus ? findGeneDistribution(geneFocus) : null;
  const gene = geneFocus ? GENES[geneFocus] : null;

  return (
    <AnimatePresence>
      {dist && gene && (
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="panel absolute bottom-[76px] left-3 right-3 z-30 max-h-[50dvh] overflow-y-auto rounded-xl p-4 lg:bottom-auto lg:left-4 lg:right-auto lg:top-20 lg:max-h-none lg:w-72"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-lg font-semibold text-fg">{gene.symbol}</div>
              <div className="truncate text-xs text-fg-faint">
                {gene.fullName}
              </div>
            </div>
            <button
              onClick={clearGeneFocus}
              aria-label="분포 뷰 닫기"
              className="shrink-0 rounded-md px-1.5 py-0.5 text-fg-faint hover:bg-subtle hover:text-fg"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 rounded-lg bg-subtle/60 px-3 py-2">
            <div className="text-xs text-fg-muted">몸에서의 분포</div>
            <div className="mt-0.5 text-sm font-medium text-fg">
              {dist.organIds.length > 0
                ? `${dist.organIds.length}개 장기`
                : "특정 장기 없음"}
              {dist.systemic && (
                <span className="ml-1.5 rounded bg-brand-500/15 px-1.5 py-0.5 text-[11px] font-normal text-brand-400">
                  전신 발현
                </span>
              )}
            </div>
          </div>

          {dist.organIds.length > 0 && (
            <ul className="mt-3 space-y-1">
              {dist.organIds.map((id) => {
                const organ = getOrgan(id);
                if (!organ) return null;
                return (
                  <li key={id}>
                    <button
                      onClick={() => enterOrgan(id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-subtle"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: organ.color }}
                      />
                      <span className="text-fg">{organ.name}</span>
                      <span className="ml-auto text-[11px] text-fg-faint">
                        들어가기 →
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* 커버 범위 밖 장기(골격근·지방조직 등)는 인체에 불이 켜지지 않으므로
              조용히 숨기지 않고 여기에 그대로 밝힌다. */}
          {dist.unmappedTerms.length > 0 && (
            <div className="mt-2 px-2 text-[11px] leading-relaxed text-fg-faint">
              지도 밖 발현: {dist.unmappedTerms.join(", ")}
            </div>
          )}

          <button
            onClick={() => openGene(gene.symbol)}
            className="mt-3 w-full rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            마이크로 도감 열기
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/**
 * 진입 화면 힌트 — 드릴다운으로는 절대 마주칠 수 없는 다장기 유전자를 먼저 던진다.
 * (빈 검색창은 "뭘 쳐야 하지"로 끝나므로, 이 뷰의 존재 이유를 예시로 보여준다.)
 */
export function MultiOrganHint() {
  const geneFocus = useAtlas((s) => s.geneFocus);
  const level = useAtlas((s) => s.level);
  const focusGene = useAtlas((s) => s.focusGene);
  const hidden = useAtlas((s) => s.multiOrganHintHidden);
  const hide = useAtlas((s) => s.hideMultiOrganHint);
  const [open, setOpen] = useState(false); // 모바일에서만 의미 있음 (데스크톱은 항상 펼침)

  if (hidden || geneFocus || level !== "body") return null;

  const picks = multiOrganGenes().slice(0, 3);
  if (picks.length === 0) return null;

  return (
    <div
      className={`panel absolute left-3 top-[104px] z-20 rounded-xl lg:left-4 lg:right-auto lg:top-20 lg:w-72 lg:p-4 ${
        open ? "right-3 p-4" : "px-3 py-1.5"
      }`}
    >
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left text-sm font-medium text-fg lg:pointer-events-none"
          aria-expanded={open}
        >
          여러 장기에서 일하는 유전자 Top 3
          <span className="text-xs text-fg-faint lg:hidden">{open ? "▾" : "▸"}</span>
        </button>
        <button
          onClick={hide}
          aria-label="추천 유전자 닫기"
          className="shrink-0 rounded-md px-1.5 py-0.5 text-fg-faint hover:bg-subtle hover:text-fg"
        >
          ✕
        </button>
      </div>
      <div className={open ? "" : "max-lg:hidden"}>
        <p className="mt-1 text-xs leading-relaxed text-fg-muted">
          클릭하면 이 유전자가 발현되는 장기를 인체 지도에 한 번에 표시합니다.
        </p>
        <ul className="mt-3 space-y-1">
          {picks.map((d) => (
            <li key={d.symbol}>
              <button
                onClick={() => focusGene(d.symbol)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-subtle"
              >
                <span className="font-medium text-fg">{d.symbol}</span>
                <span className="ml-auto text-[11px] text-fg-faint">
                  {d.organIds
                    .map((id) => getOrgan(id)?.name)
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
