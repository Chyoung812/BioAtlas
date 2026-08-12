import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 포인트 컬러: 인디고 계열 — 로고(파랑→틸→퍼플 분자 B)와 통일한 브랜드 액센트
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // main accent
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        // 다크 모드: 네이비/차콜 (씬/레거시 참조용으로 유지)
        ink: {
          950: "#0a0e1a",
          900: "#0e1322",
          850: "#141a2e",
          800: "#1a2238",
          700: "#252f4a",
          600: "#33405f",
        },
        // 시맨틱 토큰 — 값은 CSS 변수로 테마별 전환(globals.css). 채널값이라 /opacity 지원.
        canvas: "rgb(var(--c-canvas) / <alpha-value>)", // 앱 최하단 배경
        surface: "rgb(var(--c-surface) / <alpha-value>)", // 패널/바
        raised: "rgb(var(--c-raised) / <alpha-value>)", // 칩/중첩 표면
        subtle: "rgb(var(--c-subtle) / <alpha-value>)", // 호버/구분선/실루엣
        line: "rgb(var(--c-line) / <alpha-value>)", // 테두리
        fg: {
          DEFAULT: "rgb(var(--c-fg) / <alpha-value>)", // 본문 텍스트
          muted: "rgb(var(--c-fg-muted) / <alpha-value>)", // 보조 텍스트
          faint: "rgb(var(--c-fg-faint) / <alpha-value>)", // 흐린 텍스트
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
