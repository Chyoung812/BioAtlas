// BioAtlas 로고 마크 — 분자 네트워크로 그린 "B".
// 첨부 로고(파랑→틸→퍼플 그라디언트의 노드-링크 B)를 인라인 SVG로 재현.
// 래스터가 아니라 벡터라 어느 크기에서도 선명하고, 배경 투명이라 다크/라이트 공용.
export function BioAtlasLogo({
  className = "h-8 w-8",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      role="img"
      aria-label="BioAtlas"
    >
      <defs>
        <linearGradient
          id="bioatlas-mark"
          x1="4"
          y1="4"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="52%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* 결합선 (네트워크 엣지) */}
      <g
        stroke="url(#bioatlas-mark)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="9" y1="6" x2="9" y2="16" />
        <line x1="9" y1="16" x2="9" y2="26" />
        <line x1="9" y1="6" x2="22" y2="10" />
        <line x1="22" y1="10" x2="16" y2="16" />
        <line x1="16" y1="16" x2="9" y2="16" />
        <line x1="16" y1="16" x2="23" y2="22" />
        <line x1="23" y1="22" x2="9" y2="26" />
      </g>

      {/* 노드 (원자) */}
      <g fill="url(#bioatlas-mark)">
        <circle cx="9" cy="6" r="3" />
        <circle cx="9" cy="16" r="2.6" />
        <circle cx="9" cy="26" r="3" />
        <circle cx="22" cy="10" r="2.8" />
        <circle cx="16" cy="16" r="3.3" />
        <circle cx="23" cy="22" r="2.8" />
      </g>
    </svg>
  );
}
