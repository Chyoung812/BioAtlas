"use client";

import { getPathway } from "@/lib/atlas";
import { Pathway } from "@/lib/types";
import { makeResourceHook } from "@/lib/resource";

/** Suspense 경계 안에서 호출 — KEGG/Reactome 확인, 실패 시 큐레이션 폴백. */
export const usePathwayDetail = makeResourceHook<Pathway>((id) =>
  fetch(`/api/pathway/${id}`)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<Pathway>;
    })
    .catch(() => ({
      ...(getPathway(id) as Pathway),
      _meta: { source: "fallback" as const },
    }))
);
