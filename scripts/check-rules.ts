// check-data의 판정 규칙. 외부 API 호출 없이 입력만으로 결과가 정해진다.
import { GeneDetail, GeneNode, Pathway } from "@/lib/types";

export type Issues = { errors: string[]; warnings: string[] };

export const isContextual = (n: GeneNode) => n.membership === "contextual";

const EVIDENCE = /^(KEGG|Reactome|NCBI|PMID):(\S+)$/;

/** 출처 경로 소속 검사 — pathway_member만 대상으로 한다 */
export function checkMembership(
  p: Pathway,
  inSource: (symbol: string) => boolean,
  sourceName: string
): Issues & { found: number; members: number } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const members = p.network.nodes.filter((n) => !isContextual(n));
  const missing = members.filter((n) => !inSource(n.id));
  const found = members.length - missing.length;
  const where = `${p.source} 경로("${sourceName}")`;

  if (members.length === 0) errors.push(`${p.id}: pathway_member가 하나도 없습니다.`);
  for (const n of missing)
    errors.push(`${p.id}: ${n.id}는 pathway_member인데 ${where}에 없습니다. 출처 밖 유전자라면 근거와 함께 contextual로 분류하세요.`);
  // 절반 이상이 빠졌으면 개별 유전자보다 출처 ID 자체가 잘못 연결됐을 가능성이 크다
  if (members.length > 0 && found * 2 < members.length)
    errors.push(`${p.id}: pathway_member ${members.length}개 중 ${found}개만 ${where}에 있습니다. 출처 ID를 확인하세요.`);
  for (const n of p.network.nodes.filter(isContextual))
    if (inSource(n.id))
      warnings.push(`${p.id}: ${n.id}는 ${where}에 실제로 있습니다. contextual 대신 pathway_member로 바꾸세요.`);

  return { errors, warnings, found, members: members.length };
}

/** contextual 근거 검사 — verified는 "근거|유전자" 키별로 원본에서 확인한 결과 */
export function checkContext(
  p: Pathway,
  node: GeneNode,
  verified: Record<string, boolean>
): string[] {
  const errors: string[] = [];
  const at = `${p.id}의 contextual ${node.id}`;
  if (!node.context?.reason?.trim()) errors.push(`${at}: 함께 보여주는 이유(reason)가 없습니다.`);
  const evidence = node.context?.evidence ?? [];
  if (evidence.length === 0) errors.push(`${at}: 근거(evidence)가 없습니다.`);
  for (const ref of evidence) {
    if (!EVIDENCE.test(ref)) errors.push(`${at}: 근거 형식이 잘못됐습니다 (${ref}).`);
    else if (!verified[`${ref}|${node.id}`]) errors.push(`${at}: 근거 ${ref}를 원본에서 확인하지 못했습니다.`);
  }
  return errors;
}

export function parseEvidence(ref: string) {
  const m = EVIDENCE.exec(ref);
  return m ? { kind: m[1] as "KEGG" | "Reactome" | "NCBI" | "PMID", id: m[2] } : null;
}

type NcbiRecord = { name?: string; currentid?: string; maplocation?: string; error?: string };
type HgncRecord = { hgnc_id?: string; entrez_id?: string; uniprot_ids?: string[] };

/** 유전자 자체의 정합성 — pathway 역할과 무관하게 모든 유전자에 적용한다 */
export function checkGeneRecord(
  g: GeneDetail,
  ncbi: NcbiRecord | undefined,
  hgnc: HgncRecord | undefined
): Issues {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!ncbi || ncbi.error) {
    errors.push(`${g.symbol}: NCBI Gene ${g.geneId}를 찾을 수 없습니다.`);
  } else {
    if (ncbi.currentid) errors.push(`${g.symbol}: NCBI Gene ${g.geneId}가 ${ncbi.currentid}로 대체됐습니다.`);
    if (ncbi.name !== g.symbol) errors.push(`${g.symbol}: NCBI Gene ${g.geneId}의 공식 기호는 ${ncbi.name}입니다.`);
    if (ncbi.maplocation && ncbi.maplocation !== g.chromosome)
      warnings.push(`${g.symbol}: 염색체 위치가 데이터(${g.chromosome})와 NCBI(${ncbi.maplocation})에서 다릅니다.`);
  }
  if (!hgnc) {
    errors.push(`${g.symbol}: HGNC 승인 기호가 아닙니다.`);
  } else {
    if (hgnc.hgnc_id !== g.hgnc) errors.push(`${g.symbol}: HGNC ID가 ${hgnc.hgnc_id}입니다 (데이터: ${g.hgnc}).`);
    if (hgnc.entrez_id !== g.geneId) errors.push(`${g.symbol}: HGNC의 Gene ID가 ${hgnc.entrez_id}입니다 (데이터: ${g.geneId}).`);
    if (!(hgnc.uniprot_ids ?? []).includes(g.uniprot))
      errors.push(`${g.symbol}: UniProt ${g.uniprot}가 HGNC 목록(${(hgnc.uniprot_ids ?? []).join(", ")})에 없습니다.`);
  }
  return { errors, warnings };
}
