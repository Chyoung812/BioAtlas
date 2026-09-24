import { test } from "node:test";
import assert from "node:assert/strict";
import { GeneDetail, GeneNode, Pathway } from "@/lib/types";
import { checkContext, checkGeneRecord, checkMembership } from "./check-rules";

const node = (id: string, extra: Partial<GeneNode> = {}): GeneNode => ({ id, label: id, geneId: id, ...extra });
const pathway = (nodes: GeneNode[]): Pathway => ({
  id: "hsa00000",
  name: "테스트",
  nameEn: "Test",
  source: "KEGG",
  sourceId: "hsa00000",
  category: "대사",
  relevance: 1,
  summary: "",
  relatedPathwayIds: [],
  network: { nodes, edges: [] },
});
const ctx = { reason: "생리 흐름상 앞 단계", evidence: ["KEGG:hsa04971"] };
const source = (...ids: string[]) => (symbol: string) => ids.includes(symbol);

test("pathway_member is checked against source membership", () => {
  // 출처에 있으면 통과, 없으면 개별 오류
  assert.deepEqual(checkMembership(pathway([node("A"), node("B")]), source("A", "B"), "T").errors, []);
  const missing = checkMembership(pathway([node("A"), node("B")]), source("A"), "T").errors;
  assert.equal(missing.length, 1);
  assert.match(missing[0], /B는 pathway_member인데/);

  // 3개 중 1개만 출처에 있으면 출처 ID 오류까지 난다
  const mostlyMissing = checkMembership(pathway([node("A"), node("B"), node("C")]), source("A"), "T");
  assert.ok(mostlyMissing.errors.some((e) => /3개 중 1개만/.test(e)));
});

test("contextual genes are excluded from membership ratio but need evidence", () => {
  const p = pathway([
    node("A"),
    node("B"),
    node("C"),
    node("X", { membership: "contextual", context: ctx }),
    node("Y", { membership: "contextual", context: ctx }),
  ]);
  const result = checkMembership(p, source("A", "B", "C"), "T");
  assert.deepEqual(result.errors, []);
  assert.equal(`${result.found}/${result.members}`, "3/3");

  // contextual이라도 근거가 없거나 원본에서 확인되지 않으면 오류
  const bare = node("X", { membership: "contextual" });
  assert.equal(checkContext(p, bare, {}).length, 2);
  assert.equal(checkContext(p, node("X", { membership: "contextual", context: ctx }), {}).length, 1);
  assert.deepEqual(
    checkContext(p, node("X", { membership: "contextual", context: ctx }), { "KEGG:hsa04971|X": true }),
    []
  );
});

test("gene record errors apply regardless of pathway role", () => {
  const gene = { symbol: "GAST", geneId: "2520", hgnc: "HGNC:9999", uniprot: "P01350", chromosome: "17q21.2" } as GeneDetail;
  const { errors } = checkGeneRecord(
    gene,
    { name: "GAST", maplocation: "17q21.2" },
    { hgnc_id: "HGNC:4164", entrez_id: "2520", uniprot_ids: ["P01350"] }
  );
  assert.deepEqual(errors, ["GAST: HGNC ID가 HGNC:4164입니다 (데이터: HGNC:9999)."]);
});
