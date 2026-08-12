// KEGG REST / Reactome ContentService 어댑터
// 실 API의 정식 영문명·원문 설명을 가져와 큐레이션 Pathway를 "보강"한다.
// (유전자와 달리 한글 summary/network는 큐레이션이 더 좋으므로 덮어쓰지 않음)
// 서버 전용 모듈 — 클라이언트에서 import 하지 마세요.
import { Pathway } from "./types";

const DAY = 86400;

async function getText(u: string) {
  const res = await fetch(u, { next: { revalidate: DAY } });
  if (!res.ok) throw new Error(`KEGG ${res.status}`);
  return res.text();
}

async function getJson(u: string) {
  const res = await fetch(u, { next: { revalidate: DAY } });
  if (!res.ok) throw new Error(`Reactome ${res.status}`);
  return res.json();
}

type LivePathway = { name?: string; description?: string };

/** KEGG flat file 파싱 — NAME / DESCRIPTION */
export async function fetchKegg(sourceId: string): Promise<LivePathway> {
  const base = process.env.KEGG_BASE ?? "https://rest.kegg.jp";
  const text = await getText(`${base}/get/${sourceId}`);
  const name = /^NAME\s+(.+)$/m
    .exec(text)?.[1]
    ?.replace(/\s*-\s*Homo sapiens.*$/i, "") // " - Homo sapiens (human)" 꼬리 제거
    .trim();
  // DESCRIPTION 다음 top-level 필드(들여쓰기 없는 줄) 전까지가 본문
  const description = /^DESCRIPTION\s+([\s\S]+?)\n\S/m
    .exec(text)?.[1]
    ?.replace(/\s+/g, " ")
    .trim();
  return { name, description };
}

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
