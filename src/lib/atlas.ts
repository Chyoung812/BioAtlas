import { Organ, Pathway } from "./types";
import { GENES, SYNONYMS } from "./genes";
import { findGeneDistribution } from "./expression";

// ── 패스웨이 데이터 (장기별 큐레이션, 출처는 모두 Reactome) ──────────────
// network는 Cytoscape에 그대로 전달됩니다.
// 각 노드 심볼은 반드시 lib/genes.ts 에 상세 항목이 존재해야 합니다.
export const PATHWAYS: Record<string, Pathway> = {
  // ═══════════════ 뇌 (Brain) ═══════════════
  "R-HSA-109606": {
    id: "R-HSA-109606",
    name: "신경세포 사멸 경로 (Apoptosis)",
    nameEn: "Intrinsic Pathway for Apoptosis",
    source: "Reactome",
    sourceId: "R-HSA-109606",
    category: "세포사멸",
    relevance: 0.95,
    summary:
      "내부 스트레스나 DNA 손상이 미토콘드리아 경로를 통해 카스파제를 활성화시켜 신경세포를 계획적으로 사멸시키는 경로입니다.",
    guide: {
      role: "손상되거나 필요 없는 세포를 카스파제로 계획적으로 없애는 경로예요.",
      how: "DNA 손상 같은 내부 스트레스가 오면 미토콘드리아 막에 구멍이 나 시토크롬 c가 나와요. 이것이 APAF1과 카스파제-9를 거쳐 실행 카스파제(카스파제-3)를 켜요.",
      ifBroken: "죽음 신호와 생존 신호의 균형이 세포가 죽을지, 살지, 증식할지를 정해요. 이 균형이 한쪽으로 기울면 없어져야 할 세포가 남거나 살아야 할 세포가 사라져요.",
    },
    relatedPathwayIds: ["R-HSA-418594", "R-HSA-5633008"],
    network: {
      nodes: [
        { id: "TP53", label: "TP53", geneId: "7157", role: "tumor_suppressor" },
        { id: "BAX", label: "BAX", geneId: "581", role: "signaling" },
        { id: "BCL2", label: "BCL2", geneId: "596", role: "oncogene" },
        { id: "CYCS", label: "CYCS", geneId: "54205", role: "signaling" },
        { id: "APAF1", label: "APAF1", geneId: "317", role: "signaling" },
        { id: "CASP3", label: "CASP3", geneId: "836", role: "signaling" },
        {
          id: "CREB1",
          label: "CREB1",
          geneId: "1385",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "생존 신호를 받아 세포자멸을 막는 BCL2의 발현을 늘리는 전사인자예요. 세포자멸을 억제하는 쪽 흐름을 보여주려고 함께 표시해요. CREB가 BCL2 프로모터의 CRE 부위를 통해 발현을 올린다는 세포 실험 근거가 있어요.",
            evidence: ["PMID:10488088", "PMID:10753867", "Reactome:R-HSA-418594"],
          },
        },
      ],
      edges: [
        { source: "TP53", target: "BAX", mechanism: "activation" },
        { source: "BCL2", target: "BAX", mechanism: "inhibition" },
        { source: "BAX", target: "CYCS", mechanism: "activation" },
        { source: "CYCS", target: "APAF1", mechanism: "activation" },
        { source: "APAF1", target: "CASP3", mechanism: "activation" },
        { source: "CREB1", target: "BCL2", mechanism: "activation" },
        { source: "TP53", target: "CASP3", mechanism: "interaction" },
      ],
    },
  },
  "R-HSA-418594": {
    id: "R-HSA-418594",
    name: "도파민 수용체 신호 전달",
    nameEn: "G alpha (i) signalling events",
    source: "Reactome",
    sourceId: "R-HSA-418594",
    category: "신호전달",
    relevance: 0.82,
    summary:
      "도파민이 D2 수용체에 결합해 G단백질을 거쳐 세포 내 신호를 전달하고, 최종적으로 유전자 발현과 신경세포 생존에 영향을 주는 경로입니다.",
    guide: {
      role: "도파민이 운동, 동기·보상, 학습·기억, 호르몬 조절을 이끄는 신경 신호 경로예요.",
      how: "D1 계열 수용체는 cAMP를 늘리고, D2 계열 수용체는 cAMP를 줄여요. 이 앱에서는 D2 수용체(DRD2) → G단백질(GNAI2) → CREB1로 이어지는 흐름을 보여줘요.",
      ifBroken: "이 경로의 핵심 수용체 DRD2의 변이는 근긴장이상증, 조현병과의 연관이 보고됐어요.",
    },
    relatedPathwayIds: ["R-HSA-109606"],
    network: {
      nodes: [
        {
          id: "DRD2",
          label: "DRD2",
          geneId: "1813",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "도파민을 받아 Gi 단백질(GNAI2)을 켜는 D2 수용체예요. Reactome은 수용체를 도파민 수용체 목록에, 그 뒤의 Gi 신호를 이 경로에 나눠 두어서 수용체를 함께 표시해요.",
            evidence: ["Reactome:R-HSA-390651"],
          },
        },
        { id: "GNAI2", label: "GNAI2", geneId: "2771", role: "signaling" },
        { id: "CREB1", label: "CREB1", geneId: "1385", role: "signaling" },
        {
          id: "BCL2",
          label: "BCL2",
          geneId: "596",
          role: "oncogene",
          membership: "contextual",
          context: {
            reason:
              "CREB1이 발현을 늘리는 항사멸 단백질이에요. 도파민 신호가 CREB1을 거쳐 신경세포 생존으로 이어질 수 있는 흐름을 보여주려고 함께 표시해요.",
            evidence: ["PMID:10488088", "Reactome:R-HSA-109606"],
          },
        },
      ],
      edges: [
        { source: "DRD2", target: "GNAI2", mechanism: "activation" },
        { source: "GNAI2", target: "CREB1", mechanism: "inhibition" },
        { source: "CREB1", target: "BCL2", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-5633008": {
    id: "R-HSA-5633008",
    name: "p53 의존성 세포자멸 조절",
    nameEn: "TP53 Regulates Transcription of Cell Death Genes",
    source: "Reactome",
    sourceId: "R-HSA-5633008",
    category: "세포사멸",
    relevance: 0.74,
    summary:
      "DNA 손상 시 p53이 안정화·축적되어 사멸 관련 유전자의 전사를 유도하는 조절 경로입니다.",
    guide: {
      role: "DNA 손상 같은 스트레스로 p53이 켜지면, 표적 유전자를 켜서 세포 분열을 멈추거나(세포 주기 정지) 노화시키거나 스스로 사라지게 하는 경로예요.",
      how: "평소에는 MDM2가 p53을 분해로 보내요. 방사선 등으로 DNA가 손상되면 ATM 인산화효소가 직접 또는 다른 효소를 거쳐 p53에 인산기를 붙이고, 이것이 MDM2와의 결합을 방해해요. 쌓인 p53은 BAX·APAF1 같은 사멸 유전자를 켜요.",
      ifBroken: "p53이 안정화되지 못하면 DNA가 망가진 세포를 멈추거나 없애지 못해요. TP53 돌연변이가 여러 암과 관련 있는 이유예요.",
    },
    relatedPathwayIds: ["R-HSA-109606"],
    network: {
      nodes: [
        { id: "TP53", label: "TP53", geneId: "7157", role: "tumor_suppressor" },
        { id: "BAX", label: "BAX", geneId: "581", role: "signaling" },
        { id: "APAF1", label: "APAF1", geneId: "317", role: "signaling" },
      ],
      edges: [
        { source: "TP53", target: "BAX", mechanism: "activation" },
        { source: "TP53", target: "APAF1", mechanism: "activation" },
      ],
    },
  },

  // ═══════════════ 심장 (Heart) ═══════════════
  "R-HSA-397014": {
    id: "R-HSA-397014",
    name: "심근 수축 (Cardiac muscle contraction)",
    nameEn: "Muscle contraction",
    source: "Reactome",
    sourceId: "R-HSA-397014",
    category: "신호전달",
    relevance: 0.93,
    summary:
      "L형 칼슘 통로로 들어온 칼슘이 근소포체의 리아노딘 수용체를 열어 대량의 칼슘을 방출하고(칼슘 유발 칼슘 방출), 이 칼슘이 트로포닌에 결합해 액틴-미오신 수축을 일으키는 경로입니다.",
    guide: {
      role: "전기 자극을 받은 심근 세포가 수축했다가 이완하는 과정이에요.",
      how: "L형 칼슘 통로로 들어온 칼슘이 RYR2를 열어 창고의 칼슘을 대량으로 내보내요. 칼슘이 트로포닌에 붙으면 필라멘트가 미끄러지며 수축하고, SERCA 펌프가 칼슘을 창고로 되돌리면 이완돼요.",
      ifBroken: "부품 하나가 고장 나도 리듬과 수축력이 흔들려요. 예를 들어 RYR2 돌연변이는 스트레스성 심실빈맥, PLN 돌연변이는 확장성 심근증과 관련 있어요.",
    },
    relatedPathwayIds: ["R-HSA-5576891", "R-HSA-390522"],
    network: {
      nodes: [
        { id: "CACNA1C", label: "CACNA1C", geneId: "775", role: "signaling" },
        { id: "RYR2", label: "RYR2", geneId: "6262", role: "signaling" },
        { id: "ATP2A2", label: "ATP2A2", geneId: "488", role: "signaling" },
        { id: "PLN", label: "PLN", geneId: "5350", role: "signaling" },
        { id: "TNNT2", label: "TNNT2", geneId: "7139", role: "structural" },
        {
          id: "MYH7",
          label: "MYH7",
          geneId: "4625",
          role: "structural",
          membership: "contextual",
          context: {
            reason:
              "심근의 두꺼운 필라멘트를 이루는 β-미오신 중쇄로, 액틴을 당겨 실제 수축을 만드는 모터 단백질이에요. 이 Reactome 근수축 경로 참여자 목록에는 없지만 수축의 핵심이라 함께 표시해요.",
            evidence: ["NCBI:4625"],
          },
        },
        { id: "ACTC1", label: "ACTC1", geneId: "70", role: "structural" },
      ],
      edges: [
        { source: "CACNA1C", target: "RYR2", mechanism: "activation" },
        { source: "RYR2", target: "TNNT2", mechanism: "activation" },
        { source: "TNNT2", target: "MYH7", mechanism: "activation" },
        { source: "MYH7", target: "ACTC1", mechanism: "interaction" },
        { source: "PLN", target: "ATP2A2", mechanism: "inhibition" },
        { source: "ATP2A2", target: "RYR2", mechanism: "interaction" },
      ],
    },
  },
  "R-HSA-5576891": {
    id: "R-HSA-5576891",
    name: "아드레날린성 심근 신호전달",
    nameEn: "Cardiac conduction",
    source: "Reactome",
    sourceId: "R-HSA-5576891",
    category: "신호전달",
    relevance: 0.85,
    summary:
      "교감신경 자극(아드레날린)이 β1 수용체→Gs단백질→PKA를 거쳐 칼슘 통로와 인단백질(PLN)을 인산화하여 심박수와 수축력을 높이는 경로입니다.",
    guide: {
      role: "교감신경이 흥분할 때 심장을 더 세고 빠르게 뛰게 하는 경로예요. 심장 박출량을 급히 늘리는 가장 효과적인 방법이에요.",
      how: "아드레날린이 β1 수용체에 붙으면 Gs → cAMP → PKA 순서로 신호가 전달돼, 리아노딘 수용체·포스포람반·L형 칼슘 통로 등에 인산기가 붙어요.",
      ifBroken: "이 자극이 오랫동안 계속되면 오히려 해로워서 심근 비대와 세포자멸이 생겨요.",
    },
    relatedPathwayIds: ["R-HSA-397014"],
    network: {
      nodes: [
        {
          id: "ADRB1",
          label: "ADRB1",
          geneId: "153",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "교감신경의 아드레날린을 받는 β1 수용체예요. Reactome은 수용체와 Gs 신호를 별도 경로에 두어서, 심장 전도를 바꾸는 출발점을 보여주려고 함께 표시해요.",
            evidence: ["Reactome:R-HSA-418555"],
          },
        },
        {
          id: "GNAS",
          label: "GNAS",
          geneId: "2778",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "β1 수용체 신호를 받아 cAMP를 늘려 PKA를 켜는 Gs 단백질이에요. 수용체와 PKA 사이를 잇는 단계라 함께 표시해요.",
            evidence: ["Reactome:R-HSA-418555"],
          },
        },
        { id: "PRKACA", label: "PRKACA", geneId: "5566", role: "signaling" },
        { id: "PLN", label: "PLN", geneId: "5350", role: "signaling" },
        { id: "RYR2", label: "RYR2", geneId: "6262", role: "signaling" },
        { id: "CACNA1C", label: "CACNA1C", geneId: "775", role: "signaling" },
      ],
      edges: [
        { source: "ADRB1", target: "GNAS", mechanism: "activation" },
        { source: "GNAS", target: "PRKACA", mechanism: "activation" },
        { source: "PRKACA", target: "PLN", mechanism: "activation" },
        { source: "PRKACA", target: "CACNA1C", mechanism: "activation" },
        { source: "PRKACA", target: "RYR2", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-390522": {
    id: "R-HSA-390522",
    name: "근절 수축 단백질 (비대성 심근증)",
    nameEn: "Striated Muscle Contraction",
    source: "Reactome",
    sourceId: "R-HSA-390522",
    category: "발달",
    relevance: 0.76,
    summary:
      "근절(sarcomere)을 이루는 구조 단백질들의 돌연변이가 심근 섬유의 배열을 흐트러뜨려 심실벽이 두꺼워지는 유전성 심근질환과 관련된 상호작용망입니다.",
    guide: {
      role: "근절 단백질 유전자의 돌연변이로 좌심실 벽이 두꺼워지는 유전성 심근 질환이에요. 젊은 성인 500명 중 1명꼴로 흔한 편이에요.",
      how: "돌연변이가 근육 필라멘트의 칼슘 민감도를 높이면 ATP를 비효율적으로 써서, 심한 스트레스 때 에너지 공급과 수요가 어긋날 수 있어요. 심실 비대는 근절 기능 이상을 보상하려는 반응으로 생긴다는 견해가 많아요.",
      ifBroken: "심근 세포가 커지고 배열이 흐트러지며 섬유화가 생겨요. 심장이 잘 이완하지 못하는 이완기 기능 장애가 나타나요.",
    },
    relatedPathwayIds: ["R-HSA-397014"],
    network: {
      nodes: [
        {
          id: "MYH7",
          label: "MYH7",
          geneId: "4625",
          role: "structural",
          membership: "contextual",
          context: {
            reason:
              "심근의 두꺼운 필라멘트를 이루는 β-미오신 중쇄로, 액틴을 당겨 실제 수축을 만드는 모터 단백질이에요. 이 Reactome 횡문근 수축 경로 참여자 목록에는 없지만 수축의 핵심이라 함께 표시해요.",
            evidence: ["NCBI:4625"],
          },
        },
        { id: "MYBPC3", label: "MYBPC3", geneId: "4607", role: "structural" },
        { id: "TNNT2", label: "TNNT2", geneId: "7139", role: "structural" },
        { id: "TPM1", label: "TPM1", geneId: "7168", role: "structural" },
        { id: "ACTC1", label: "ACTC1", geneId: "70", role: "structural" },
      ],
      edges: [
        { source: "MYH7", target: "MYBPC3", mechanism: "interaction" },
        { source: "MYH7", target: "ACTC1", mechanism: "interaction" },
        { source: "TNNT2", target: "TPM1", mechanism: "interaction" },
        { source: "TPM1", target: "ACTC1", mechanism: "interaction" },
        { source: "MYBPC3", target: "ACTC1", mechanism: "interaction" },
      ],
    },
  },

  // ═══════════════ 간 (Liver) ═══════════════
  "R-HSA-194068": {
    id: "R-HSA-194068",
    name: "담즙산 대사 (Bile acid metabolism)",
    nameEn: "Bile acid and bile salt metabolism",
    source: "Reactome",
    sourceId: "R-HSA-194068",
    category: "대사",
    relevance: 0.88,
    summary:
      "핵수용체 FXR(NR1H4)가 담즙산 농도를 감지해 담즙산 배출펌프(BSEP)를 켜고, 담즙산 합성 효소(CYP7A1)를 억제하여 담즙산 항상성을 유지하는 경로입니다.",
    guide: {
      role: "간이 담즙을 만들어 내보내는 과정이에요. 담즙은 지방과 지용성 비타민의 소화·흡수를 돕고, 남는 콜레스테롤·빌리루빈·약물을 몸 밖으로 내보내는 길이에요.",
      how: "간세포가 모세담관으로 1차 담즙을 내보내고, 담관세포가 흘러가는 담즙을 다듬어요. 담즙산은 핵수용체(FXR)를 켜서 스스로의 합성과 수송 속도를 조절해요.",
      ifBroken: "배출 펌프 ABCB11이 고장 나면 담즙이 간에 쌓여 진행성 가족성 간내 담즙정체증이 생겨요.",
    },
    relatedPathwayIds: ["R-HSA-2426168"],
    network: {
      nodes: [
        { id: "NR1H4", label: "NR1H4", geneId: "9971", role: "signaling" },
        { id: "ABCB11", label: "ABCB11", geneId: "8647", role: "signaling" },
        { id: "CYP7A1", label: "CYP7A1", geneId: "1581", role: "signaling" },
        { id: "SLC10A1", label: "SLC10A1", geneId: "6554", role: "signaling" },
      ],
      edges: [
        { source: "SLC10A1", target: "NR1H4", mechanism: "activation" },
        { source: "NR1H4", target: "ABCB11", mechanism: "activation" },
        { source: "NR1H4", target: "CYP7A1", mechanism: "inhibition" },
      ],
    },
  },
  "R-HSA-2426168": {
    id: "R-HSA-2426168",
    name: "지질·지방산 대사",
    nameEn: "Activation of gene expression by SREBF (SREBP)",
    source: "Reactome",
    sourceId: "R-HSA-2426168",
    category: "대사",
    relevance: 0.85,
    summary:
      "전사인자 SREBP-1(SREBF1)이 지방산·콜레스테롤 합성 효소를 켜서 지질을 만들고, PPARα는 지방산 산화를 촉진해 이에 균형을 맞추는 간의 핵심 지질 대사 경로입니다.",
    guide: {
      role: "간에서 지방산과 콜레스테롤을 만드는 쪽과 태우는 쪽의 균형을 조절하는 과정이에요.",
      how: "SREBP-1(SREBF1)이 지방산 합성 효소 FASN, 콜레스테롤 합성 효소 HMGCR, LDL 수용체 LDLR을 켜요. PPARα는 SREBP-1을 억제하는 쪽으로 연결돼 균형을 맞춰요.",
      ifBroken: "LDLR 돌연변이는 가족성 고콜레스테롤혈증을 일으키고, HMGCR을 막는 약은 혈중 LDL 콜레스테롤을 낮춰요.",
    },
    relatedPathwayIds: ["R-HSA-194068", "R-HSA-211897"],
    network: {
      nodes: [
        { id: "SREBF1", label: "SREBF1", geneId: "6720", role: "signaling" },
        { id: "FASN", label: "FASN", geneId: "2194", role: "signaling" },
        { id: "HMGCR", label: "HMGCR", geneId: "3156", role: "signaling" },
        {
          id: "LDLR",
          label: "LDLR",
          geneId: "3949",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "혈액의 LDL 콜레스테롤을 세포로 들이고, 들어온 콜레스테롤이 합성 효소 HMGCR을 억제하는 되먹임을 보여주려고 함께 표시해요. SREBF1의 결합 부위가 LDL 수용체 유전자 프로모터에 있다는 사실은 NCBI SREBF1 요약에 나와 있어요.",
            evidence: ["Reactome:R-HSA-8964038", "NCBI:3949"],
          },
        },
        { id: "PPARA", label: "PPARA", geneId: "5465", role: "signaling" },
      ],
      edges: [
        { source: "SREBF1", target: "FASN", mechanism: "activation" },
        { source: "SREBF1", target: "HMGCR", mechanism: "activation" },
        { source: "SREBF1", target: "LDLR", mechanism: "activation" },
        { source: "PPARA", target: "SREBF1", mechanism: "inhibition" },
      ],
    },
  },
  "R-HSA-211897": {
    id: "R-HSA-211897",
    name: "약물 대사 — 사이토크롬 P450",
    nameEn: "Cytochrome P450 - arranged by substrate type",
    source: "Reactome",
    sourceId: "R-HSA-211897",
    category: "대사",
    relevance: 0.8,
    summary:
      "핵수용체 PXR(NR1I2)이 약물·이물질을 감지하면 간의 대표 해독 효소 CYP3A4·CYP2E1의 발현을 늘려 이를 산화·분해(1상 대사)하는 경로입니다.",
    guide: {
      role: "간이 약물과 외부 물질을 산화해 분해하는 과정이에요.",
      how: "PXR(NR1I2)이 덱사메타손·리팜피신 같은 물질을 감지하면 CYP3A4 발현을 늘려요. CYP3A4는 현재 쓰이는 약의 약 절반을, CYP2E1은 알코올과 여러 독성 물질을 분해해요.",
      ifBroken: "여러 약이 같은 효소를 쓰기 때문에, 한 약이 효소를 늘리거나 막으면 다른 약의 분해 속도도 달라질 수 있어요.",
    },
    relatedPathwayIds: ["R-HSA-2426168"],
    network: {
      nodes: [
        {
          id: "NR1I2",
          label: "NR1I2",
          geneId: "8856",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "약물을 감지해 해독 효소 CYP3A4의 발현을 늘리는 핵수용체(PXR)예요. 해독 효소가 언제 늘어나는지 보여주려고 함께 표시해요.",
            evidence: ["NCBI:8856"],
          },
        },
        { id: "CYP3A4", label: "CYP3A4", geneId: "1576", role: "signaling" },
        { id: "CYP2E1", label: "CYP2E1", geneId: "1571", role: "signaling" },
      ],
      edges: [
        { source: "NR1I2", target: "CYP3A4", mechanism: "activation" },
        { source: "NR1I2", target: "CYP2E1", mechanism: "interaction" },
      ],
    },
  },

  // ═══════════════ 폐 (Lung) ═══════════════
  "R-HSA-5683826": {
    id: "R-HSA-5683826",
    name: "폐 표면활성물질 대사 (Surfactant)",
    nameEn: "Surfactant metabolism",
    source: "Reactome",
    sourceId: "R-HSA-5683826",
    category: "대사",
    relevance: 0.9,
    summary:
      "지질 수송체 ABCA3가 표면활성물질 지질을 판층소체로 옮기고, 표면활성단백 SP-B/SP-C가 이를 폐포 표면에 펼쳐 표면장력을 낮춰 폐포가 쭈그러들지 않게 하는 경로입니다.",
    guide: {
      role: "폐포 제2형 세포가 표면활성물질을 만들어 폐포가 쪼그라들지 않게 하는 과정이에요.",
      how: "표면활성물질은 주로 인지질과 표면활성단백질 A~D로 이루어져, 폐포의 공기-액체 경계에 얇은 막을 만들고 표면장력을 낮춰요. 태어나기 전에 생산이 늘어 출생 직후 숨 쉴 준비를 해요.",
      ifBroken: "제2형 세포가 덜 자란 미숙아는 표면활성물질이 모자라 호흡곤란 증후군이 생길 수 있어요.",
    },
    relatedPathwayIds: ["R-HSA-1234174"],
    network: {
      nodes: [
        { id: "ABCA3", label: "ABCA3", geneId: "21", role: "signaling" },
        { id: "SFTPB", label: "SFTPB", geneId: "6439", role: "structural" },
        { id: "SFTPC", label: "SFTPC", geneId: "6440", role: "structural" },
        { id: "SFTPA1", label: "SFTPA1", geneId: "653509", role: "structural" },
      ],
      edges: [
        { source: "ABCA3", target: "SFTPB", mechanism: "activation" },
        { source: "ABCA3", target: "SFTPC", mechanism: "activation" },
        { source: "SFTPB", target: "SFTPC", mechanism: "interaction" },
        { source: "SFTPA1", target: "SFTPB", mechanism: "interaction" },
      ],
    },
  },
  "R-HSA-1234174": {
    id: "R-HSA-1234174",
    name: "HIF-1 저산소 신호전달",
    nameEn: "Cellular response to hypoxia",
    source: "Reactome",
    sourceId: "R-HSA-1234174",
    category: "신호전달",
    relevance: 0.83,
    summary:
      "산소가 충분할 때는 VHL이 HIF-1α를 분해하지만, 저산소 상태가 되면 HIF-1α가 안정화되어 혈관 신생인자(VEGFA) 등을 켜서 산소 공급을 늘리는 경로입니다.",
    guide: {
      role: "몸의 산소 균형을 지키는 핵심 조절 경로예요.",
      how: "산소가 충분하면 HIF-1α에 표지가 붙어 바로 분해돼요. 산소가 부족하면 안정화되어, 산소 공급을 늘리고 저산소에 적응하게 하는 유전자들(예: 혈관을 만드는 VEGFA)을 켜요.",
      ifBroken: "분해를 맡는 VHL이 고장 나면 폰히펠-린다우 증후군, 신장세포암 같은 질환과 연결돼요.",
    },
    relatedPathwayIds: ["R-HSA-5683826"],
    network: {
      nodes: [
        { id: "HIF1A", label: "HIF1A", geneId: "3091", role: "signaling" },
        { id: "VHL", label: "VHL", geneId: "7428", role: "tumor_suppressor" },
        { id: "VEGFA", label: "VEGFA", geneId: "7422", role: "signaling" },
      ],
      edges: [
        { source: "VHL", target: "HIF1A", mechanism: "inhibition" },
        { source: "HIF1A", target: "VEGFA", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-6785807": {
    id: "R-HSA-6785807",
    name: "IL-4·IL-13 신호 (천식)",
    nameEn: "Interleukin-4 and Interleukin-13 signaling",
    source: "Reactome",
    sourceId: "R-HSA-6785807",
    category: "면역",
    relevance: 0.77,
    summary:
      "제2형 면역 사이토카인 IL-4/IL-13이 기도 상피를 자극해 점액 단백(MUC5AC) 분비를 늘리고 기도 염증·과민반응을 일으키는 알레르기성 천식 경로입니다.",
    guide: {
      role: "기도가 좁아지고 과민해지며 염증이 생기는 알레르기성 천식의 경로예요.",
      how: "들이마신 알레르겐에 반응해 T세포가 Th2 세포로 분화하고, B세포가 IgE를 만들어요. IgE가 붙은 비만세포가 알레르겐을 만나면 히스타민 등을 쏟아내 증상이 시작돼요.",
      ifBroken: "모여든 호산구가 독성 물질과 활성산소를 내보내 조직이 손상되고, 만성 염증으로 이어져요.",
    },
    relatedPathwayIds: ["R-HSA-1234174"],
    network: {
      nodes: [
        { id: "IL4", label: "IL4", geneId: "3565", role: "signaling" },
        { id: "IL13", label: "IL13", geneId: "3596", role: "signaling" },
        {
          id: "MUC5AC",
          label: "MUC5AC",
          geneId: "4586",
          role: "structural",
          membership: "contextual",
          context: {
            reason:
              "IL-13이 기관지 상피에서 점액 단백 MUC5AC를 늘려 천식의 점액 과다 분비로 이어지는 흐름을 보여주려고 함께 표시해요.",
            evidence: ["PMID:36684665",  "PMID:33682796"],
          },
        },
      ],
      edges: [
        { source: "IL4", target: "IL13", mechanism: "interaction" },
        { source: "IL13", target: "MUC5AC", mechanism: "activation" },
      ],
    },
  },

  // ═══════════════ 신장 (Kidney) ═══════════════
  "R-HSA-2022377": {
    id: "R-HSA-2022377",
    name: "레닌-안지오텐신계 (RAS)",
    nameEn: "Metabolism of Angiotensinogen to Angiotensins",
    source: "Reactome",
    sourceId: "R-HSA-2022377",
    category: "신호전달",
    relevance: 0.88,
    summary:
      "레닌(REN)이 안지오텐시노겐(AGT)을 잘라 안지오텐신 I을 만들고, ACE가 이를 안지오텐신 II로 전환해 수용체 AGTR1을 자극함으로써 혈압과 체액량을 조절하는 경로입니다.",
    guide: {
      role: "혈압과 체액·전해질 균형을 조절하는 호르몬 경로예요.",
      how: "레닌이 안지오텐시노겐을 잘라 안지오텐신 I을 만들고, ACE가 이를 안지오텐신 II로 바꿔요. 안지오텐신 II가 AT1 수용체(AGTR1)에 붙으면 혈관 수축, 신장의 나트륨 재흡수, 알도스테론 분비가 일어나 혈압이 올라요.",
      ifBroken: "이 경로가 과하게 작동하면 고혈압에 기여해요. 그래서 ACE 억제제처럼 이 경로를 막는 약이 혈압약으로 쓰여요.",
    },
    relatedPathwayIds: ["R-HSA-2672351"],
    network: {
      nodes: [
        { id: "REN", label: "REN", geneId: "5972", role: "signaling" },
        { id: "AGT", label: "AGT", geneId: "183", role: "signaling" },
        { id: "ACE", label: "ACE", geneId: "1636", role: "signaling" },
        {
          id: "AGTR1",
          label: "AGTR1",
          geneId: "185",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "안지오텐신 II를 받아 혈관 수축과 알도스테론 분비를 일으키는 AT1 수용체예요. 이 Reactome 경로는 안지오텐신이 만들어지는 과정까지 다뤄서, 그 신호를 받는 수용체를 함께 표시해요.",
            evidence: ["Reactome:R-HSA-375276"],
          },
        },
      ],
      edges: [
        { source: "REN", target: "AGT", mechanism: "activation" },
        { source: "AGT", target: "ACE", mechanism: "activation" },
        { source: "ACE", target: "AGTR1", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-2672351": {
    id: "R-HSA-2672351",
    name: "알도스테론 조절 나트륨 재흡수",
    nameEn: "Stimuli-sensing channels",
    source: "Reactome",
    sourceId: "R-HSA-2672351",
    category: "신호전달",
    relevance: 0.84,
    summary:
      "안지오텐신 II가 유도한 알도스테론이 미네랄로코르티코이드 수용체(NR3C2)를 활성화하고, SGK1을 거쳐 상피 나트륨 통로(ENaC, SCNN1A)를 늘려 나트륨과 수분을 재흡수하는 경로입니다.",
    guide: {
      role: "알도스테론이 신장에서 나트륨을 다시 흡수하게 해, 몸의 나트륨 양과 장기적인 혈압을 정하는 경로예요.",
      how: "알도스테론이 집합관 세포의 MR(NR3C2)에 붙으면 SGK1이 늘어요. SGK1이 나트륨 통로(ENaC)를 분해로 보내는 Nedd4-2를 떼어 놓아, 세포막의 나트륨 통로가 늘고 나트륨 흡수와 칼륨 배출이 증가해요.",
      ifBroken: "MR이나 ENaC가 고장 나면 몸이 알도스테론에 반응하지 못해 소금이 빠져나가는 1형 가성저알도스테론증이 생겨요.",
    },
    relatedPathwayIds: ["R-HSA-2022377", "R-HSA-432040"],
    network: {
      nodes: [
        {
          id: "AGTR1",
          label: "AGTR1",
          geneId: "185",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "안지오텐신 II를 받아 알도스테론 분비를 일으키는 수용체예요. 이 경로의 출발점인 알도스테론이 어디서 오는지 보여주려고 함께 표시해요.",
            evidence: ["Reactome:R-HSA-375276", "NCBI:185"],
          },
        },
        {
          id: "NR3C2",
          label: "NR3C2",
          geneId: "4306",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "알도스테론을 받아 SGK1 발현을 늘리는 미네랄로코르티코이드 수용체예요. Reactome은 핵수용체 전사 경로에 따로 두어서, 나트륨 통로 조절의 출발점을 보여주려고 함께 표시해요.",
            evidence: ["Reactome:R-HSA-383280"],
          },
        },
        { id: "SGK1", label: "SGK1", geneId: "6446", role: "signaling" },
        { id: "SCNN1A", label: "SCNN1A", geneId: "6337", role: "signaling" },
      ],
      edges: [
        { source: "AGTR1", target: "NR3C2", mechanism: "activation" },
        { source: "NR3C2", target: "SGK1", mechanism: "activation" },
        { source: "SGK1", target: "SCNN1A", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-432040": {
    id: "R-HSA-432040",
    name: "바소프레신 조절 수분 재흡수",
    nameEn: "Vasopressin regulates renal water homeostasis via Aquaporins",
    source: "Reactome",
    sourceId: "R-HSA-432040",
    category: "신호전달",
    relevance: 0.8,
    summary:
      "항이뇨호르몬(바소프레신)이 V2 수용체(AVPR2)→Gs→PKA 경로를 켜서 물통로 아쿠아포린2(AQP2)를 세포막으로 이동시켜 집합관에서 수분을 재흡수하는 경로입니다.",
    guide: {
      role: "항이뇨호르몬(바소프레신)이 신장에서 물을 다시 흡수하게 해 몸의 수분 균형을 지키는 경로예요.",
      how: "혈액이 진해지거나 순환 혈액량이 줄면 뇌하수체에서 바소프레신이 나와요. 집합관의 V2 수용체에 붙으면 AQP2 물 통로가 세포막에 박혀 물이 재흡수되고, 균형이 돌아오면 AQP2가 다시 세포 안으로 들어가요.",
      ifBroken: "V2 수용체(AVPR2)나 AQP2가 고장 나면 신성 요붕증이 생겨요.",
    },
    relatedPathwayIds: ["R-HSA-2672351"],
    network: {
      nodes: [
        { id: "AVPR2", label: "AVPR2", geneId: "554", role: "signaling" },
        { id: "GNAS", label: "GNAS", geneId: "2778", role: "signaling" },
        { id: "PRKACA", label: "PRKACA", geneId: "5566", role: "signaling" },
        { id: "AQP2", label: "AQP2", geneId: "359", role: "structural" },
      ],
      edges: [
        { source: "AVPR2", target: "GNAS", mechanism: "activation" },
        { source: "GNAS", target: "PRKACA", mechanism: "activation" },
        { source: "PRKACA", target: "AQP2", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-373753": {
    id: "R-HSA-373753",
    name: "사구체 여과 장벽 (족세포)",
    nameEn: "Nephrin family interactions",
    source: "Reactome",
    sourceId: "R-HSA-373753",
    category: "발달",
    relevance: 0.75,
    summary:
      "족세포(podocyte)의 슬릿막 단백질 네프린(NPHS1)·포도신(NPHS2)과 포도칼릭신(PODXL)이 정교한 여과 틈을 만들어 혈액에서 소변을 걸러내되 단백질은 새지 않게 하는 구조 상호작용망입니다.",
    guide: {
      role: "사구체에서 혈액을 걸러 소변을 만들 때, 알부민 같은 큰 단백질은 빠져나가지 못하게 막는 여과 장벽이에요.",
      how: "족세포의 발돌기가 서로 맞물려 사구체 기저막 바깥을 덮고, 그 사이 틈을 네프린(NPHS1)이 만드는 슬릿막이 거르는 것으로 여겨져요. 포도신(NPHS2)과 포도칼릭신(PODXL)도 이 구조에 관여해요.",
      ifBroken: "네프린 돌연변이는 핀란드형 선천성 신증후군을, 포도신 돌연변이는 스테로이드 저항성 신증후군을 일으켜요.",
    },
    relatedPathwayIds: ["R-HSA-2022377"],
    network: {
      nodes: [
        { id: "NPHS1", label: "NPHS1", geneId: "4868", role: "structural" },
        { id: "NPHS2", label: "NPHS2", geneId: "7827", role: "structural" },
        {
          id: "PODXL",
          label: "PODXL",
          geneId: "5420",
          role: "structural",
          membership: "contextual",
          context: {
            reason:
              "사구체 족세포의 중요한 구성 요소로 처음 발견된 단백질이라, 여과 장벽 구조를 함께 보여주려고 표시해요. 이 Reactome 경로(네프린 상호작용)에는 포함되지 않아요.",
            evidence: ["NCBI:5420"],
          },
        },
      ],
      edges: [
        { source: "NPHS1", target: "NPHS2", mechanism: "interaction" },
        { source: "NPHS2", target: "PODXL", mechanism: "interaction" },
        { source: "NPHS1", target: "PODXL", mechanism: "interaction" },
      ],
    },
  },

  // ═══════════════ 췌장 (Pancreas) ═══════════════
  "R-HSA-422356": {
    id: "R-HSA-422356",
    name: "인슐린 분비 (Insulin secretion)",
    nameEn: "Regulation of insulin secretion",
    source: "Reactome",
    sourceId: "R-HSA-422356",
    category: "신호전달",
    relevance: 0.92,
    summary:
      "혈당이 오르면 베타세포가 포도당을 감지(GCK)해 ATP를 만들고, 이 ATP가 K-ATP 통로(KCNJ11·ABCC8)를 닫아 세포를 흥분시켜 인슐린(INS)을 분비합니다. GLP-1 수용체는 이 분비를 증폭합니다.",
    guide: {
      role: "췌장 베타세포가 혈당을 감지해 인슐린을 내보내는 과정이에요.",
      how: "포도당이 베타세포로 들어와 대사되면 ATP가 늘고, ATP가 K-ATP 통로(KCNJ11·ABCC8)를 닫아요. 그러면 칼슘이 들어와 인슐린 과립이 분비돼요. GLP-1은 cAMP를 올려 이 분비를 증폭해요.",
      ifBroken: "이 경로 유전자의 돌연변이는 인슐린이 부족한 여러 형태의 당뇨병, 또는 인슐린이 과하게 나오는 영아 고인슐린혈성 저혈당증을 일으켜요.",
    },
    relatedPathwayIds: ["R-HSA-8935690"],
    network: {
      nodes: [
        {
          id: "GCK",
          label: "GCK",
          geneId: "2645",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "베타세포가 혈당을 감지하는 첫 단계인 포도당 인산화효소예요. Reactome은 베타세포 유전자 발현 경로에 따로 두어서, 인슐린 분비의 출발점을 보여주려고 함께 표시해요.",
            evidence: ["Reactome:R-HSA-210745"],
          },
        },
        { id: "ABCC8", label: "ABCC8", geneId: "6833", role: "signaling" },
        { id: "KCNJ11", label: "KCNJ11", geneId: "3767", role: "signaling" },
        { id: "GLP1R", label: "GLP1R", geneId: "2740", role: "signaling" },
        { id: "INS", label: "INS", geneId: "3630", role: "signaling" },
      ],
      edges: [
        { source: "GCK", target: "ABCC8", mechanism: "inhibition" },
        { source: "ABCC8", target: "KCNJ11", mechanism: "interaction" },
        { source: "KCNJ11", target: "INS", mechanism: "activation" },
        { source: "GLP1R", target: "INS", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-8935690": {
    id: "R-HSA-8935690",
    name: "췌장 소화액 분비 (Pancreatic secretion)",
    nameEn: "Digestion",
    source: "Reactome",
    sourceId: "R-HSA-8935690",
    category: "대사",
    relevance: 0.86,
    summary:
      "선포세포는 단백질·지방·탄수화물을 분해하는 소화효소(트립신 PRSS1, 라이페이스 PNLIP, 아밀레이스 AMY2A)를 분비하고, 췌관세포는 CFTR 통로로 중탄산이 풍부한 액을 흘려 위산을 중화합니다.",
    guide: {
      role: "췌장이 소화효소와 중탄산이 풍부한 액을 분비하는 과정이에요.",
      how: "선포세포는 아세틸콜린·콜레시스토키닌 자극에 따른 칼슘 신호로 소화효소를 분비해요. 췌관세포는 세크레틴이 올린 cAMP로 CFTR이 켜져, 위산을 중화하는 중탄산을 내보내요.",
      ifBroken: "CFTR 돌연변이는 낭포성 섬유증을, 트립시노겐(PRSS1) 돌연변이는 유전성 췌장염을 일으켜요.",
    },
    relatedPathwayIds: ["R-HSA-422356"],
    network: {
      nodes: [
        {
          id: "PRSS1",
          label: "PRSS1",
          geneId: "5644",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "선포세포가 분비하는 트립신의 전구체예요. 이 Reactome 소화 경로 참여자 목록에는 없지만 췌장 소화효소의 대표라 함께 표시해요.",
            evidence: ["Reactome:R-HSA-9925561"],
          },
        },
        { id: "PNLIP", label: "PNLIP", geneId: "5406", role: "signaling" },
        { id: "AMY2A", label: "AMY2A", geneId: "279", role: "signaling" },
        {
          id: "CFTR",
          label: "CFTR",
          geneId: "1080",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "췌관세포에서 중탄산이 풍부한 액을 내보내는 통로예요. 소화효소와 별개인 췌관 쪽 분비를 보여주려고 함께 표시해요.",
            evidence: ["Reactome:R-HSA-9820448"],
          },
        },
      ],
      edges: [
        { source: "PRSS1", target: "PNLIP", mechanism: "activation" },
        { source: "PRSS1", target: "AMY2A", mechanism: "interaction" },
        { source: "CFTR", target: "PRSS1", mechanism: "interaction" },
      ],
    },
  },

  // ═══════════════ 위 (Stomach) ═══════════════
  "R-HSA-936837": {
    id: "R-HSA-936837",
    name: "위산 분비 (Gastric acid secretion)",
    nameEn: "Ion transport by P-type ATPases",
    source: "Reactome",
    sourceId: "R-HSA-936837",
    category: "신호전달",
    relevance: 0.89,
    summary:
      "가스트린(GAST)과 히스타민 수용체(HRH2) 신호가 벽세포의 양성자 펌프(ATP4A)를 켜서 위 내강으로 산을 뿜어냅니다. 칼륨 통로(KCNQ1)가 펌프에 필요한 칼륨을 계속 재공급합니다.",
    guide: {
      role: "위 벽세포가 위산을 분비하는 과정이에요. 위산은 단백질 소화, 칼슘·철 흡수, 세균 감염 방어를 도와요.",
      how: "히스타민, 가스트린, 아세틸콜린이 벽세포를 자극하면 세포 안 칼슘과 cAMP가 올라가요. 그러면 세포 안에 있던 양성자 펌프(H+/K+-ATPase)가 위 쪽 세포막으로 옮겨가 수소 이온을 내보내요.",
      ifBroken: "위산이 너무 많이 나오면 H2 수용체 차단제나 양성자 펌프 억제제처럼 이 경로를 막는 약으로 줄여요.",
    },
    relatedPathwayIds: ["R-HSA-427975"],
    network: {
      nodes: [
        {
          id: "GAST",
          label: "GAST",
          geneId: "2520",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "벽세포를 자극해 위산 분비를 늘리는 호르몬이에요. 이 Reactome 경로는 양성자 펌프 같은 이온 펌프를 다뤄서, 펌프를 켜는 신호를 함께 표시해요.",
            evidence: ["Reactome:R-HSA-881907"],
          },
        },
        {
          id: "HRH2",
          label: "HRH2",
          geneId: "3274",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "히스타민을 받아 벽세포의 cAMP를 올리는 H2 수용체예요. 양성자 펌프를 켜는 신호라 함께 표시해요.",
            evidence: ["Reactome:R-HSA-390650"],
          },
        },
        { id: "ATP4A", label: "ATP4A", geneId: "495", role: "signaling" },
        {
          id: "KCNQ1",
          label: "KCNQ1",
          geneId: "3784",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "양성자 펌프가 쓸 칼륨을 위 내강 쪽으로 다시 내보내는 칼륨 통로예요. 펌프가 계속 돌 수 있는 이유를 보여주려고 함께 표시해요.",
            evidence: ["Reactome:R-HSA-1296072"],
          },
        },
      ],
      edges: [
        { source: "GAST", target: "HRH2", mechanism: "activation" },
        { source: "HRH2", target: "ATP4A", mechanism: "activation" },
        { source: "KCNQ1", target: "ATP4A", mechanism: "interaction" },
      ],
    },
  },
  "R-HSA-427975": {
    id: "R-HSA-427975",
    name: "단백질 소화·흡수 (Protein digestion & absorption)",
    nameEn: "Proton/oligopeptide cotransporters",
    source: "Reactome",
    sourceId: "R-HSA-427975",
    category: "대사",
    relevance: 0.8,
    summary:
      "주세포가 만든 펩시노겐(PGC)이 위산에 의해 펩신으로 활성화되어 단백질을 잘게 자르고, 장 상피의 펩타이드 수송체(SLC15A1)가 그 조각(펩타이드)을 세포 안으로 흡수합니다.",
    guide: {
      role: "음식 속 단백질을 잘게 잘라 흡수하는 과정이에요.",
      how: "위·췌장·소장의 효소가 차례로 단백질을 잘라 아미노산과 작은 펩타이드로 만들어요. 아미노산은 여러 수송체로, 작은 펩타이드는 PEPT1(SLC15A1)로 장 세포에 들어가 혈액으로 넘어가요.",
      ifBroken: "위에서 만드는 펩시노겐(PGC)의 혈중 농도는 헬리코박터 위염 같은 위 질환의 지표로 쓰여요.",
    },
    relatedPathwayIds: ["R-HSA-936837"],
    network: {
      nodes: [
        {
          id: "GAST",
          label: "GAST",
          geneId: "2520",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "위산 분비를 촉진하는 호르몬이에요. 위산이 펩시노겐을 활성형으로 바꾸므로, 단백질 소화가 위에서 시작되는 흐름을 보여주려고 함께 표시해요.",
            evidence: ["Reactome:R-HSA-881907", "NCBI:2520"],
          },
        },
        {
          id: "PGC",
          label: "PGC",
          geneId: "5225",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "위 주세포가 만드는 단백질 분해효소 전구체로, 산성에서 활성형이 되어 위에서 단백질 소화를 시작해요. 펩타이드 흡수를 다루는 이 Reactome 경로에는 포함되지 않아요.",
            evidence: ["NCBI:5225"],
          },
        },
        {
          id: "PRSS1",
          label: "PRSS1",
          geneId: "5644",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "췌장에서 분비돼 소장에서 단백질을 자르는 트립신의 전구체예요. 흡수 전에 단백질을 자르는 단계를 보여주려고 함께 표시해요.",
            evidence: ["Reactome:R-HSA-9925561"],
          },
        },
        { id: "SLC15A1", label: "SLC15A1", geneId: "6564", role: "signaling" },
      ],
      edges: [
        { source: "GAST", target: "PGC", mechanism: "activation" },
        { source: "PGC", target: "SLC15A1", mechanism: "interaction" },
        { source: "PRSS1", target: "SLC15A1", mechanism: "interaction" },
      ],
    },
  },

  // ═══════════════ 장 (Intestine) ═══════════════
  "R-HSA-8963743": {
    id: "R-HSA-8963743",
    name: "탄수화물 소화·흡수 (Carbohydrate digestion & absorption)",
    nameEn: "Digestion and absorption",
    source: "Reactome",
    sourceId: "R-HSA-8963743",
    category: "대사",
    relevance: 0.85,
    summary:
      "장 상피의 이당류 분해효소(수크레이스-아이소말테이스 SI)가 탄수화물을 포도당으로 자르면, 나트륨 공동수송체(SGLT1, SLC5A1)가 이를 세포로 끌어들이고, GLUT2(SLC2A2)가 혈액 쪽으로 넘겨 흡수를 완성합니다.",
    guide: {
      role: "음식 속 탄수화물을 단당류로 잘라 소장에서 흡수하는 과정이에요.",
      how: "탄수화물은 포도당·갈락토스·과당 같은 단당류로 분해된 뒤 흡수돼요. 포도당과 갈락토스는 SGLT1로 장 세포에 들어가고 GLUT2로 혈액에 나가요.",
      ifBroken: "SI 돌연변이는 선천성 수크레이스-아이소말테이스 결핍증을, SGLT1 돌연변이는 포도당-갈락토스 흡수장애를 일으켜요.",
    },
    relatedPathwayIds: ["R-HSA-201681"],
    network: {
      nodes: [
        { id: "SI", label: "SI", geneId: "6476", role: "signaling" },
        { id: "SLC5A1", label: "SLC5A1", geneId: "6523", role: "signaling" },
        { id: "SLC2A2", label: "SLC2A2", geneId: "6514", role: "signaling" },
      ],
      edges: [
        { source: "SI", target: "SLC5A1", mechanism: "activation" },
        { source: "SLC5A1", target: "SLC2A2", mechanism: "interaction" },
      ],
    },
  },
  "R-HSA-201681": {
    id: "R-HSA-201681",
    name: "Wnt 신호전달 (장 줄기세포 재생)",
    nameEn: "TCF dependent signaling in response to WNT",
    source: "Reactome",
    sourceId: "R-HSA-201681",
    category: "발달",
    relevance: 0.83,
    summary:
      "Wnt 신호(WNT3)가 있으면 파괴복합체의 핵심 APC가 억제되어 β-카테닌(CTNNB1)이 쌓이고, 이것이 전사인자 TCF7L2와 손잡아 MYC 같은 증식 유전자를 켭니다. APC가 망가지면 이 스위치가 계속 켜져 대장암의 출발점이 됩니다.",
    guide: {
      role: "세포의 운명 결정과 전구세포 증식을 조절하는 발생 신호 경로예요. 이 앱에서는 장 줄기세포 재생과 연결해 보여줘요.",
      how: "Wnt가 수용체에 붙으면 β-카테닌 분해 복합체가 억제돼 β-카테닌이 쌓여요. 쌓인 β-카테닌은 핵으로 들어가 TCF 전사인자와 함께 MYC 같은 표적 유전자를 켜요.",
      ifBroken: "분해 복합체의 핵심인 APC가 망가지면 신호가 계속 켜진 상태가 돼요. 가족성 선종성 용종증과 대부분의 대장암에서 APC 돌연변이가 발견돼요.",
    },
    relatedPathwayIds: ["R-HSA-5663202", "R-HSA-8963743"],
    network: {
      nodes: [
        { id: "WNT3", label: "WNT3", geneId: "7473", role: "signaling" },
        { id: "APC", label: "APC", geneId: "324", role: "tumor_suppressor" },
        { id: "CTNNB1", label: "CTNNB1", geneId: "1499", role: "oncogene" },
        { id: "TCF7L2", label: "TCF7L2", geneId: "6934", role: "signaling" },
        { id: "MYC", label: "MYC", geneId: "4609", role: "oncogene" },
      ],
      edges: [
        { source: "WNT3", target: "APC", mechanism: "inhibition" },
        { source: "APC", target: "CTNNB1", mechanism: "inhibition" },
        { source: "CTNNB1", target: "TCF7L2", mechanism: "activation" },
        { source: "TCF7L2", target: "MYC", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-5663202": {
    id: "R-HSA-5663202",
    name: "대장암 (Colorectal cancer)",
    nameEn: "Diseases of signal transduction by growth factor receptors and second messengers",
    source: "Reactome",
    sourceId: "R-HSA-5663202",
    category: "세포사멸",
    relevance: 0.78,
    summary:
      "APC 소실로 β-카테닌(CTNNB1)이 폭주하고, 여기에 KRAS 활성 돌연변이와 TP53 기능 상실이 겹치면서 MYC 등 증식 신호가 통제를 벗어나 정상 대장 상피가 단계적으로 암으로 진행합니다.",
    guide: {
      role: "대장 상피에서 암유전자와 종양억제유전자의 변화가 쌓여 암이 되는 과정이에요.",
      how: "한 경로에서는 KRAS 같은 암유전자가 켜지고 APC·p53 같은 종양억제유전자가 꺼지는 변화가 차례로 쌓여요. 다른 경로는 DNA 짝 오류 수선 유전자(MLH1·MSH2)가 꺼지면서 시작돼요.",
      ifBroken: "유전성으로는 APC 돌연변이를 타고나는 가족성 선종성 용종증, 짝 오류 수선 유전자 돌연변이를 타고나는 유전성 비용종증 대장암이 있어요.",
    },
    relatedPathwayIds: ["R-HSA-201681"],
    network: {
      nodes: [
        { id: "APC", label: "APC", geneId: "324", role: "tumor_suppressor" },
        { id: "CTNNB1", label: "CTNNB1", geneId: "1499", role: "oncogene" },
        { id: "KRAS", label: "KRAS", geneId: "3845", role: "oncogene" },
        { id: "TP53", label: "TP53", geneId: "7157", role: "tumor_suppressor" },
        { id: "MYC", label: "MYC", geneId: "4609", role: "oncogene" },
      ],
      edges: [
        { source: "APC", target: "CTNNB1", mechanism: "inhibition" },
        { source: "CTNNB1", target: "MYC", mechanism: "activation" },
        { source: "KRAS", target: "MYC", mechanism: "activation" },
        { source: "TP53", target: "CTNNB1", mechanism: "interaction" },
      ],
    },
  },

  // ═══════════════ 흉선·비장 (Thymus · Spleen) ═══════════════
  "R-HSA-202403": {
    id: "R-HSA-202403",
    name: "T세포 수용체 신호 (TCR)",
    nameEn: "TCR signaling",
    source: "Reactome",
    sourceId: "R-HSA-202403",
    category: "면역",
    relevance: 0.93,
    summary:
      "T세포 수용체가 항원을 인식하면 LCK가 CD3에 인산기를 붙이고, 여기에 모인 ZAP70이 어댑터 LAT를 인산화해 T세포 활성화 신호를 여러 갈래로 퍼뜨리는 경로입니다.",
    guide: {
      role: "T세포가 항원을 알아봤을 때 세포 안에서 활성화 신호가 시작되는 과정이에요. 흉선에서는 이 신호의 세기에 따라 자라는 T세포가 살아남을지 정해져요.",
      how: "LCK가 CD3의 ITAM에 인산기를 붙이면 ZAP70이 달라붙어 켜지고, ZAP70이 LAT를 인산화해 PLCγ1 같은 하위 신호 단백질을 모아요.",
      ifBroken: "LCK·ZAP70·CD3 같은 부품이 고장 나면 T세포가 제대로 만들어지거나 활성화되지 않아 복합 면역결핍증이 생겨요.",
    },
    relatedPathwayIds: ["R-HSA-388841", "R-HSA-983705"],
    network: {
      nodes: [
        { id: "CD3E", label: "CD3E", geneId: "916", role: "signaling" },
        { id: "LCK", label: "LCK", geneId: "3932", role: "signaling" },
        { id: "ZAP70", label: "ZAP70", geneId: "7535", role: "signaling" },
        { id: "LAT", label: "LAT", geneId: "27040", role: "signaling" },
      ],
      edges: [
        { source: "LCK", target: "CD3E", mechanism: "activation" },
        { source: "CD3E", target: "ZAP70", mechanism: "activation" },
        { source: "LCK", target: "ZAP70", mechanism: "activation" },
        { source: "ZAP70", target: "LAT", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-388841": {
    id: "R-HSA-388841",
    name: "CD28 보조자극과 CTLA-4 억제",
    nameEn: "Regulation of T cell activation by CD28 family",
    source: "Reactome",
    sourceId: "R-HSA-388841",
    category: "면역",
    relevance: 0.85,
    summary:
      "항원 제시 세포의 CD80이 T세포의 CD28에 붙으면 활성화를 돕는 두 번째 신호가 되고, 같은 CD80을 더 강하게 붙잡는 CTLA-4는 이 신호를 가로채 활성화를 억제하는 경로입니다.",
    guide: {
      role: "T세포가 켜질지 말지를 정하는 가속 페달(CD28)과 브레이크(CTLA-4)예요.",
      how: "CD28과 CTLA-4는 같은 리간드 CD80·CD86을 두고 경쟁해요. CTLA-4가 더 강하게 붙어서, 활성화된 T세포와 조절 T세포가 지나친 반응을 누를 수 있어요.",
      ifBroken: "브레이크가 약하면 자가면역이 생길 수 있어요. 반대로 이 브레이크를 풀어 주는 항체는 면역항암제로 쓰여요.",
    },
    relatedPathwayIds: ["R-HSA-202403"],
    network: {
      nodes: [
        { id: "CD80", label: "CD80", geneId: "941", role: "signaling" },
        { id: "CD28", label: "CD28", geneId: "940", role: "signaling" },
        { id: "CTLA4", label: "CTLA4", geneId: "1493", role: "signaling" },
      ],
      edges: [
        { source: "CD80", target: "CD28", mechanism: "activation" },
        { source: "CD80", target: "CTLA4", mechanism: "interaction" },
        { source: "CTLA4", target: "CD28", mechanism: "inhibition" },
      ],
    },
  },
  "R-HSA-983705": {
    id: "R-HSA-983705",
    name: "B세포 수용체 신호 (BCR)",
    nameEn: "Signaling by the B Cell Receptor (BCR)",
    source: "Reactome",
    sourceId: "R-HSA-983705",
    category: "면역",
    relevance: 0.92,
    summary:
      "B세포 수용체가 항원을 붙잡으면 CD79A의 ITAM에 SYK가 모여 활성화되고, SYK가 인산화한 어댑터 BLNK에 BTK가 모여 B세포 증식과 항체 생산 신호로 이어지는 경로입니다.",
    guide: {
      role: "비장 백색수질의 B세포가 혈액으로 들어온 항원을 만나 활성화되는 첫 단계예요.",
      how: "CD79A·CD79B의 ITAM에 인산기가 붙으면 SYK가 달라붙어 켜지고, SYK가 BLNK를 인산화하면 BTK·PLCγ2가 모여 칼슘 신호와 전사인자 활성화로 이어져요.",
      ifBroken: "CD79A·BLNK·BTK 중 하나라도 고장 나면 B세포가 자라지 못해 항체가 거의 없는 무감마글로불린혈증이 생겨요.",
    },
    relatedPathwayIds: ["R-HSA-202403"],
    network: {
      nodes: [
        { id: "CD79A", label: "CD79A", geneId: "973", role: "signaling" },
        { id: "SYK", label: "SYK", geneId: "6850", role: "signaling" },
        { id: "BLNK", label: "BLNK", geneId: "29760", role: "signaling" },
        { id: "BTK", label: "BTK", geneId: "695", role: "signaling" },
      ],
      edges: [
        { source: "CD79A", target: "SYK", mechanism: "activation" },
        { source: "SYK", target: "BLNK", mechanism: "activation" },
        { source: "BLNK", target: "BTK", mechanism: "activation" },
        { source: "SYK", target: "BTK", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-189483": {
    id: "R-HSA-189483",
    name: "헴 분해 (적혈구 재활용)",
    nameEn: "Heme degradation",
    source: "Reactome",
    sourceId: "R-HSA-189483",
    category: "대사",
    relevance: 0.88,
    summary:
      "비장 적색수질의 대식세포가 늙은 적혈구와 헤모글로빈을 받아들이면, 헴 산소화효소(HMOX1)가 헴을 빌리버딘·철·일산화탄소로 분해하고 빌리버딘 환원효소(BLVRA)가 빌리버딘을 빌리루빈으로 바꾸는 경로입니다.",
    guide: {
      role: "수명을 다한 적혈구 속 헴을 분해해 철은 다시 쓰고, 나머지는 빌리루빈으로 내보내는 과정이에요.",
      how: "HMOX1이 헴을 빌리버딘, 철, 일산화탄소로 쪼개고, BLVRA가 빌리버딘을 빌리루빈으로 바꿔요. 빌리루빈은 알부민에 실려 간으로 가서 담즙으로 배출돼요.",
      ifBroken: "빌리루빈이 너무 많이 만들어지거나 간이 처리하지 못하면 피부와 눈이 노래지는 황달이 생겨요.",
    },
    relatedPathwayIds: [],
    network: {
      nodes: [
        {
          id: "CD163",
          label: "CD163",
          geneId: "9332",
          role: "signaling",
          membership: "contextual",
          context: {
            reason:
              "혈액의 헤모글로빈-합토글로빈 복합체를 대식세포 안으로 들이는 청소 수용체예요. Reactome은 헴 청소 경로에 따로 두어서, 분해할 헴이 어디서 오는지 보여주려고 함께 표시해요.",
            evidence: ["Reactome:R-HSA-2168880"],
          },
        },
        { id: "HMOX1", label: "HMOX1", geneId: "3162", role: "signaling" },
        { id: "BLVRA", label: "BLVRA", geneId: "644", role: "signaling" },
      ],
      edges: [
        { source: "CD163", target: "HMOX1", mechanism: "activation" },
        { source: "HMOX1", target: "BLVRA", mechanism: "activation" },
      ],
    },
  },
};

// ── 장기 → 조직 데이터 ──────────────────────────────────────
export const ORGANS: Organ[] = [
  {
    id: "brain",
    name: "뇌",
    nameEn: "Brain",
    description: "중추신경계의 중심. 인지·기억·감정·운동을 통제합니다.",
    position: [0, 2.6, 0],
    color: "#f15b16",
    available: true,
    tissues: [
      {
        id: "hippocampus",
        name: "해마",
        nameEn: "Hippocampus",
        description: "학습과 기억 형성의 핵심 영역. 신경세포 사멸에 민감합니다.",
        position: [0.45, -0.1, 0.35],
        pathwayIds: ["R-HSA-109606", "R-HSA-418594", "R-HSA-5633008"],
      },
      {
        id: "cortex",
        name: "대뇌피질",
        nameEn: "Cerebral cortex",
        description: "고차원 인지·감각·운동 처리를 담당하는 바깥층입니다.",
        position: [0, 0.7, 0.55],
        pathwayIds: ["R-HSA-418594", "R-HSA-5633008"],
      },
      {
        id: "thalamus",
        name: "시상",
        nameEn: "Thalamus",
        description: "감각 정보를 대뇌피질로 중계하는 관문입니다.",
        position: [0, 0.05, -0.1],
        pathwayIds: ["R-HSA-418594"],
      },
      {
        id: "cerebellum",
        name: "소뇌",
        nameEn: "Cerebellum",
        description: "운동 협응과 균형, 미세 조정을 담당합니다.",
        position: [0, -0.5, -0.7],
        pathwayIds: ["R-HSA-109606"],
      },
    ],
  },
  {
    id: "heart",
    name: "심장",
    nameEn: "Heart",
    description:
      "혈액을 온몸으로 뿜어내는 근육 펌프. 전기 신호와 칼슘으로 리듬 있게 수축합니다.",
    position: [-0.35, 1.1, 0.2],
    color: "#ef4444",
    available: true,
    tissues: [
      {
        id: "myocardium",
        name: "심근",
        nameEn: "Myocardium",
        description: "실제 수축을 담당하는 심장 근육층입니다.",
        position: [0.4, 0.2, 0.4],
        pathwayIds: ["R-HSA-397014", "R-HSA-5576891", "R-HSA-390522"],
      },
      {
        id: "conduction",
        name: "전도계",
        nameEn: "Conduction system",
        description: "동방결절 등에서 전기 신호를 만들어 박동 리듬을 지휘합니다.",
        position: [0, 0.55, 0.1],
        pathwayIds: ["R-HSA-5576891", "R-HSA-397014"],
      },
      {
        id: "coronary",
        name: "관상동맥",
        nameEn: "Coronary artery",
        description: "심장 근육 자체에 산소와 영양을 공급하는 혈관입니다.",
        position: [-0.45, 0.1, 0.35],
        pathwayIds: ["R-HSA-5576891"],
      },
      {
        id: "endocardium",
        name: "심내막·판막",
        nameEn: "Endocardium & valves",
        description: "심장 내부를 감싸고 혈류 방향을 지키는 얇은 막과 판막입니다.",
        position: [0.1, -0.45, -0.2],
        pathwayIds: ["R-HSA-390522"],
      },
    ],
  },
  {
    id: "liver",
    name: "간",
    nameEn: "Liver",
    description:
      "대사·해독·담즙 생산을 총괄하는 화학 공장. 지질·당·약물을 처리합니다.",
    position: [0.4, 0.4, 0.2],
    color: "#d97706",
    available: true,
    tissues: [
      {
        id: "hepatocyte",
        name: "간세포",
        nameEn: "Hepatocyte",
        description: "간 기능의 대부분(대사·해독·합성)을 수행하는 실질 세포입니다.",
        position: [0.35, 0.25, 0.4],
        pathwayIds: ["R-HSA-2426168", "R-HSA-211897", "R-HSA-194068"],
      },
      {
        id: "bileduct",
        name: "담관",
        nameEn: "Bile duct",
        description: "간세포가 만든 담즙을 모아 쓸개·장으로 흘려보내는 관입니다.",
        position: [-0.4, 0.0, 0.3],
        pathwayIds: ["R-HSA-194068"],
      },
      {
        id: "sinusoid",
        name: "굴모세혈관",
        nameEn: "Sinusoid",
        description: "혈액과 간세포가 물질을 주고받는 특수 모세혈관입니다.",
        position: [0.1, 0.5, -0.35],
        pathwayIds: ["R-HSA-2426168"],
      },
      {
        id: "kupffer",
        name: "쿠퍼세포",
        nameEn: "Kupffer cell",
        description: "간에 상주하는 대식세포로 병원체·노폐물·이물질을 청소합니다.",
        position: [-0.3, -0.4, -0.2],
        pathwayIds: ["R-HSA-211897"],
      },
    ],
  },
  {
    id: "lung",
    name: "폐",
    nameEn: "Lung",
    description:
      "산소를 받아들이고 이산화탄소를 내보내는 가스 교환 기관입니다.",
    position: [0.5, 1.2, 0.1],
    color: "#38bdf8",
    available: true,
    tissues: [
      {
        id: "alveolus",
        name: "폐포",
        nameEn: "Alveolus",
        description: "실제 가스 교환이 일어나는 작은 공기주머니입니다.",
        position: [0.4, 0.2, 0.4],
        pathwayIds: ["R-HSA-5683826", "R-HSA-1234174"],
      },
      {
        id: "bronchus",
        name: "기관지",
        nameEn: "Bronchus",
        description: "공기를 폐포로 실어 나르는 나뭇가지 모양의 통로입니다.",
        position: [0, 0.6, 0.0],
        pathwayIds: ["R-HSA-6785807"],
      },
      {
        id: "pulmonary_vessel",
        name: "폐혈관",
        nameEn: "Pulmonary vasculature",
        description: "폐포를 감싸며 산소와 이산화탄소를 실어 나르는 혈관망입니다.",
        position: [-0.45, 0.0, 0.3],
        pathwayIds: ["R-HSA-1234174"],
      },
      {
        id: "ciliated_epithelium",
        name: "섬모 상피",
        nameEn: "Ciliated epithelium",
        description: "점액과 섬모로 이물질을 밖으로 밀어내는 기도 방어층입니다.",
        position: [0.1, -0.45, -0.2],
        pathwayIds: ["R-HSA-6785807"],
      },
    ],
  },
  {
    id: "kidney",
    name: "신장",
    nameEn: "Kidney",
    description:
      "혈액을 걸러 소변을 만들고, 혈압·수분·전해질 균형을 조절하는 여과 기관입니다.",
    position: [-0.3, 0.0, -0.3],
    color: "#10b981",
    available: true,
    tissues: [
      {
        id: "glomerulus",
        name: "사구체",
        nameEn: "Glomerulus",
        description: "혈액을 1차로 걸러 원뇨를 만드는 모세혈관 여과 장치입니다.",
        position: [0.4, 0.3, 0.35],
        pathwayIds: ["R-HSA-373753"],
      },
      {
        id: "proximal_tubule",
        name: "근위세뇨관",
        nameEn: "Proximal tubule",
        description: "포도당·아미노산·나트륨 등 유용한 물질을 대량 재흡수합니다.",
        position: [-0.4, 0.1, 0.3],
        pathwayIds: ["R-HSA-2022377"],
      },
      {
        id: "distal_tubule",
        name: "원위세뇨관",
        nameEn: "Distal tubule",
        description: "호르몬 조절 아래 나트륨·칼륨을 미세 조정하는 부위입니다.",
        position: [0.1, 0.5, -0.35],
        pathwayIds: ["R-HSA-2672351"],
      },
      {
        id: "collecting_duct",
        name: "집합관",
        nameEn: "Collecting duct",
        description: "바소프레신·알도스테론에 반응해 최종 수분·염분을 조절합니다.",
        position: [-0.2, -0.45, -0.15],
        pathwayIds: ["R-HSA-432040", "R-HSA-2672351"],
      },
    ],
  },
  {
    id: "stomach",
    name: "위",
    nameEn: "Stomach",
    description:
      "음식을 저장·분쇄하고 강한 산과 효소로 소화를 시작하는 주머니 모양의 소화 기관입니다.",
    position: [0.4, 0.5, 0.2],
    color: "#ec4899",
    available: true,
    tissues: [
      {
        id: "parietal_cell",
        name: "벽세포",
        nameEn: "Parietal cell",
        description: "양성자 펌프로 위산(염산)을 분비해 위 내부를 강산성으로 만듭니다.",
        position: [0.4, 0.2, 0.4],
        pathwayIds: ["R-HSA-936837"],
      },
      {
        id: "chief_cell",
        name: "주세포",
        nameEn: "Chief cell",
        description: "단백질 분해효소의 전구체인 펩시노겐을 분비하는 세포입니다.",
        position: [-0.4, 0.05, 0.3],
        pathwayIds: ["R-HSA-427975"],
      },
      {
        id: "gastric_mucosa",
        name: "점막상피",
        nameEn: "Gastric mucosa",
        description: "점액과 중탄산을 분비해 위 스스로 산에 녹지 않도록 보호합니다.",
        position: [0.1, 0.5, -0.3],
        pathwayIds: ["R-HSA-936837"],
      },
    ],
  },
  {
    id: "pancreas",
    name: "췌장",
    nameEn: "Pancreas",
    description:
      "혈당을 조절하는 호르몬(인슐린)과 소화효소를 함께 만드는 내분비·외분비 겸용 기관입니다.",
    position: [0.1, 0.3, -0.1],
    color: "#a855f7",
    available: true,
    tissues: [
      {
        id: "beta_cell",
        name: "베타세포",
        nameEn: "Beta cell",
        description: "랑게르한스섬에서 혈당을 감지해 인슐린을 분비하는 내분비 세포입니다.",
        position: [0.4, 0.25, 0.35],
        pathwayIds: ["R-HSA-422356"],
      },
      {
        id: "acinar_cell",
        name: "선포세포",
        nameEn: "Acinar cell",
        description: "단백질·지방·탄수화물을 분해하는 소화효소를 만들어 분비합니다.",
        position: [-0.4, 0.1, 0.3],
        pathwayIds: ["R-HSA-8935690"],
      },
      {
        id: "pancreatic_duct",
        name: "췌관",
        nameEn: "Pancreatic duct",
        description: "중탄산이 풍부한 췌장액을 십이지장으로 흘려 위산을 중화합니다.",
        position: [0.1, -0.4, -0.2],
        pathwayIds: ["R-HSA-8935690"],
      },
    ],
  },
  {
    id: "intestine",
    name: "장",
    nameEn: "Intestine",
    description:
      "영양소를 최종 소화·흡수하고, 빠르게 재생하는 상피와 미생물·면역이 공존하는 긴 관입니다.",
    position: [0.0, -0.4, 0.15],
    color: "#eab308",
    available: true,
    tissues: [
      {
        id: "enterocyte",
        name: "융모 상피",
        nameEn: "Enterocyte (villus)",
        description: "융모 표면에서 포도당·아미노산 등 영양소를 혈액으로 흡수합니다.",
        position: [0.4, 0.25, 0.35],
        pathwayIds: ["R-HSA-8963743"],
      },
      {
        id: "crypt_stem",
        name: "장샘 줄기세포",
        nameEn: "Crypt stem cell",
        description: "Wnt 신호로 끊임없이 증식해 손상되는 장 상피를 계속 새로 채웁니다.",
        position: [-0.4, 0.1, 0.3],
        pathwayIds: ["R-HSA-201681"],
      },
      {
        id: "colonocyte",
        name: "대장 상피",
        nameEn: "Colonocyte",
        description: "수분을 흡수하는 대장 상피로, 유전자 손상이 쌓이면 대장암이 생깁니다.",
        position: [0.1, -0.4, -0.2],
        pathwayIds: ["R-HSA-5663202"],
      },
    ],
  },
  {
    id: "thymus",
    name: "흉선",
    nameEn: "Thymus",
    description:
      "가슴뼈 뒤에 있는 림프 기관으로, 자라는 T세포가 자기와 남을 구별하도록 교육받는 곳입니다.",
    position: [0.0, 1.35, 0.2],
    color: "#14b8a6",
    available: true,
    tissues: [
      {
        id: "thymic_cortex",
        name: "흉선 피질",
        nameEn: "Thymic cortex",
        description: "미성숙 T세포가 자기 MHC를 알아보는 수용체를 만들었는지 시험받는 양성 선택이 일어납니다.",
        position: [0.4, 0.2, 0.35],
        pathwayIds: ["R-HSA-202403"],
      },
      {
        id: "thymic_medulla",
        name: "흉선 수질",
        nameEn: "Thymic medulla",
        description: "자기 항원에 너무 강하게 반응하는 T세포를 걸러내고, 조절 T세포를 만들어 냅니다.",
        position: [-0.35, -0.1, 0.3],
        pathwayIds: ["R-HSA-202403", "R-HSA-388841"],
      },
    ],
  },
  {
    id: "spleen",
    name: "비장",
    nameEn: "Spleen",
    description:
      "혈액을 걸러 늙은 적혈구를 치우고, 혈액으로 들어온 항원에 맞서 면역 반응을 일으키는 기관입니다.",
    position: [0.55, 0.3, -0.1],
    color: "#84cc16",
    available: true,
    tissues: [
      {
        id: "white_pulp",
        name: "백색수질",
        nameEn: "White pulp",
        description: "B세포와 T세포가 모여 혈액으로 들어온 항원에 대한 면역 반응을 시작합니다.",
        position: [0.4, 0.2, 0.35],
        pathwayIds: ["R-HSA-983705", "R-HSA-202403"],
      },
      {
        id: "red_pulp",
        name: "적색수질",
        nameEn: "Red pulp",
        description: "대식세포가 늙거나 손상된 적혈구를 걸러 헴을 분해하고 철을 재활용합니다.",
        position: [-0.35, -0.1, 0.3],
        pathwayIds: ["R-HSA-189483"],
      },
    ],
  },
];

// ── 헬퍼 ────────────────────────────────────────────────────
export const getOrgan = (id: string) => ORGANS.find((o) => o.id === id);

export const getTissue = (organId: string, tissueId: string) =>
  getOrgan(organId)?.tissues.find((t) => t.id === tissueId);

export const getPathway = (id: string) => PATHWAYS[id];

export const getPathwaysForTissue = (organId: string, tissueId: string) => {
  const tissue = getTissue(organId, tissueId);
  if (!tissue) return [];
  return tissue.pathwayIds
    .map((pid) => PATHWAYS[pid])
    .filter((p): p is Pathway => Boolean(p));
};

/** 패스웨이 ID가 속한 (장기, 조직)을 역으로 찾는다. 검색/점프 시 정확한 위치 복원용. */
export const findPathwayLocation = (
  pathwayId: string
): { organId: string; tissueId: string } | null => {
  for (const organ of ORGANS) {
    for (const tissue of organ.tissues) {
      if (tissue.pathwayIds.includes(pathwayId)) {
        return { organId: organ.id, tissueId: tissue.id };
      }
    }
  }
  return null;
};

/** 전역 검색 (장기/조직/패스웨이/유전자) */
export interface SearchHit {
  type: "organ" | "tissue" | "pathway" | "gene";
  id: string;
  label: string;
  sublabel: string;
  organId?: string;
  tissueId?: string;
}

export function searchAtlas(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const organ of ORGANS) {
    if (
      organ.name.toLowerCase().includes(q) ||
      organ.nameEn.toLowerCase().includes(q)
    ) {
      hits.push({
        type: "organ",
        id: organ.id,
        label: `${organ.name} (${organ.nameEn})`,
        sublabel: organ.available ? "장기" : "장기 · 준비 중",
        organId: organ.id,
      });
    }
    for (const tissue of organ.tissues) {
      if (
        tissue.name.toLowerCase().includes(q) ||
        tissue.nameEn.toLowerCase().includes(q)
      ) {
        hits.push({
          type: "tissue",
          id: tissue.id,
          label: `${tissue.name} (${tissue.nameEn})`,
          sublabel: `조직 · ${organ.name}`,
          organId: organ.id,
          tissueId: tissue.id,
        });
      }
    }
  }
  for (const p of Object.values(PATHWAYS)) {
    if (
      p.name.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.sourceId.toLowerCase().includes(q)
    ) {
      const loc = findPathwayLocation(p.id);
      hits.push({
        type: "pathway",
        id: p.id,
        label: p.name,
        sublabel: `패스웨이 · ${p.source}`,
        organId: loc?.organId,
        tissueId: loc?.tissueId,
      });
    }
  }
  // 유전자는 장기·조직처럼 트리 위의 한 점이 아니라 여러 장기에 걸쳐 있다.
  // 그래서 jumpTo(드릴다운)가 아니라 인체 위 분포 뷰(focusGene)로 보낸다.
  for (const g of Object.values(GENES)) {
    const syn = SYNONYMS[g.symbol];
    const official =
      g.symbol.toLowerCase().includes(q) ||
      g.fullName.toLowerCase().includes(q);
    // 논문마다 다른 이름(p53, BSEP, FXR…)으로도 찾는다. 짧은 별칭은 앞글자 일치만 본다.
    const alias = official
      ? undefined
      : q.length >= 2
        ? syn?.symbols.find((s) => s.toLowerCase().startsWith(q)) ??
          (q.length >= 3
            ? syn?.names.find((n) => n.toLowerCase().includes(q))
            : undefined)
        : undefined;
    if (official || alias) {
      const organCount = findGeneDistribution(g.symbol)?.organIds.length ?? 0;
      hits.push({
        type: "gene",
        id: g.symbol,
        label: alias ? `${g.symbol} (${alias})` : g.symbol,
        sublabel:
          organCount > 1 ? `유전자 · ${organCount}개 장기` : "유전자",
      });
    }
  }
  // 유전자 히트를 앞으로 — 심볼 검색은 대개 유전자를 찾는 의도다.
  hits.sort((a, b) => (a.type === "gene" ? -1 : 0) - (b.type === "gene" ? -1 : 0));

  // 한국어 설명 속 질환·물질명(당뇨, 알츠하이머, 인슐린…)으로도 찾는다. 직접 일치보다 뒤에 둔다.
  if (/[가-힣]/.test(q) && q.length >= 2) {
    const found = new Set(hits.map((h) => h.id));
    for (const g of Object.values(GENES)) {
      if (found.has(g.symbol)) continue;
      const text = [g.easyExplanation, g.guide?.role, g.guide?.how, g.guide?.ifBroken].join(" ");
      if (text.includes(q)) {
        hits.push({
          type: "gene",
          id: g.symbol,
          label: g.symbol,
          sublabel: `설명에 '${q}' 언급`,
        });
      }
    }
  }
  return hits.slice(0, 8);
}
