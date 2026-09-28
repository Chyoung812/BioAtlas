"use client";

import { GENES } from "@/lib/genes";
import { ExternalGene, GeneDetail } from "@/lib/types";
import { makeResourceHook } from "@/lib/resource";

/** Suspense 경계 안에서 호출 — NCBI 실데이터, 실패 시 클라 큐레이션 폴백. */
export const useGeneDetail = makeResourceHook<GeneDetail>((symbol) =>
  fetch(`/api/gene/${symbol}`)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<GeneDetail>;
    })
    .catch(() => ({
      // 라우트에 닿지 못한 경우(네트워크 등)에도 클라 큐레이션으로 폴백
      ...GENES[symbol],
      _meta: { source: "fallback" as const },
    }))
);

/** 도감 밖 유전자 — NCBI 기본 정보. 없는 기호면 "notfound", 응답 실패면 "error". */
export const useExternalGene = makeResourceHook<
  ExternalGene | "notfound" | "error"
>(async (symbol) => {
  try {
    const r = await fetch(`/api/gene/${encodeURIComponent(symbol)}`);
    if (r.status === 404) return "notfound";
    if (!r.ok) return "error";
    return (await r.json()) as ExternalGene;
  } catch {
    return "error";
  }
});
