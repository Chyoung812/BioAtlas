"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAtlas } from "@/store/useAtlas";

// 다크/라이트 토글 + 분자 애니메이션(Micro-Map) 토글 (독립적인 두 축)
export function ThemeControls() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const easyMode = useAtlas((s) => s.easyMode);
  const toggleEasyMode = useAtlas((s) => s.toggleEasyMode);

  useEffect(() => setMounted(true), []);
  const dark = resolvedTheme !== "light";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleEasyMode}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
          easyMode
            ? "bg-brand-500 text-white"
            : "border border-line text-fg-muted hover:bg-subtle"
        }`}
        title="분자 애니메이션 (Interactive Micro-Map) 켜기/끄기"
      >
        {easyMode ? "🎬 애니메이션 ON" : "🎬 애니메이션"}
      </button>

      {mounted && (
        <button
          onClick={() => setTheme(dark ? "light" : "dark")}
          className="rounded-lg border border-line px-2.5 py-1.5 text-sm hover:bg-subtle"
          title="테마 전환"
          aria-label="테마 전환"
        >
          {dark ? "🌙" : "☀️"}
        </button>
      )}
    </div>
  );
}
