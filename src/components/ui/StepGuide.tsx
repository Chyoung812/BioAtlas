"use client";

import { useAtlas } from "@/store/useAtlas";

/**
 * 5단계 탐색 여정을 항상 보여주는 가이드.
 * 사용자가 "지금 어디에 있고, 다음에 무엇을 해야 하는지"를 놓치지 않도록
 * 화면 하단 중앙에 고정한다. (인체 → 장기 → 조직 → 패스웨이 → 유전자)
 */
const STEPS = ["인체", "장기", "조직", "패스웨이", "유전자"] as const;

const NEXT_HINT: Record<string, string> = {
  body: "빛나는 장기(뇌·심장·폐·간·위·췌장·장·신장)를 클릭해 탐색을 시작하세요",
  organ: "장기 속 조직을 선택하세요",
  tissue: "오른쪽 목록에서 패스웨이를 선택하세요",
  pathway: "네트워크의 유전자 노드를 클릭해 도감을 여세요",
};

export function StepGuide() {
  const level = useAtlas((s) => s.level);
  const activeGene = useAtlas((s) => s.activeGene);

  // 현재 단계 인덱스 (유전자 도감이 열려 있으면 마지막 단계)
  const stepIndex = activeGene
    ? 4
    : { body: 0, organ: 1, tissue: 2, pathway: 3 }[level] ?? 0;

  const hint = activeGene ? null : NEXT_HINT[level];

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
      {/* 스텝 표시 */}
      <div className="panel flex items-center gap-1 rounded-full px-3 py-1.5">
        {STEPS.map((label, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <div key={label} className="flex items-center gap-1">
              {i > 0 && (
                <span
                  className={`h-px w-4 ${
                    done ? "bg-brand-500" : "bg-subtle"
                  }`}
                />
              )}
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  current
                    ? "bg-brand-500 text-white"
                    : done
                      ? "text-brand-400"
                      : "text-fg-faint"
                }`}
              >
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full text-[9px] ${
                    current
                      ? "bg-white/25"
                      : done
                        ? "bg-brand-500/20"
                        : "bg-subtle"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 다음 할 일 힌트 */}
      {hint && (
        <div className="panel animate-fade-in rounded-full px-4 py-1.5 text-xs text-fg-muted">
          👉 {hint}
        </div>
      )}
    </div>
  );
}
