// 큐레이션 데이터를 NCBI·HGNC·KEGG·Reactome 원본과 대조하고, 유전자 동의어 목록을 만든다.
//   npm run check:data                 검사만 (오류가 있으면 exit 1)
//   npm run check:data -- --write      동의어 목록(src/lib/synonyms.json)도 갱신
//   npm run check:data -- --report r.md  결과를 마크다운 파일로도 저장
import { existsSync, readFileSync, writeFileSync } from "fs";
import { ORGANS, PATHWAYS } from "@/lib/atlas";
import { GENES } from "@/lib/genes";
import { checkContext, checkGeneRecord, checkMembership, checkPapers, isContextual, parseEvidence } from "./check-rules";

type Synonyms = Record<string, { symbols: string[]; names: string[] }>;

const SYNONYMS_PATH = "src/lib/synonyms.json";
const args = process.argv.slice(2);
const write = args.includes("--write");
const reportPath = args.includes("--report")
  ? args[args.indexOf("--report") + 1]
  : null;

const errors: string[] = [];
const warnings: string[] = [];
const pathwayRows: string[] = [];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string, json = true, headers: Record<string, string> = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return json ? res.json() : res.text();
    } catch (e) {
      if (attempt >= 3) throw new Error(`${url} 요청 실패: ${(e as Error).message}`);
      await sleep(1000 * attempt);
    }
  }
}

function uniq(list: (string | undefined | null)[], exclude: string[]) {
  const seen = new Set(exclude.map((x) => x.toLowerCase()));
  const out: string[] = [];
  for (const raw of list) {
    const v = raw?.trim();
    if (!v || seen.has(v.toLowerCase())) continue;
    seen.add(v.toLowerCase());
    out.push(v);
  }
  return out;
}

function checkReferences() {
  for (const [key, p] of Object.entries(PATHWAYS)) {
    if (key !== p.id) errors.push(`패스웨이 키(${key})와 id(${p.id})가 다릅니다.`);
    for (const r of p.relatedPathwayIds)
      if (!PATHWAYS[r]) errors.push(`${p.id}의 연관 패스웨이 ${r}가 없습니다.`);
    for (const n of p.network.nodes) {
      const g = GENES[n.id];
      if (!g) errors.push(`${p.id} 네트워크의 ${n.id}가 유전자 데이터에 없습니다.`);
      else if (g.geneId !== n.geneId)
        errors.push(`${p.id} 네트워크의 ${n.id} Gene ID(${n.geneId})가 유전자 데이터(${g.geneId})와 다릅니다.`);
    }
  }
  for (const o of ORGANS)
    for (const t of o.tissues)
      for (const id of t.pathwayIds)
        if (!PATHWAYS[id]) errors.push(`조직 ${o.id}/${t.id}의 패스웨이 ${id}가 없습니다.`);
  for (const g of Object.values(GENES))
    for (const id of g.relatedPathwayIds)
      if (!PATHWAYS[id]) errors.push(`${g.symbol}의 관련 패스웨이 ${id}가 없습니다.`);
}

const ncbiRecords: Record<string, any> = {};

async function checkGenes(): Promise<Synonyms> {
  const genes = Object.values(GENES);
  const ncbi: Record<string, any> = {};
  for (let i = 0; i < genes.length; i += 50) {
    const ids = genes.slice(i, i + 50).map((g) => g.geneId).join(",");
    const res = await get(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&retmode=json&tool=bioatlas&id=${ids}`
    );
    Object.assign(ncbi, res?.result ?? {});
    Object.assign(ncbiRecords, res?.result ?? {});
    await sleep(400);
  }

  const synonyms: Synonyms = {};
  for (const g of genes) {
    const n = ncbi[g.geneId];
    // HGNC는 초당 10회 제한이 있다
    await sleep(150);
    const h = (
      await get(`https://rest.genenames.org/fetch/symbol/${g.symbol}`, true, {
        Accept: "application/json",
      })
    )?.response?.docs?.[0];
    const issues = checkGeneRecord(g, n, h);
    errors.push(...issues.errors);
    warnings.push(...issues.warnings);

    const official = [g.symbol, g.fullName, n?.description, h?.name].filter(Boolean) as string[];
    synonyms[g.symbol] = {
      symbols: uniq(
        [
          ...(h?.prev_symbol ?? []),
          ...(h?.alias_symbol ?? []),
          ...(typeof n?.otheraliases === "string" ? n.otheraliases.split(",") : []),
        ],
        official
      ),
      names: uniq(
        [
          ...(h?.prev_name ?? []),
          ...(h?.alias_name ?? []),
          ...(typeof n?.otherdesignations === "string" ? n.otherdesignations.split("|") : []),
        ],
        official
      ),
    };
  }
  return synonyms;
}

const sourceCache: Record<string, { name: string; members: Set<string> } | null> = {};

/** "KEGG:hsa04974" 같은 출처 경로의 이름과 소속 유전자(Gene ID·기호·UniProt) */
async function sourcePathway(kind: "KEGG" | "Reactome", id: string) {
  const key = `${kind}:${id}`;
  if (key in sourceCache) return sourceCache[key];
  let result: { name: string; members: Set<string> } | null = null;
  if (kind === "KEGG") {
    const text = (await get(`https://rest.kegg.jp/get/${id}`, false)) as string | null;
    if (text) {
      const name = /^NAME\s+(.+)$/m.exec(text)?.[1]?.replace(/\s*-\s*Homo sapiens.*$/i, "").trim() ?? "";
      const links = (await get(`https://rest.kegg.jp/link/hsa/${id}`, false)) as string;
      result = { name, members: new Set(links.trim().split("\n").map((l) => l.split("\t")[1]?.replace("hsa:", ""))) };
    }
  } else {
    const info = await get(`https://reactome.org/ContentService/data/query/${id}`);
    if (info) {
      if (info.speciesName && info.speciesName !== "Homo sapiens")
        errors.push(`${key}: Reactome 경로가 사람 경로가 아닙니다 (${info.speciesName}).`);
      const refs = (await get(`https://reactome.org/ContentService/data/participants/${id}/referenceEntities`)) as any[];
      result = { name: info.displayName, members: new Set(refs.flatMap((r) => [r.identifier, ...(r.geneName ?? [])])) };
    }
  }
  await sleep(300);
  sourceCache[key] = result;
  return result;
}

function inSet(members: Set<string>, symbol: string) {
  const g = GENES[symbol];
  return members.has(symbol) || (!!g && (members.has(g.geneId) || members.has(g.uniprot)));
}

async function verifyEvidence(ref: string, symbol: string) {
  const e = parseEvidence(ref);
  const g = GENES[symbol];
  if (!e || !g) return false;
  if (e.kind === "KEGG" || e.kind === "Reactome") {
    const src = await sourcePathway(e.kind, e.id);
    return !!src && inSet(src.members, symbol);
  }
  if (e.kind === "NCBI") return e.id === g.geneId && !!ncbiRecords[g.geneId]?.summary;
  const res = await get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&tool=bioatlas&id=${e.id}`);
  await sleep(400);
  const rec = res?.result?.[e.id];
  return !!rec && !rec.error;
}

async function checkGenePapers() {
  const genes = Object.values(GENES);
  const pmids = genes.flatMap((g) => g.pubmed.map((p) => p.pmid));
  const papers: Record<string, any> = {};
  for (let i = 0; i < pmids.length; i += 100) {
    const res = await get(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&tool=bioatlas&id=${pmids.slice(i, i + 100).join(",")}`
    );
    Object.assign(papers, res?.result ?? {});
    await sleep(400);
  }
  for (const g of genes) {
    const res = await get(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=gene&db=pubmed&linkname=gene_pubmed_rif&retmode=json&tool=bioatlas&id=${g.geneId}`
    );
    await sleep(400);
    const issues = checkPapers(g, papers, new Set(res?.linksets?.[0]?.linksetdbs?.[0]?.links ?? []));
    errors.push(...issues.errors);
    warnings.push(...issues.warnings);
  }
}

async function checkPathways() {
  for (const p of Object.values(PATHWAYS)) {
    if (p.source !== "KEGG" && p.source !== "Reactome") continue;
    const src = await sourcePathway(p.source, p.sourceId);
    if (!src) {
      errors.push(`${p.id}: ${p.source}에서 ${p.sourceId} 경로를 찾을 수 없습니다.`);
      continue;
    }
    const m = checkMembership(p, (symbol) => inSet(src.members, symbol), src.name);
    errors.push(...m.errors);
    warnings.push(...m.warnings);

    const contextual = p.network.nodes.filter(isContextual);
    for (const node of contextual) {
      const verified: Record<string, boolean> = {};
      for (const ref of node.context?.evidence ?? [])
        verified[`${ref}|${node.id}`] = await verifyEvidence(ref, node.id);
      errors.push(...checkContext(p, node, verified));
    }
    pathwayRows.push(
      `| ${p.id} | ${p.name} | ${p.source}: ${src.name} | ${m.found}/${m.members} | ${contextual.map((n) => n.id).join(", ") || "-"} |`
    );
  }
}

function checkSynonyms(fresh: Synonyms) {
  const sorted = Object.fromEntries(Object.entries(fresh).sort(([a], [b]) => a.localeCompare(b)));
  const next = JSON.stringify(sorted, null, 2) + "\n";
  const current = existsSync(SYNONYMS_PATH) ? readFileSync(SYNONYMS_PATH, "utf8") : "";
  if (write) {
    if (next !== current) writeFileSync(SYNONYMS_PATH, next);
    console.log(`동의어 목록 ${next === current ? "변경 없음" : "갱신함"}: ${SYNONYMS_PATH}`);
  } else if (next !== current) {
    warnings.push(`동의어 목록이 최신 원본과 다릅니다. npm run check:data -- --write 로 갱신하세요.`);
  }
}

function report() {
  const lines = [
    `## BioAtlas 데이터 검사 (${new Date().toISOString().slice(0, 10)})`,
    "",
    `오류 ${errors.length}건 · 경고 ${warnings.length}건`,
    "",
    ...(errors.length ? ["### 오류", ...errors.map((e) => `- ${e}`), ""] : []),
    ...(warnings.length ? ["### 경고", ...warnings.map((w) => `- ${w}`), ""] : []),
    "### 패스웨이 출처 대조",
    "",
    "| ID | 앱 이름 | 출처 공식 이름 | 출처에 있는 pathway_member | contextual |",
    "|---|---|---|---|---|",
    ...pathwayRows,
    "",
  ];
  const text = lines.join("\n");
  console.log(text);
  if (reportPath) writeFileSync(reportPath, text);
}

(async () => {
  checkReferences();
  const synonyms = await checkGenes();
  await checkGenePapers();
  await checkPathways();
  checkSynonyms(synonyms);
  report();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => {
  const text = `## BioAtlas 데이터 검사\n\n검사가 중간에 멈췄습니다: ${(e as Error).message}\n`;
  console.error(text);
  if (reportPath) writeFileSync(reportPath, text);
  process.exit(1);
});
