# BioAtlas

> 인체에서 유전자까지, 3D 공간으로 연결되는 분자생물학 지도

[PRD](./prd.md) 기반 구현체입니다. **뇌·심장·간·폐·신장 5개 장기**에 대해
`인체 → 장기 → 조직 → 패스웨이 → 유전자` 전 구간 탐색 플로우와 핵심 UI를 갖췄습니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
```

## 구현된 기능

- **인체 진입 화면** — `public/models/human.glb`를 넣으면 실제 3D 인체 모델을 자동 정규화(중심·크기 보정)해 렌더하고 5개 장기 핫스팟을 얹음, 없으면 2D 해부학 바디맵으로 대체 ([CC0 모델 넣는 법](./public/models/README.md))
- **5단계 여정 가이드** — 인체→장기→조직→패스웨이→유전자 진행 상태 + "다음 할 일" 힌트를 하단에 상시 표시
- **장기별 3D 모델** — 뇌(이랑/고랑 절차적)·심장(심방+심첨+대동맥)·간(우엽/좌엽)·폐(양엽+기관지)·신장(강낭콩 한 쌍)을 각각 절차적으로 렌더
- **조직 레이어 분리** — 장기 중심에서 각 조직(해마·심근·간세포·폐포·사구체 등)으로 연결선이 이어진 3D 레이어 (조직 선택 전에만 천천히 회전)
- **패스웨이 리스트** — 연관도/카테고리/이름순 정렬, 연관도 막대 표시
- **유전자 네트워크** — Cytoscape force-directed("별자리"), Activation(→)/Inhibition(⊣)/Interaction(┈) 표현
- **마이크로 도감 팝업** — 쉬운 설명 + 전문 데이터 아코디언(Gene ID, PDB, 크로모좀, PubMed, 발현조직, 관련 패스웨이)
- **쉬운 설명 모드** — ON 시 Interactive Micro-Map(분자 의인화 애니메이션) 등장
- **연관 패스웨이 이동** — 도감/사이드바에서 클릭 시 즉시 이동 + 브레드크럼 갱신
- **미니맵** — 현재 위치 하이라이트, 열기/닫기 토글(닫아도 재오픈 아이콘 유지)
- **다크/라이트 테마 토글**, **브레드크럼 + 전역 검색**
- **북마크 버튼** — 비로그인 안내(Phase 2 인증 연동 자리)

## 기술 스택

Next.js 15 (App Router) · TypeScript · Three.js + React Three Fiber + Drei ·
Cytoscape.js · Zustand · Framer Motion · Tailwind CSS · next-themes

## 데이터

현재는 `src/lib/`의 큐레이션 데이터를 사용합니다 — 5개 장기 · 20개 조직 ·
16개 패스웨이(KEGG/Reactome) · 55개 유전자. 타입(`src/lib/types.ts`)은
NCBI E-utilities / KEGG REST / Reactome / PDB / PubMed API 응답이 그대로
매핑되도록 설계되어, 추후 `Next.js API Routes` 프록시로 교체할 수 있습니다.

## 로드맵 (PRD §7)

- **다음** — Supabase 인증 + 북마크/마이페이지, 실제 외부 API 연동
- **이후** — 전신 커버 확대, 유전자 색상 분류 체계 고도화, glb 고해상도 3D 에셋
