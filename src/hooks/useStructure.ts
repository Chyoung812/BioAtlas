"use client";

import { makeResourceHook } from "@/lib/resource";

/** Suspense 경계 안에서 호출 — PDB 원문 텍스트, 실패 시 null(→ 뷰어가 폴백 표시). */
export const useStructure = makeResourceHook<string | null>((pdbId) =>
  fetch(`/api/structure/${pdbId}`)
    .then((r) => (r.ok ? r.text() : null))
    .catch(() => null)
);
