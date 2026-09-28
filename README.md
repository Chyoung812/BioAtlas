# BioAtlas

> 인체에서 유전자까지, 3D 공간으로 연결되는 분자생물학 지도

[PRD](./prd.md) 기반 구현체입니다. **뇌·심장·폐·간·위·췌장·장·신장·흉선·비장 10개 장기**에 대해
`인체 → 장기 → 조직 → 패스웨이 → 유전자` 전 구간 탐색 플로우와 핵심 UI를 갖췄습니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
```

## 구현된 기능

- **인체 진입 화면** — 3D 인체 모델 위 10개 장기 핫스팟. 모델을 못 불러오거나 WebGL을 쓸 수 없는 브라우저에서는 2D 바디맵으로 대체
- **여러 장기에 걸친 유전자** — GLP1R·PPARA처럼 여러 장기에서 일하는 유전자를 인체 위에 한 번에 표시 (검색에서 유전자를 고르면 이 화면으로 열림)
- **5단계 여정 가이드** — 인체→장기→조직→패스웨이→유전자 진행 상태 + "다음 할 일" 힌트를 하단에 상시 표시
- **장기별 3D 모델** — Human Reference Atlas(HuBMAP) 해부학 모델 9종. HRA 모델이 없는 위는 코드로 그린 절차적 모델
- **조직 레이어 분리** — 장기 중심에서 각 조직(해마·심근·간세포·폐포·사구체 등)으로 연결선이 이어진 3D 레이어
- **패스웨이 리스트** — 연관도/카테고리/이름순 정렬, 연관도 막대, Reactome 원본 확인 여부 표시
- **유전자 네트워크** — Cytoscape force-directed("별자리"), Activation(→)/Inhibition(⊣)/Interaction(┈) 표현. 원본 경로 밖의 교육용 맥락 유전자는 점선으로 구분
- **마이크로 도감 팝업** — 쉬운 설명 + 하는 일/작동 방식/문제가 생기면 + 전문 데이터(Gene ID, 크로모좀, NCBI 요약, UniProt, PubMed, 발현 조직, 관련 패스웨이)
- **단백질 3D 구조** — PDB 실험 구조, 없으면 AlphaFold 예측 모델
- **쉬운 설명 모드** — ON 시 Interactive Micro-Map(분자 의인화 애니메이션) 등장
- **연관 패스웨이 이동** — 도감/사이드바에서 클릭 시 즉시 이동 + 브레드크럼 갱신
- **검색** — 유전자 기호·별칭 외에 한국어 설명 속 질환·물질명(당뇨, 알츠하이머, 인슐린 등)으로도 찾기. 도감에 없는 유전자는 영문 기호로 검색하면 NCBI 기본 정보 카드(요약·염색체 위치·최신 논문)로 열림
- **링크 공유** — 현재 위치(장기·조직·패스웨이·유전자)가 주소에 반영되어 그대로 공유·뒤로가기 가능
- **공유 페이지** — 유전자(`/gene/TP53`)·패스웨이(`/pathway/R-HSA-109606`)별 정적 페이지와 미리보기 이미지. 도감·사이드바의 "링크 복사"가 이 주소를 복사
- **인용 정보 복사** — 도감에서 NCBI Gene ID·확인일(보고 있는 경로가 있으면 Reactome ID까지)을 한 번에 복사
- **북마크** — 도감의 ☆로 유전자를 저장하고 상단 ★ 메뉴에서 다시 열기 (로그인 없이 이 브라우저에만 저장)
- **미니맵**, **다크/라이트 테마**, **브레드크럼 + 전역 검색**

## 데이터

장기·조직·패스웨이·유전자 구성은 `src/lib/`의 큐레이션 데이터입니다 —
10개 장기 · 33개 조직 · 27개 패스웨이(Reactome) · 93개 유전자.

화면에 보이는 유전자 정보(요약, 크로모좀, 관련 논문)와 패스웨이 확인 여부는
`src/app/api/`가 NCBI E-utilities · Reactome에서 받아와 하루 동안 캐시합니다.
외부 API가 응답하지 않으면 큐레이션 데이터를 보여주고, 화면에 오프라인 표시를 붙입니다.
도감 밖 유전자는 검색할 때 NCBI에서 조회하며, 쉬운 설명 없이 NCBI 정보만 보여줍니다.
NCBI는 API 키가 없으면 초당 3회로 제한되므로 운영 환경에는 `NCBI_API_KEY`(무료)를 설정하세요.
단백질 구조는 RCSB PDB · AlphaFold에서 받아 일주일 캐시합니다.

큐레이션 데이터가 원본 DB와 어긋나지 않았는지는 `npm run check:data`로 확인합니다.
GitHub Actions가 매주 월요일 자동으로 실행하고, 실패하면 이슈를 엽니다.

## 에셋 출처

- 인체 모델: ["Male base"](https://poly.pizza/m/eWGDnQ0jzmH) by Артур Мигранов, CC BY 3.0
- 장기 모델: [Human Reference Atlas 3D Reference Object Library](https://humanatlas.io/3d-reference-library) (HuBMAP), CC BY 4.0

자세한 내용은 [public/models/README.md](./public/models/README.md)를 참고하세요.

## 기술 스택

Next.js 15 (App Router) · TypeScript · Three.js + React Three Fiber + Drei ·
Cytoscape.js · Zustand · Framer Motion · Tailwind CSS · next-themes

## 로드맵 (PRD §7)

- **다음** — 장기 추가 (피부·눈·담낭 등, HRA 모델이 있는 장기부터)
- **이후** — 로그인 + 기기 간 북마크 동기화, 유전자 색상 분류 체계 고도화
