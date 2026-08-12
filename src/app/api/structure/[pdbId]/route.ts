// 단백질 구조 파일 프록시 — CORS 우회 + 캐싱.
//   4자 ID (예: 1TUP)      → RCSB PDB 실험 구조
//   AF-{accession} (AF-P30556) → AlphaFold 예측 모델 (실험 구조가 없는 단백질용)
// 좌표는 사실상 불변이므로 일주일 캐시.
export const revalidate = 604800;

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
      if (!/^[A-Z0-9]{6,10}$/.test(acc)) {
        return new Response("invalid uniprot accession", { status: 400 });
      }
      url = await alphafoldUrl(acc);
      if (!url) return new Response("no predicted model", { status: 404 });
    } else {
      const id = raw.replace(/[^A-Z0-9]/g, "");
      if (!/^[A-Z0-9]{4}$/.test(id)) {
        return new Response("invalid pdb id", { status: 400 });
      }
      url = `https://files.rcsb.org/download/${id}.pdb`;
    }

    const res = await fetch(url, { headers: UA, next: { revalidate } });
    if (!res.ok) return new Response("not found", { status: res.status });
    const text = await res.text();
    return new Response(text, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new Response("fetch failed", { status: 502 });
  }
}
