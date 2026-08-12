// BioAtlas 도메인 타입 정의
// 데이터 출처(NCBI/KEGG/Reactome)는 추후 API 연동 시 이 형태로 매핑됩니다.

export type NavLevel = "body" | "organ" | "tissue" | "pathway";

export interface Organ {
  id: string;
  name: string; // 한글 명
  nameEn: string;
  description: string;
  /** 3D 씬에서의 대략 위치 (인체 모델 기준) */
  position: [number, number, number];
  color: string;
  available: boolean; // Phase 1: 뇌만 true
  tissues: Tissue[];
}

export interface Tissue {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  /** 장기 확대 시 3D 레이어 분리 위치 */
  position: [number, number, number];
  pathwayIds: string[];
}

export type PathwayCategory =
  | "신호전달"
  | "세포사멸"
  | "대사"
  | "면역"
  | "발달";

export interface Pathway {
  id: string;
  name: string;
  nameEn: string;
  source: "KEGG" | "Reactome" | "NCBI";
  sourceId: string;
  category: PathwayCategory;
  /** 연관도/중요도 (정렬 기본값) */
  relevance: number;
  summary: string;
  network: GeneNetwork;
  /** 연관 패스웨이 (탐색 연결) */
  relatedPathwayIds: string[];
  /** KEGG/Reactome 원문 설명(영문) — 큐레이션 summary 보강용, 실 API로 채워짐 */
  sourceDescription?: string;
  /** 데이터 출처 — 실 API 확인 시 "live", 큐레이션 폴백이면 "fallback" */
  _meta?: { source: "live" | "fallback"; fetchedAt?: string };
}

export interface GeneNetwork {
  nodes: GeneNode[];
  edges: GeneEdge[];
}

export interface GeneNode {
  id: string; // gene symbol, e.g. "CASP3"
  label: string;
  geneId: string; // NCBI Gene ID
  /** 유전자 성격 — 정식 버전에서 색상 차별화 (PRD ④) */
  role?: "oncogene" | "tumor_suppressor" | "signaling" | "structural";
}

export type EdgeMechanism = "activation" | "inhibition" | "interaction";

export interface GeneEdge {
  source: string;
  target: string;
  /** activation: → / inhibition: ⊣ / interaction: 점선 */
  mechanism: EdgeMechanism;
}

export interface GeneDetail {
  symbol: string;
  geneId: string; // NCBI
  hgnc: string;
  fullName: string;
  /** 쉬운 설명: 한두 문장 + 비유 */
  easyExplanation: string;
  /** 쉬운 설명 모드에서 보여줄 Lottie/일러스트 키 */
  microMapAsset?: string;
  chromosome: string;
  /** UniProt accession — 실험 구조가 없을 때 AlphaFold 예측 모델의 키가 된다. */
  uniprot: string;
  /** RCSB 실험 구조. 없으면 뷰어가 AlphaFold 예측 모델로 폴백한다. */
  proteinPdbId?: string;
  /**
   * 렌더할 체인. 복합체 구조에서 체인 A가 다른 단백질인 경우가 흔하다
   * (예: PNLIP 1LPA의 체인 A는 콜리파아제). 생략 시 "A".
   */
  proteinPdbChain?: string;
  expression: string[]; // 발현 조직
  pubmed: { title: string; pmid: string }[];
  relatedPathwayIds: string[];
  /** 데이터 출처 — 실 API 응답이면 "live", 큐레이션 폴백이면 "fallback" */
  _meta?: { source: "live" | "fallback"; fetchedAt?: string };
}
