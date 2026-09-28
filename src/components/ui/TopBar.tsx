"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useAtlas } from "@/store/useAtlas";
import { getOrgan, getTissue, getPathway, searchAtlas } from "@/lib/atlas";
import { GENE_SYMBOL } from "@/lib/types";
import { GENES } from "@/lib/genes";
import { ThemeControls } from "./ThemeControls";
import { BioAtlasLogo } from "./BioAtlasLogo";

export function TopBar() {
  const { organId, tissueId, pathwayId, goTo, reset } = useAtlas();

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
    <header className="panel absolute left-0 right-0 top-0 z-30 flex items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4">
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
      </nav>

      <SearchBox />
      <BookmarkMenu />
      <ThemeControls />
    </header>
  );
}

function BookmarkMenu() {
  const [open, setOpen] = useState(false);
  const bookmarks = useAtlas((s) => s.bookmarks);
  const openGene = useAtlas((s) => s.openGene);
  const toggleBookmark = useAtlas((s) => s.toggleBookmark);
  const saved = bookmarks.filter((b) => GENES[b]);
  const ref = useRef<HTMLDivElement>(null);

  // 헤더의 backdrop-blur가 fixed 자식의 기준 박스가 되므로, 깔개 대신 바깥 클릭을 직접 감지한다
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium hover:bg-subtle ${
          saved.length ? "text-brand-400" : "text-fg-muted"
        }`}
        title="북마크한 유전자"
        aria-label="북마크한 유전자"
        aria-expanded={open}
      >
        ★ {saved.length}
      </button>
      {open && (
        <div className="panel absolute right-0 top-10 z-40 w-72 max-w-[calc(100vw-24px)] overflow-hidden rounded-xl py-1 text-sm">
          <div className="px-3 py-1.5 text-[11px] text-fg-faint">
            북마크한 유전자 · 이 브라우저에만 저장돼요
          </div>
          {saved.length === 0 ? (
            <p className="px-3 pb-2.5 pt-1 text-xs text-fg-muted">
              유전자 도감에서 ☆를 누르면 여기에 모여요.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {saved.map((symbol) => (
                <li key={symbol} className="flex items-center hover:bg-subtle">
                  <button
                    onClick={() => {
                      openGene(symbol);
                      setOpen(false);
                    }}
                    className="flex min-w-0 flex-1 items-baseline gap-2 px-3 py-1.5 text-left"
                  >
                    <span className="font-semibold text-fg">{symbol}</span>
                    <span className="truncate text-[11px] text-fg-faint">
                      {GENES[symbol].fullName}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleBookmark(symbol)}
                    className="px-3 py-1.5 text-fg-faint hover:text-fg"
                    aria-label={`${symbol} 북마크 해제`}
                    title="북마크 해제"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const jumpTo = useAtlas((s) => s.jumpTo);
  const focusGene = useAtlas((s) => s.focusGene);
  const openGene = useAtlas((s) => s.openGene);
  const results = useMemo(() => searchAtlas(q), [q]);
  const term = q.trim();
  // 도감에 없는 유전자 기호는 NCBI 기본 카드로 연다
  const external =
    GENE_SYMBOL.test(term) && !results.some((r) => r.type === "gene")
      ? term.toUpperCase()
      : null;

  return (
    <>
      <button
        onClick={() => {
          // 키보드는 탭 이벤트 안에서 focus해야 모바일에서 열린다 → 먼저 입력칸을 보이게 그린다
          flushSync(() => setMobileOpen(true));
          inputRef.current?.focus();
        }}
        className="rounded-lg border border-line px-2.5 py-1.5 text-xs sm:hidden"
        aria-label="검색"
      >
        🔍
      </button>
      <div
        className={
          mobileOpen
            ? "panel fixed inset-x-0 top-0 z-50 flex items-center gap-2 !bg-surface p-2"
            : "relative hidden sm:block"
        }
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          ref={inputRef}
          placeholder="유전자 / 패스웨이 / 조직 검색…"
          className="min-w-0 flex-1 rounded-lg border border-line bg-canvas/60 px-3 py-1.5 text-sm text-fg placeholder:text-fg-faint focus:border-brand-500 focus:outline-none sm:w-56 sm:flex-none"
        />
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="shrink-0 px-2 text-sm text-fg-muted"
          >
            닫기
          </button>
        )}
        {focused && term && (
          <ul
            className={`panel absolute z-40 overflow-hidden rounded-xl py-1 text-sm ${
              mobileOpen ? "left-2 right-2 top-full !bg-surface" : "right-0 top-10 w-72"
            }`}
          >
            {results.map((r) => (
              <li key={`${r.type}-${r.id}`}>
                <button
                  onMouseDown={() => {
                    setMobileOpen(false);
                    // 유전자는 트리 위의 한 점이 아니라 여러 장기에 걸쳐 있다 →
                    // 드릴다운으로 밀어넣지 않고 인체 위 분포 뷰로 연다.
                    if (r.type === "gene") focusGene(r.id);
                    else
                      jumpTo({
                        organId: r.organId,
                        tissueId: r.tissueId,
                        pathwayId: r.type === "pathway" ? r.id : undefined,
                      });
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-subtle"
                >
                  <span className="truncate text-fg">{r.label}</span>
                  <span className="ml-2 shrink-0 text-[11px] text-fg-faint">
                    {r.sublabel}
                  </span>
                </button>
              </li>
            ))}
            {external && (
              <li>
                <button
                  onMouseDown={() => {
                    setMobileOpen(false);
                    openGene(external);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-subtle"
                >
                  <span className="truncate text-fg">
                    {external} <span className="text-fg-muted">NCBI에서 찾기</span>
                  </span>
                  <span className="ml-2 shrink-0 text-[11px] text-fg-faint">
                    도감 밖 유전자
                  </span>
                </button>
              </li>
            )}
            {results.length === 0 && !external && (
              <li className="px-3 py-2 text-xs leading-relaxed text-fg-muted">
                &lsquo;{term}&rsquo;에 맞는 장기·조직·패스웨이·유전자가 없어요.
                유전자는 영문 기호(예: TP53)로 찾으면 도감 밖 유전자도 NCBI에서
                불러와요.
              </li>
            )}
          </ul>
        )}
      </div>
    </>
  );
}
