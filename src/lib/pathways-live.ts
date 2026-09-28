// Reactome ContentService 어댑터
// 실 API의 정식 영문명·원문 설명을 가져와 큐레이션 Pathway를 "보강"한다.
// (유전자와 달리 한글 summary/network는 큐레이션이 더 좋으므로 덮어쓰지 않음)
// 서버 전용 모듈 — 클라이언트에서 import 하지 마세요.
import { Pathway } from "./types";

const DAY = 86400;

async function getJson(u: string) {
  const res = await fetch(u, { next: { revalidate: DAY } });
  if (!res.ok) throw new Error(`Reactome ${res.status}`);
  return res.json();
}

type LivePathway = { name?: string; description?: string };

/** Reactome ContentService — displayName / summation[0].text */
export async function fetchReactome(sourceId: string): Promise<LivePathway> {
  const base = process.env.REACTOME_BASE ?? "https://reactome.org/ContentService";
  const d = await getJson(`${base}/data/query/${sourceId}`);
  const raw: string | undefined = d?.summation?.[0]?.text;
  return {
    name: d?.displayName,
    description: raw ? raw.replace(/<[^>]+>/g, "").trim() : undefined, // HTML 태그 제거
  };
}

/** 큐레이션(base) 위에 실 API 정식명/원문설명만 보강. summary·network는 유지. */
export function mergePathway(base: Pathway, live: LivePathway): Pathway {
  return {
    ...base,
    nameEn: live.name ?? base.nameEn,
    sourceDescription: live.description ?? base.sourceDescription,
    _meta: { source: "live", fetchedAt: new Date().toISOString() },
  };
}
