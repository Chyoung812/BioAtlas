import { Guide } from "@/lib/types";

const ROWS: { key: keyof Guide; label: string }[] = [
  { key: "role", label: "하는 일" },
  { key: "how", label: "작동 방식" },
  { key: "ifBroken", label: "문제가 생기면" },
];

/** 쉬운 설명 다음 단계 — 하는 일 / 작동 방식 / 문제가 생기면 */
export function GuideCard({
  guide,
  compact = false,
}: {
  guide: Guide;
  compact?: boolean;
}) {
  return (
    <dl
      className={`space-y-2 rounded-xl bg-raised/60 ring-1 ring-line ${
        compact ? "mt-2 p-2.5 text-[11px]" : "mt-3 p-4 text-sm"
      }`}
    >
      {ROWS.map(({ key, label }) => (
        <div key={key}>
          <dt
            className={`font-semibold text-brand-400 ${
              compact ? "text-[10px]" : "text-xs"
            }`}
          >
            {label}
          </dt>
          <dd className="leading-relaxed text-fg">{guide[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
