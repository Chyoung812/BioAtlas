// 단백질 구조 파일 프록시 — CORS 우회 + 캐싱.
//   4자 ID (예: 1TUP)      → RCSB PDB 실험 구조
//   AF-{accession} (AF-P30556) → AlphaFold 예측 모델 (실험 구조가 없는 단백질용)
// 좌표는 사실상 불변이므로 일주일 캐시.
import { GENES } from "@/lib/genes";

export const revalidate = 604800;

// 앱에 있는 유전자의 구조만 받는다. 임의 ID를 열어두면 외부 DB로 가는 공개 프록시가 된다.
const KNOWN_PDB = new Set(
  Object.values(GENES).flatMap((g) => (g.proteinPdbId ? [g.proteinPdbId.toUpperCase()] : []))
);
const KNOWN_UNIPROT = new Set(Object.values(GENES).map((g) => g.uniprot.toUpperCase()));

// EBI/RCSB 모두 익명 요청을 거부할 수 있다 (AlphaFold는 UA 없으면 403).
const UA = { "User-Agent": "BioAtlas/1.0 (educational; +https://github.com/bioatlas)" };

/** AlphaFold는 모델 버전(v4/v6…)이 바뀌므로 URL을 API로 조회해 얻는다. */
async function alphafoldUrl(accession: string): Promise<string | null> {
  const res = await fetch(
    `https://alphafold.ebi.ac.uk/api/prediction/${accession}`,
    { headers: UA, next: { revalidate } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json?.[0]?.pdbUrl ?? null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pdbId: string }> }
) {
  const { pdbId } = await params;
  const raw = pdbId.toUpperCase();

  try {
    let url: string | null;

    if (raw.startsWith("AF-")) {
      const acc = raw.slice(3).replace(/[^A-Z0-9]/g, "");
      if (!KNOWN_UNIPROT.has(acc)) {
        return new Response("unknown uniprot accession", { status: 404 });
      }
      url = await alphafoldUrl(acc);
      if (!url) return new Response("no predicted model", { status: 404 });
    } else {
      const id = raw.replace(/[^A-Z0-9]/g, "");
      if (!KNOWN_PDB.has(id)) {
        return new Response("unknown pdb id", { status: 404 });
      }
      url = `https://files.rcsb.org/download/${id}.pdb`;
    }

    const res = await fetch(url, { headers: UA, next: { revalidate } });
    if (!res.ok) return new Response("not found", { status: res.status });
    const text = await res.text();
    return new Response(text, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": `public, s-maxage=${revalidate}`,
      },
    });
  } catch {
    return new Response("fetch failed", { status: 502 });
  }
}
