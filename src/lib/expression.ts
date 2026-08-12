// 유전자 → 인체(장기) 역방향 매핑
//
// 드릴다운(인체→장기→조직→패스웨이→유전자)은 트리라서, 한 유전자가 여러 장기에
// 걸쳐 있다는 사실을 구조적으로 표현하지 못한다. 실제로 atlas.ts의 패스웨이 트리만
// 뒤집으면 79개 유전자 중 76개가 단일 장기로 나온다 — 트리를 뒤집어도 그래프가 되지 않는다.
//
// 그 사실은 genes.ts의 `expression`(발현 조직)에 이미 큐레이션되어 있지만 자유 텍스트라
// 기계가 읽지 못한다. 이 파일이 그 텍스트를 장기 ID로 정규화해, "이 유전자가 몸의
// 어디어디에서 일하는가"를 인체 위에 한 화면으로 그릴 수 있게 한다.
//
// 예) CFTR → 폐·췌장·장 (낭포성 섬유증이 다장기 질환인 이유)
//     GLP1R → 췌장·뇌·위·장 (GLP-1 작용제가 여러 축을 동시에 건드리는 이유)

import { GENES } from "./genes";

/** 특정 장기에 매이지 않고 전신에서 발현되는 경우를 나타내는 센티널. */
export const SYSTEMIC = "__systemic__";

/**
 * `GeneDetail.expression`의 자유 텍스트 → 장기 ID.
 *
 * 빈 배열은 "매핑 누락"이 아니라 **의도적으로 커버 범위 밖**이라는 뜻이다.
 * (골격근·지방조직·부신·내이는 ORGANS에 없는 장기 — 조용히 전신으로 뭉뚱그리면
 *  인체에 없는 곳에 불이 켜지므로, 켜지 않는 쪽이 정직하다.)
 */
const EXPRESSION_TO_ORGANS: Record<string, string[]> = {
  // ── 심장 ──
  심근: ["heart"],
  "심실 심근": ["heart"],
  전도계: ["heart"],
  "푸르키녜 섬유": ["heart"], // RYR2 문맥 = 심장 전도계 (소뇌 푸르키녜 세포 아님)
  심장: ["heart"],

  // ── 간 ──
  간세포: ["liver"],
  "간세포 담관측 세포막": ["liver"],
  "간세포 혈액측 세포막": ["liver"],
  "간세포 (혈중 분비)": ["liver"],

  // ── 뇌 ──
  해마: ["brain"],
  대뇌피질: ["brain"],
  소뇌: ["brain"],
  선조체: ["brain"],
  전두엽: ["brain"],
  신경세포: ["brain"],
  "신경세포 전반": ["brain"],
  "장수 신경세포": ["brain"],
  뇌: ["brain"],

  // ── 신장 ──
  신장: ["kidney"],
  "신장 집합관": ["kidney"],
  "신장 세뇨관": ["kidney"],
  "신장 사구체 족세포": ["kidney"],
  "신장 사구체옆세포": ["kidney"],
  "신장 원위세뇨관·집합관": ["kidney"],
  원위세뇨관: ["kidney"],

  // ── 폐 ──
  폐: ["lung"],
  "폐포 제2형 상피세포": ["lung"],
  폐혈관: ["lung"],
  "폐혈관 내피": ["lung"],
  "기도 점막": ["lung"],
  "기도 배상세포": ["lung"],
  "기도 상피": ["lung"],
  "섬모 상피": ["lung"],

  // ── 췌장 ──
  췌장: ["pancreas"],
  "췌장 베타세포": ["pancreas"],
  "췌장 선포세포": ["pancreas"],
  췌관: ["pancreas"],

  // ── 위 ──
  "위 벽세포": ["stomach"],
  "위 주세포": ["stomach"],
  "위 유문부 G세포": ["stomach"],

  // ── 장 ──
  장: ["intestine"],
  "장 상피": ["intestine"],
  소장: ["intestine"],
  "소장 상피": ["intestine"],
  "소장 융모 상피": ["intestine"],
  장샘: ["intestine"],
  "장샘 니치": ["intestine"],

  // ── 두 장기에 걸침 ──
  위장관: ["stomach", "intestine"],

  // ── 전신 ──
  전신: [SYSTEMIC],
  "전신 대부분 조직": [SYSTEMIC],
  "전신 세포의 미토콘드리아": [SYSTEMIC],
  "전신 (저산소 조건)": [SYSTEMIC],
  "전신 혈관": [SYSTEMIC],
  "혈관 내피": [SYSTEMIC],
  "혈관 평활근": [SYSTEMIC],
  면역세포: [SYSTEMIC],
  비만세포: [SYSTEMIC],
  "Th2 세포": [SYSTEMIC],
  "내분비 조직": [SYSTEMIC],
  "증식 조직": [SYSTEMIC],
  "발생기 조직": [SYSTEMIC],

  // ── ORGANS에 없는 장기 (의도적 미표시) ──
  골격근: [],
  "지근 골격근": [],
  지방조직: [],
  부신: [],
  내이: [],
};

export interface GeneBodyDistribution {
  symbol: string;
  /** 이 유전자가 발현되는 장기 ID (ORGANS 기준) */
  organIds: string[];
  /** 전신 발현 여부 — 특정 장기 하이라이트와는 별도 축으로 표시한다 */
  systemic: boolean;
  /** 매핑되지 않은 원문 발현 조직 (커버 범위 밖 장기 등) — 패널에 그대로 노출 */
  unmappedTerms: string[];
}

/**
 * 유전자 심볼 → 몸에서의 분포. 드릴다운의 역방향.
 * 알 수 없는 심볼이면 null.
 */
export function findGeneDistribution(
  symbol: string
): GeneBodyDistribution | null {
  const gene = GENES[symbol];
  if (!gene) return null;

  const organIds = new Set<string>();
  const unmappedTerms: string[] = [];
  let systemic = false;

  for (const term of gene.expression ?? []) {
    const mapped = EXPRESSION_TO_ORGANS[term];
    if (mapped === undefined) {
      // 매핑 테이블에 없는 새 표현 — 조용히 삼키지 않고 드러낸다.
      unmappedTerms.push(term);
      continue;
    }
    if (mapped.length === 0) {
      unmappedTerms.push(term); // 커버 범위 밖 장기
      continue;
    }
    for (const id of mapped) {
      if (id === SYSTEMIC) systemic = true;
      else organIds.add(id);
    }
  }

  return { symbol, organIds: [...organIds], systemic, unmappedTerms };
}

/** 여러 장기에 걸친 유전자만 — "드릴다운으로는 안 보이는 것들" 추천 목록용. */
export function multiOrganGenes(): GeneBodyDistribution[] {
  return Object.keys(GENES)
    .map(findGeneDistribution)
    .filter((d): d is GeneBodyDistribution => (d?.organIds.length ?? 0) > 1)
    .sort((a, b) => b.organIds.length - a.organIds.length);
}
