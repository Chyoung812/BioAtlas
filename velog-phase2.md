# BioAtlas 2편 — 큐레이션 데이터에서 진짜 실데이터로

> 1편에서 "큐레이션 데이터에서 실데이터로 넘어가는 순간이 진짜 시작"이라고 썼다.
> 이번엔 그 시작을 했다. NCBI·KEGG·Reactome·RCSB를 붙이고, 단백질을 3D로 띄우고,
> 라이트 모드를 제대로 만들고, 애매했던 애니메이션을 뜯어고쳤다.

---

## 0. 무엇을 디벨롭할지부터 정했다

"장기를 더 추가할까? 패스웨이를 더 추가할까?"로 시작했는데, 결론은 **둘 다 아니었다.**

- **장기 추가 = 빈 방 만들기.** 장기 하나를 넣으면 그 안에 조직→패스웨이→유전자를 다 채워야
  막다른 길이 안 된다. 3D 모델링 + 큐레이션 한 세트가 통째로 필요한 넓이 확장이다.
- **패스웨이 추가 = 그나마 낫다.** 사람들이 실제로 머무는 곳(패스웨이→유전자 네트워크)의
  밀도가 올라간다.
- **그런데 둘 다 선형 노가다다.** 큐레이션을 더 넣는 건 "장기 3개 더 넣었네, 그래서?"로 끝난다.

그래서 **새로운 capability**를 만들기로 했다. 실데이터 연동, 그리고 단백질 3D 구조 뷰어.

> 💡 "무엇을 더 만들까"의 답이 항상 "더 많이"는 아니다. **넓이보다 깊이**, 콘텐츠보다 능력.

---

## 1. 실데이터 파이프라인 — 큐레이션을 "폴백으로 강등"하다

가장 먼저 한 결정: **큐레이션 데이터를 지우지 않는다.** 대신 역할을 바꿨다.

```
GeneModal (client)
   │  activeGene 심볼
   ▼
useGeneDetail(symbol)      ← 클라 캐시 + 로딩/에러
   │  fetch /api/gene/{symbol}
   ▼
Route Handler (server)     ← 프록시 + 서버 캐시 + API 키 은닉
   │  NCBI esummary / PubMed 병렬 호출
   ▼
mergeGene(live, GENES[symbol])
   └─ 큐레이션을 base로, 실데이터를 그 위에 덮어씀
      실패하면 큐레이션 그대로 (source: "fallback")
```

핵심은 `GENES[symbol]`이 **씨앗이자 안전망**이라는 것이다.

- **씨앗**: 큐레이션에 이미 `geneId: "7157"`(TP53)이 있으니, 이게 NCBI 요청의 입력이 된다.
- **안전망**: API가 죽으면 그대로 반환한다. 앱은 절대 안 깨진다.

```ts
// src/app/api/gene/[symbol]/route.ts
export const revalidate = 86400; // 유전자 정보는 거의 안 변함 → 하루 캐시

export async function GET(_req, { params }) {
  const { symbol } = await params;
  const base = GENES[symbol];              // 씨앗 + 폴백
  if (!base) return Response.json({ error: "unknown" }, { status: 404 });

  try {
    const [ncbi, pubmed] = await Promise.all([
      fetchNcbiGene(base.geneId),          // esummary → 이름/크로모좀
      fetchPubmed(base.symbol),            // esearch+esummary → 최신 논문
    ]);
    return Response.json(mergeGene(base, { ncbi, pubmed }));
  } catch {
    // 장애/rate limit → 큐레이션을 폴백으로 200 반환 (500이 아니다!)
    return Response.json({ ...base, _meta: { source: "fallback" } });
  }
}
```

에러를 **500이 아니라 200 + 폴백 데이터**로 돌려주는 게 포인트다. 클라이언트는 에러 처리를 할
필요가 없고, UI는 배지만 "오프라인 데이터"로 바꾸면 된다.

### 결과

TP53을 열면 큐레이션에 하드코딩돼 있던 논문 2건이 **NCBI의 최신 논문 5건**으로 갈아끼워진다.
`chromosome`, `fullName`도 NCBI 값으로 채워진다.

> 💡 **에러 응답을 폴백 데이터로 바꾸면 클라이언트가 단순해진다.**
> "실패"를 네트워크 계층이 아니라 도메인 데이터(`_meta.source`)로 표현했다.

---

## 2. 폴백은 "될 거라 믿는" 게 아니라 "터뜨려서 확인"하는 것

폴백 코드를 써놓고 "잘 되겠지"로 넘어갈 뻔했다. 그래서 강제로 터뜨렸다.

NCBI base URL을 env로 뺄 수 있게 만들고:

```ts
const BASE = process.env.NCBI_BASE ?? "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
```

도달 불가능한 호스트로 실행:

```bash
NCBI_BASE="http://127.0.0.1:1/unreachable" npm run dev
```

```
$ curl /api/gene/BAX
source: fallback
fullName (큐레이션 폴백): BCL2 associated X, apoptosis regulator
```

정확히 강등됐다.

> 💡 **폴백은 강제로 실패시켜 봐야 검증된 것이다.** 그리고 그걸 위해 base URL을 env로 빼는 건
> "테스트를 위한 오염"이 아니라 그냥 좋은 설계였다.

---

## 3. 패스웨이는 "덮어쓰기"가 아니라 "보강"이었다

유전자에 이어 패스웨이도 KEGG REST / Reactome ContentService에 붙였다. 그런데 여기서
**유전자와 정반대 결정**을 했다.

먼저 실제 응답을 확인해봤다.

```
# KEGG (flat text)
NAME        Apoptosis - Homo sapiens (human)
DESCRIPTION Apoptosis is a genetically programmed process for the elimination of...

# Reactome (JSON)
displayName: "Stabilization of p53"
summation[0].text: "Later studies pin-pointed that a single serine (Ser-15)..."
```

둘 다 **영문**이다. 그런데 큐레이션에는 이미 잘 다듬은 **한글 summary**가 있다.
실데이터라고 무조건 덮어쓰면 UX가 **나빠진다.**

그래서 `mergePathway`는 이렇게 짰다.

```ts
export function mergePathway(base: Pathway, live: LivePathway): Pathway {
  return {
    ...base,
    nameEn: live.name ?? base.nameEn,                        // 정식 영문명은 실데이터
    sourceDescription: live.description ?? base.sourceDescription, // 원문 설명 추가
    _meta: { source: "live", fetchedAt: new Date().toISOString() },
    // summary(한글)·network는 큐레이션 유지 — 덮어쓰지 않는다
  };
}
```

유전자의 PubMed는 어차피 영문이라 교체가 맞았고, 패스웨이의 설명은 한글 큐레이션이 나아서
보강이 맞았다. **같은 "실데이터 연동"이라도 필드마다 답이 다르다.**

### 사이드바는 suspend시키지 않았다

모달(유전자)은 전체를 Suspense로 감싸도 됐지만, **사이드바는 항상 떠 있는 패널**이다.
여기서 로딩 때문에 깜빡이면 최악이다. 그래서:

- 큐레이션 name/summary는 **즉시** 그린다 (동기)
- 실 API 배지 + 원문설명만 `<Suspense fallback={null}>`로 **progressive하게 얹는다**

```tsx
<div className="mt-2 text-[11px] text-fg-faint">
  출처: {pathway.source} · {pathway.sourceId}
</div>
<Suspense fallback={null}>
  <PathwayLiveMeta id={pathway.id} />   {/* 나중에 조용히 붙음 */}
</Suspense>
```

> 💡 **Suspense 경계는 "데이터가 필요한 곳"이 아니라 "비어도 되는 곳"에 그어야 한다.**

---

## 4. React Query를 안 썼다 (그리고 그 판단을 한 번 뒤집었다)

클라이언트 캐시를 뭘로 할지 고민했다. 처음엔 이렇게 정했다.

> "fetch surface가 1개(유전자 모달)뿐이니 React Query는 과하다.
> React 19의 `use()` + 모듈 프로미스 캐시로 충분하다. **surface가 2개 되면 도입하자.**"

```ts
// src/lib/resource.ts — 30줄로 캐시 + 중복요청 제거 + 로딩상태
export function makeResourceHook<T>(loader: (key: string) => Promise<T>) {
  const cache = new Map<string, Promise<T>>();
  return function useResource(key: string): T {
    let p = cache.get(key);
    if (!p) {
      p = loader(key);
      cache.set(key, p);
    }
    return use(p);   // React 19 — Suspense가 로딩을 처리
  };
}
```

그런데 실제로 패스웨이 surface가 추가되자, **내가 세운 기준이 틀렸다는 걸 알았다.**

두 surface(유전자·패스웨이)가 **완전히 똑같은 단순 GET-by-id**였다. 위 팩토리 하나로
deps 0으로 깔끔히 흡수됐다. 여기에 QueryClientProvider + 라이브러리를 추가하는 건 여전히 과했다.

**진짜 도입 트리거는 "surface 개수"가 아니라 "mutation/invalidation/retry가 필요해질 때"**다.
즉 Phase 2의 인증 + 북마크(쓰기 작업)가 들어오는 시점이다.

> 💡 **기술 도입 기준을 "개수"로 세우면 틀린다. "필요한 기능"으로 세워야 한다.**
> 그리고 자기가 세운 기준도 틀렸으면 갈아엎어야 한다.

---

## 5. 킬러 기능 — 단백질을 진짜 3D로 띄우다

이게 이번 작업의 하이라이트다.

큐레이션 데이터에 이미 `proteinPdbId: "1TUP"`(p53)이 **저장돼 있었다.** RCSB에 실제 구조 파일이
무료로 열려 있고, Three.js에는 `PDBLoader`가 있다. **재료가 이미 다 있었다.**

```
유전자 클릭 → /api/structure/1TUP (RCSB 프록시, 일주일 캐시)
           → PDBLoader.parse(text)
           → 원자 = 인스턴스 스피어(CPK 색) / 결합 = 라인
           → 자동 회전 + 드래그/줌
```

"인체 → 장기 → 조직 → 패스웨이 → 유전자"로 내려온 끝에서, **유전자의 단백질을 실제 공간으로**
보여준다. `공간으로 이해하는 생물학`이라는 원래 목표가 마지막 칸까지 이어졌다.

### 그런데 처음엔 "덩어리"가 떴다

CYCS(시토크롬 c)를 열었더니 두 덩어리로 뭉친 이상한 blob에 빨간 점들이 흩뿌려져 있었다.
구조가 틀린 줄 알고 PDB 파일을 뜯어봤다.

```
$ 3ZCF.pdb 분석
단백질 원자(ATOM): 3330
이종원자(HETATM): 519
  그중 물(HOH): 341      ← 흩뿌려진 빨간 점의 정체
헴(HEC): 172
체인 종류: A B C D        ← 시토크롬 c "4개 복사본"
```

구조는 **맞았다.** 다만 내가 **결정학 파일에 담긴 모든 걸 통째로 렌더**하고 있었다.
결정 구조 파일에는 비대칭 단위(asymmetric unit)에 들어간 단백질 복사본이 여러 개, 게다가
결정화에 쓰인 물 분자 수백 개가 그대로 들어있다. 그리고 `PDBLoader`는 `ATOM`뿐 아니라
`HETATM`(물 포함)도 전부 그린다.

```js
// PDBLoader.js
if ( lines[i].slice(0,4) === 'ATOM' || lines[i].slice(0,6) === 'HETATM' ) {
```

그래서 파싱 전에 필터를 넣었다. **체인 하나만 + 물 제거**, 헴은 유지(시토크롬 c의 상징이니까).

```ts
function filterPdb(text: string, chain = "A"): string {
  // ATOM/HETATM 중 지정 체인 + 물(HOH) 아닌 것만
  // CONECT는 "양쪽 원자가 모두 남아있는 것"만 유지 (아니면 로더가 깨진다)
}
```

결과: **4227원자(복사본 4개 + 물 341) → 835원자(단일 사슬) + 헴, 물 0개.**
깨끗한 시토크롬 c 하나가 떴다.

### CONECT를 함부로 못 버린 이유

`PDBLoader`를 읽어보니 **결합(bond)을 CONECT 레코드로만 만든다.** 거리 기반 계산이 없다.
그리고 `_atomMap[serial-1]`로 원자를 찾는다. 원자를 지웠는데 CONECT가 그 원자를 참조하면
`undefined[0]`으로 터진다. 그래서 "참조 원자가 모두 살아있는 CONECT만" 남겼다.

> 💡 **"데이터가 맞느냐"와 "데이터를 제대로 보여주느냐"는 다른 문제다.**
> 좌표는 100% 정확했지만, 날것 그대로는 아무것도 이해시키지 못했다.
> 도메인을 모르면 "틀린 줄" 안다.

---

## 6. 라이트 모드는 구현된 적이 없었다

테마 토글이 있길래 눌렀는데 글씨가 안 보였다. 열어보니 원인이 명확했다.

**다크 우선으로 개발하면서 색을 전부 하드코딩해 놨다.**

```
하드코딩된 다크 색상: 13개 파일, 약 100곳
  text-slate-400, bg-ink-800, border-ink-700 ...
3D 씬 배경: 코드에 #0a0e1a 박제
```

`html.light`가 뒤집는 건 `body`/`panel` 배경뿐이라, 흰 바탕 위에 밝은 회색 글씨가 그대로 남았다.

100곳을 하나씩 `dark:` 붙이는 대신 **시맨틱 토큰**으로 갔다.

```css
:root {                      /* 다크가 기본 */
  --c-canvas: 10 14 26;      /* 채널값(R G B) → Tailwind /opacity 수식이 그대로 동작 */
  --c-surface: 14 19 34;
  --c-fg: 241 245 249;
  --c-fg-muted: 148 163 184;
  --scene-from: #0a0e1a;
}
html.light {                 /* 값만 뒤집는다 */
  --c-canvas: 248 250 252;
  --c-surface: 255 255 255;
  --c-fg: 15 23 42;
  --c-fg-muted: 71 85 105;
  --scene-from: #eef2f7;
}
```

```ts
// tailwind.config.ts
canvas:  "rgb(var(--c-canvas) / <alpha-value>)",
surface: "rgb(var(--c-surface) / <alpha-value>)",
fg: {
  DEFAULT: "rgb(var(--c-fg) / <alpha-value>)",
  muted:   "rgb(var(--c-fg-muted) / <alpha-value>)",
},
```

그리고 `text-slate-400` → `text-fg-muted`, `bg-ink-800` → `bg-raised` 로 일괄 치환.
**하드코딩 다크 색상 0개**가 됐다.

### 3D 씬이 진짜 문제였다

`<color attach="background" args={["#0a0e1a"]} />`는 CSS로 못 뒤집는다. 두 가지로 풀었다.

- **HumanScene**: Canvas를 `alpha: true`로 두고 `<color>`를 아예 제거 →
  래퍼 div의 **CSS 그라디언트(테마 변수)가 그대로 비친다.** 공짜로 테마 대응.
- **Scene3D**: 포그(fog) 때문에 색이 필요 → `useTheme()`으로 분기.
  덤으로 **별자리 배경은 다크에서만** 렌더하게 했다 (흰 배경에 흰 별은 안 보이니까).

> 💡 **CSS 변수 하나가 100곳의 하드코딩을 대체한다.**
> 그리고 WebGL은 CSS가 안 닿는 영역이라 따로 설계해야 한다.
> Canvas를 투명하게 두고 CSS 배경을 비추는 트릭이 제일 깔끔했다.

---

## 7. "로고를 바꿨더니 UI 전체가 따라왔다"

분자 네트워크로 그린 "B" 로고를 인라인 SVG로 만들어 넣었다. 래스터가 아니라 벡터라 선명하고,
배경이 투명해서 다크/라이트 공용이다.

그런데 로고는 **파랑→틸→퍼플**인데 앱 전체 포인트 컬러는 **오렌지**였다. 따로 놀았다.
그래서 브랜드 팔레트를 **인디고(#6366f1)** 로 갈아끼웠다 — 로고의 파랑과 퍼플을 잇는 중간색.

`brand-*` 토큰을 쓰는 UI(버튼·브레드크럼·스텝·배지)는 팔레트만 바꾸니 **자동으로** 따라왔고,
씬/SVG에 하드코딩된 오렌지(핫스팟·펄스링·rim 라이트)만 손으로 바꿨다.

**다만 하나는 일부러 오렌지로 남겼다.** 유전자 네트워크의 `ROLE_COLOR`다.

```ts
const ROLE_COLOR = {
  oncogene: "#ef4444",         // 빨강
  tumor_suppressor: "#3b82f6", // 파랑
  signaling: "#f15b16",        // 오렌지 ← 유지
  structural: "#a855f7",       // 퍼플
};
```

이건 **브랜드 색이 아니라 카테고리를 구분하는 데이터 인코딩**이다. 여기서 오렌지를 인디고로
바꾸면 파랑·퍼플과 뭉개져서 **구분이 안 된다.**

> 💡 **브랜드 색과 데이터 색은 다른 축이다.** 카테고리 팔레트는 브랜드에 맞출 게 아니라
> **서로 구별되게** 골라야 한다.

---

## 8. "이거 뭘 보여주는 건지 모르겠는데요"

가장 뼈아픈 피드백이었다. 유전자 모달의 "Interactive Micro-Map"이라는 애니메이션을 보고
사용자(=나)가 **뭘 표현하는지 이해를 못 했다.**

뜯어보니 문제가 두 겹이었다.

### (1) 토글 이름이 기능과 달랐다

`🧸 쉬운 설명` 토글이 있는데, 정작 **"쉬운 설명" 텍스트는 토글과 무관하게 항상 보였다.**
토글이 실제로 켜고 끄는 건 애니메이션 하나뿐이었다.

→ **`🎬 애니메이션`으로 이름을 바꿨다.** 이름-기능 불일치는 그냥 버그다.

### (2) 애니메이션이 아무것도 "이야기"하지 않았다

기존 연출은 모든 유전자에 대해 **똑같았다.** 이름표 붙은 공이 두근거리고, 🧬 이모지가 옆에서
걷고, 캡션만 갈아끼웠다. 코드 주석에도 "정식 버전에선 Lottie로 교체될 자리"라고 적힌
**사실상 자리표시자**였다.

그래서 **비트(장면) 기반 스토리 시퀀스**로 다시 만들었다.

```ts
type Actor = { id: string; emoji?: string; label?: string; color?: string;
               x: number; y: number; size?: number };
type Beat  = { caption: string; actors: Actor[] };
```

핵심 아이디어: **같은 배우(`id`)가 비트마다 다른 위치에 있으면, framer-motion이
그 사이를 알아서 애니메이션한다.** 즉 "이동"을 따로 코딩할 필요가 없다.

CYCS(시토크롬 c) 스토리는 이렇게 된다.

```ts
alarm: [
  { caption: "평소엔 시토크롬 c가 미토콘드리아 안에서 에너지 일을 도와요",
    actors: [ { id: "mito", emoji: "🫘", x: 50, y: 52, size: 96 },
              { id: "c", label: "c", color: RED, x: 50, y: 52 } ] },  // ← 안에 있음

  { caption: "BAX가 다가와 미토콘드리아에 구멍을 뚫으면…",
    actors: [ ..., { id: "bax", label: "BAX", x: 76, y: 38 },
                   { id: "hole", emoji: "🕳️", x: 62, y: 48 } ] },

  { caption: "시토크롬 c가 구멍으로 빠져나와요",
    actors: [ ..., { id: "c", label: "c", color: RED, x: 82, y: 52 } ] }, // ← 밖으로 이동!

  { caption: "→ 세포에 사멸 경보가 울립니다 🚨",
    actors: [ ..., { id: "alarm", emoji: "🚨", x: 82, y: 32 } ] },
]
```

`c`가 비트 1에서 미토콘드리아와 **같은 좌표**(=안에 있음)였다가 비트 3에서 `x: 82`(=밖)로
가면, 그게 곧 "빠져나오는 애니메이션"이 된다. 데이터만 쓰면 연출이 나온다.

### "붙었다"고 했는데 안 붙어 보였다

PRKACA(PKA) 스토리에서 "표적에 인산기(P)를 **딱 붙여요**"라고 써놓고, 정작 P를 PKA와 표적
**중간에** 띄워놨다. 붙은 것처럼 안 보였다.

→ **P를 표적과 같은 x축, 바로 위에 얹었다.** 그러면 다음 비트에서 표적이 이동할 때
P도 **붙은 채 따라간다.** 캡션과 그림이 드디어 같은 말을 하게 됐다.

### 그리고 22개 전부

처음엔 아폽토시스 6개만 스토리를 만들고 나머지는 제네릭 폴백으로 뒀는데, 심장·간·폐·신장
유전자를 열면 여전히 그 애매한 한 컷이 떴다. `genes.ts`를 파싱해서 실제 애셋을 세어보니
**22개**였고(내가 놓친 `accelerator`·`brake`·`channel`·`hormone`·`sensor`까지),
각 유전자의 `easyExplanation`을 근거로 **전부 스토리를 썼다.**

| 애셋 | 유전자 | 스토리 |
|---|---|---|
| accelerator | MYC | Wnt가 가속페달 밟음 → 증식 총괄 → 과하면 종양 ⚠️ |
| brake | APC | β-카테닌을 붙잡아 없앰 → 증식 브레이크 🛑 |
| calcium | RYR2 | 밸브 열림 → 칼슘 왈칵 → 심장 수축 💓 |
| detox | CYP3A4 | 약물 붙잡음 → 산소 붙여 분해 → 배출 🧪 |
| oxygen | HIF1A | 저산소 시 축적 → 적응 유전자 켬 🚨 |
| … | | (총 22개) |

마지막으로 **하단 진행 점을 클릭 가능**하게 만들고(원하는 장면으로 점프),
**마우스를 올리면 자동재생이 멈추게** 했다. 타이머는 `setInterval` → `setTimeout`으로 바꿔
장면마다 다시 걸리게 했다 — 안 그러면 점을 눌러 점프해도 바로 다음 장면으로 튄다.

> 💡 **"뭘 보여주는지 모르겠다"는 최고의 버그 리포트다.**
> 그리고 애니메이션은 **데이터 구조로 만들면** 연출이 자동으로 따라온다.
> 위치를 바꾸는 것만으로 "이동"이 표현된다.

---

## 회고: 이번에 남은 것

### 기술적으로 배운 것

- **큐레이션을 지우지 말고 폴백으로 강등하라.** 씨앗(ID)이자 안전망이 된다.
- **에러를 500이 아니라 200+폴백으로.** 클라이언트가 단순해진다.
- **폴백은 강제로 터뜨려야 검증된 것이다.** base URL을 env로 빼는 게 정답이었다.
- **실데이터라고 다 덮어쓰는 게 아니다.** 유전자 PubMed는 교체, 패스웨이 한글 summary는 유지.
  필드마다 답이 다르다.
- **기술 도입 기준을 "개수"로 세우지 마라.** React Query는 surface가 2개여서가 아니라
  mutation이 필요할 때 넣는 거였다.
- **좌표가 맞는 것과 제대로 보여주는 건 다르다.** PDB 파일엔 단백질 복사본 4개와 물 341개가
  섞여 있었다. 도메인을 모르면 "구조가 틀렸나?" 하게 된다.
- **CSS 변수 하나가 하드코딩 100곳을 대체한다.** 그리고 WebGL은 CSS가 안 닿으니
  Canvas를 투명하게 두고 CSS 배경을 비추는 게 제일 깔끔했다.
- **브랜드 색과 데이터 색은 다른 축이다.** 카테고리 팔레트는 서로 구별되게 골라야 한다.
- **애니메이션은 데이터 구조로 만들어라.** 같은 배우의 좌표만 바꾸면 이동이 표현된다.

### 태도로 배운 것

- **자기가 방금 세운 기준도 틀렸으면 갈아엎어야 한다.** ("surface 2개면 React Query" → 폐기)
- **이름과 기능이 다르면 그건 버그다.** "쉬운 설명" 토글은 애니메이션 토글이었다.
- **"이거 뭘 보여주는지 모르겠는데"** 가 가장 정확한 피드백이었다. 1편의 "졸라맨", "토성"에
  이어 이번에도.
- **검증은 실제로 해봐야 안다.** NCBI 필드 이름도, three의 exports 맵도, PDB 파일 내용도
  전부 직접 열어보고 나서야 알았다. "되겠지"로 넘어간 건 하나도 없었다.

### 다음

- **Supabase 인증 + 북마크/마이페이지** — 그때가 React Query의 진짜 도입 시점이다.
- 패스웨이 반응 애니메이션(네트워크를 실제 반응 순서대로 흐르게)
- README 갱신 (아직 "큐레이션 데이터를 사용합니다"라고 적혀 있다…)

---

큐레이션 데이터에서 실데이터로 넘어왔다. 이제 유전자를 클릭하면 NCBI의 최신 논문이 뜨고,
그 단백질의 **실제 3D 구조**가 돌아간다. `공간으로 이해하는 생물학`에 또 한 걸음.

*BioAtlas는 AI 페어(Claude Code)와 함께 만드는 개인 프로젝트입니다.*
