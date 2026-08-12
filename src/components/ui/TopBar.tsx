"use client";

import { useMemo, useState } from "react";
import { useAtlas } from "@/store/useAtlas";
import { getOrgan, getTissue, getPathway, searchAtlas } from "@/lib/atlas";
import { ThemeControls } from "./ThemeControls";
import { BioAtlasLogo } from "./BioAtlasLogo";

export function TopBar() {
  const { level, organId, tissueId, pathwayId, goTo, reset } = useAtlas();

  const crumbs = useMemo(() => {
    const items: { label: string; onClick: () => void }[] = [
      { label: "인체", onClick: reset },
    ];
    if (organId)
      items.push({
        label: getOrgan(organId)?.name ?? organId,
        onClick: () => goTo("organ"),
      });
    if (tissueId && organId)
      items.push({
        label: getTissue(organId, tissueId)?.name ?? tissueId,
        onClick: () => goTo("tissue"),
      });
    if (pathwayId)
      items.push({
        label: getPathway(pathwayId)?.name ?? pathwayId,
        onClick: () => goTo("pathway"),
      });
    return items;
  }, [organId, tissueId, pathwayId, goTo, reset]);

  return (
    <header className="panel absolute left-0 right-0 top-0 z-30 flex items-center gap-4 px-4 py-2.5">
      <button
        onClick={reset}
        className="flex items-center gap-2"
        title="인체 전체 보기"
      >
        <BioAtlasLogo className="h-8 w-8" />
        <span className="hidden text-sm font-semibold tracking-tight text-fg sm:block">
          BioAtlas
        </span>
      </button>

      {/* 브레드크럼 */}
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm">
        {crumbs.map((c, i) => (
          <div key={i} className="flex items-center gap-1 whitespace-nowrap">
            {i > 0 && <span className="text-fg-faint">›</span>}
            <button
              onClick={c.onClick}
              className={`rounded px-1.5 py-0.5 hover:bg-subtle ${
                i === crumbs.length - 1
                  ? "font-semibold text-brand-400"
                  : "text-fg-muted"
              }`}
            >
              {c.label}
            </button>
          </div>
        ))}
        <span className="ml-1 hidden text-xs text-fg-faint md:inline">
          · {level}
        </span>
      </nav>

      <SearchBox />
      <ThemeControls />
    </header>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const jumpTo = useAtlas((s) => s.jumpTo);
  const focusGene = useAtlas((s) => s.focusGene);
  const results = useMemo(() => searchAtlas(q), [q]);

  return (
    <div className="relative hidden sm:block">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="유전자 / 패스웨이 / 조직 검색…"
        className="w-56 rounded-lg border border-line bg-canvas/60 px-3 py-1.5 text-sm text-fg placeholder:text-fg-faint focus:border-brand-500 focus:outline-none"
      />
      {focused && results.length > 0 && (
        <ul className="panel absolute right-0 top-10 z-40 w-72 overflow-hidden rounded-xl py-1 text-sm">
          {results.map((r) => (
            <li key={`${r.type}-${r.id}`}>
              <button
                onMouseDown={() =>
                  // 유전자는 트리 위의 한 점이 아니라 여러 장기에 걸쳐 있다 →
                  // 드릴다운으로 밀어넣지 않고 인체 위 분포 뷰로 연다.
                  r.type === "gene"
                    ? focusGene(r.id)
                    : jumpTo({
                        organId: r.organId,
                        tissueId: r.tissueId,
                        pathwayId: r.type === "pathway" ? r.id : undefined,
                      })
                }
                className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-subtle"
              >
                <span className="truncate text-fg">{r.label}</span>
                <span className="ml-2 shrink-0 text-[11px] text-fg-faint">
                  {r.sublabel}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
