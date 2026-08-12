import { Organ, Pathway } from "./types";
import { GENES } from "./genes";
import { findGeneDistribution } from "./expression";

// ── 패스웨이 데이터 (뇌 + 심장/간/폐/신장 큐레이션) ──────────────
// network는 Cytoscape에 그대로 전달됩니다.
// 각 노드 심볼은 반드시 lib/genes.ts 에 상세 항목이 존재해야 합니다.
export const PATHWAYS: Record<string, Pathway> = {
  // ═══════════════ 뇌 (Brain) ═══════════════
  hsa04210: {
    id: "hsa04210",
    name: "신경세포 사멸 경로 (Apoptosis)",
    nameEn: "Apoptosis",
    source: "KEGG",
    sourceId: "hsa04210",
    category: "세포사멸",
    relevance: 0.95,
    summary:
      "내부 스트레스나 DNA 손상이 미토콘드리아 경로를 통해 카스파제를 활성화시켜 신경세포를 계획적으로 사멸시키는 경로입니다.",
    relatedPathwayIds: ["hsa04728", "R-HSA-69541"],
    network: {
      nodes: [
        { id: "TP53", label: "TP53", geneId: "7157", role: "tumor_suppressor" },
        { id: "BAX", label: "BAX", geneId: "581", role: "signaling" },
        { id: "BCL2", label: "BCL2", geneId: "596", role: "oncogene" },
        { id: "CYCS", label: "CYCS", geneId: "54205", role: "signaling" },
        { id: "APAF1", label: "APAF1", geneId: "317", role: "signaling" },
        { id: "CASP3", label: "CASP3", geneId: "836", role: "signaling" },
        { id: "CREB1", label: "CREB1", geneId: "1385", role: "signaling" },
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
  hsa04728: {
    id: "hsa04728",
    name: "도파민 수용체 신호 전달",
    nameEn: "Dopaminergic synapse",
    source: "KEGG",
    sourceId: "hsa04728",
    category: "신호전달",
    relevance: 0.82,
    summary:
      "도파민이 D2 수용체에 결합해 G단백질을 거쳐 세포 내 신호를 전달하고, 최종적으로 유전자 발현과 신경세포 생존에 영향을 주는 경로입니다.",
    relatedPathwayIds: ["hsa04210"],
    network: {
      nodes: [
        { id: "DRD2", label: "DRD2", geneId: "1813", role: "signaling" },
        { id: "GNAI2", label: "GNAI2", geneId: "2771", role: "signaling" },
        { id: "CREB1", label: "CREB1", geneId: "1385", role: "signaling" },
        { id: "BCL2", label: "BCL2", geneId: "596", role: "oncogene" },
      ],
      edges: [
        { source: "DRD2", target: "GNAI2", mechanism: "activation" },
        { source: "GNAI2", target: "CREB1", mechanism: "inhibition" },
        { source: "CREB1", target: "BCL2", mechanism: "activation" },
      ],
    },
  },
  "R-HSA-69541": {
    id: "R-HSA-69541",
    name: "p53 의존성 세포자멸 조절",
    nameEn: "Stabilization of p53",
    source: "Reactome",
    sourceId: "R-HSA-69541",
    category: "세포사멸",
    relevance: 0.74,
    summary:
      "DNA 손상 시 p53이 안정화·축적되어 사멸 관련 유전자의 전사를 유도하는 조절 경로입니다.",
    relatedPathwayIds: ["hsa04210"],
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
  hsa04260: {
    id: "hsa04260",
    name: "심근 수축 (Cardiac muscle contraction)",
    nameEn: "Cardiac muscle contraction",
    source: "KEGG",
    sourceId: "hsa04260",
    category: "신호전달",
    relevance: 0.93,
    summary:
      "L형 칼슘 통로로 들어온 칼슘이 근소포체의 리아노딘 수용체를 열어 대량의 칼슘을 방출하고(칼슘 유발 칼슘 방출), 이 칼슘이 트로포닌에 결합해 액틴-미오신 수축을 일으키는 경로입니다.",
    relatedPathwayIds: ["hsa04261", "hsa05410"],
    network: {
      nodes: [
        { id: "CACNA1C", label: "CACNA1C", geneId: "775", role: "signaling" },
        { id: "RYR2", label: "RYR2", geneId: "6262", role: "signaling" },
        { id: "ATP2A2", label: "ATP2A2", geneId: "488", role: "signaling" },
        { id: "PLN", label: "PLN", geneId: "5350", role: "signaling" },
        { id: "TNNT2", label: "TNNT2", geneId: "7139", role: "structural" },
        { id: "MYH7", label: "MYH7", geneId: "4625", role: "structural" },
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
  hsa04261: {
    id: "hsa04261",
    name: "아드레날린성 심근 신호전달",
    nameEn: "Adrenergic signaling in cardiomyocytes",
    source: "KEGG",
    sourceId: "hsa04261",
    category: "신호전달",
    relevance: 0.85,
    summary:
      "교감신경 자극(아드레날린)이 β1 수용체→Gs단백질→PKA를 거쳐 칼슘 통로와 인단백질(PLN)을 인산화하여 심박수와 수축력을 높이는 경로입니다.",
    relatedPathwayIds: ["hsa04260"],
    network: {
      nodes: [
        { id: "ADRB1", label: "ADRB1", geneId: "153", role: "signaling" },
        { id: "GNAS", label: "GNAS", geneId: "2778", role: "signaling" },
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
  hsa05410: {
    id: "hsa05410",
    name: "비대성 심근증 (Hypertrophic cardiomyopathy)",
    nameEn: "Hypertrophic cardiomyopathy",
    source: "KEGG",
    sourceId: "hsa05410",
    category: "발달",
    relevance: 0.76,
    summary:
      "근절(sarcomere)을 이루는 구조 단백질들의 돌연변이가 심근 섬유의 배열을 흐트러뜨려 심실벽이 두꺼워지는 유전성 심근질환과 관련된 상호작용망입니다.",
    relatedPathwayIds: ["hsa04260"],
    network: {
      nodes: [
        { id: "MYH7", label: "MYH7", geneId: "4625", role: "structural" },
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
  hsa04976: {
    id: "hsa04976",
    name: "담즙 분비 (Bile secretion)",
    nameEn: "Bile secretion",
    source: "KEGG",
    sourceId: "hsa04976",
    category: "대사",
    relevance: 0.88,
    summary:
      "핵수용체 FXR(NR1H4)가 담즙산 농도를 감지해 담즙산 배출펌프(BSEP)를 켜고, 담즙산 합성 효소(CYP7A1)를 억제하여 담즙산 항상성을 유지하는 경로입니다.",
    relatedPathwayIds: ["hsa00071"],
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
  hsa00071: {
    id: "hsa00071",
    name: "지질·지방산 대사",
    nameEn: "Fatty acid & lipid metabolism",
    source: "KEGG",
    sourceId: "hsa00071",
    category: "대사",
    relevance: 0.85,
    summary:
      "전사인자 SREBP-1(SREBF1)이 지방산·콜레스테롤 합성 효소를 켜서 지질을 만들고, PPARα는 지방산 산화를 촉진해 이에 균형을 맞추는 간의 핵심 지질 대사 경로입니다.",
    relatedPathwayIds: ["hsa04976", "hsa00982"],
    network: {
      nodes: [
        { id: "SREBF1", label: "SREBF1", geneId: "6720", role: "signaling" },
        { id: "FASN", label: "FASN", geneId: "2194", role: "signaling" },
        { id: "HMGCR", label: "HMGCR", geneId: "3156", role: "signaling" },
        { id: "LDLR", label: "LDLR", geneId: "3949", role: "signaling" },
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
  hsa00982: {
    id: "hsa00982",
    name: "약물 대사 — 사이토크롬 P450",
    nameEn: "Drug metabolism – cytochrome P450",
    source: "KEGG",
    sourceId: "hsa00982",
    category: "대사",
    relevance: 0.8,
    summary:
      "핵수용체 PXR(NR1I2)이 약물·이물질을 감지하면 간의 대표 해독 효소 CYP3A4·CYP2E1의 발현을 늘려 이를 산화·분해(1상 대사)하는 경로입니다.",
    relatedPathwayIds: ["hsa00071"],
    network: {
      nodes: [
        { id: "NR1I2", label: "NR1I2", geneId: "8856", role: "signaling" },
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
    relatedPathwayIds: ["hsa04066"],
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
  hsa04066: {
    id: "hsa04066",
    name: "HIF-1 저산소 신호전달",
    nameEn: "HIF-1 signaling (hypoxia)",
    source: "KEGG",
    sourceId: "hsa04066",
    category: "신호전달",
    relevance: 0.83,
    summary:
      "산소가 충분할 때는 VHL이 HIF-1α를 분해하지만, 저산소 상태가 되면 HIF-1α가 안정화되어 혈관 신생인자(VEGFA) 등을 켜서 산소 공급을 늘리는 경로입니다.",
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
  hsa05310: {
    id: "hsa05310",
    name: "천식 (Asthma)",
    nameEn: "Asthma",
    source: "KEGG",
    sourceId: "hsa05310",
    category: "면역",
    relevance: 0.77,
    summary:
      "제2형 면역 사이토카인 IL-4/IL-13이 기도 상피를 자극해 점액 단백(MUC5AC) 분비를 늘리고 기도 염증·과민반응을 일으키는 알레르기성 천식 경로입니다.",
    relatedPathwayIds: ["hsa04066"],
    network: {
      nodes: [
        { id: "IL4", label: "IL4", geneId: "3565", role: "signaling" },
        { id: "IL13", label: "IL13", geneId: "3596", role: "signaling" },
        { id: "MUC5AC", label: "MUC5AC", geneId: "4586", role: "structural" },
      ],
      edges: [
        { source: "IL4", target: "IL13", mechanism: "interaction" },
        { source: "IL13", target: "MUC5AC", mechanism: "activation" },
      ],
    },
  },

  // ═══════════════ 신장 (Kidney) ═══════════════
  hsa04614: {
    id: "hsa04614",
    name: "레닌-안지오텐신계 (RAS)",
    nameEn: "Renin-angiotensin system",
    source: "KEGG",
    sourceId: "hsa04614",
    category: "신호전달",
    relevance: 0.88,
    summary:
      "레닌(REN)이 안지오텐시노겐(AGT)을 잘라 안지오텐신 I을 만들고, ACE가 이를 안지오텐신 II로 전환해 수용체 AGTR1을 자극함으로써 혈압과 체액량을 조절하는 경로입니다.",
    relatedPathwayIds: ["hsa04960"],
    network: {
      nodes: [
        { id: "REN", label: "REN", geneId: "5972", role: "signaling" },
        { id: "AGT", label: "AGT", geneId: "183", role: "signaling" },
        { id: "ACE", label: "ACE", geneId: "1636", role: "signaling" },
        { id: "AGTR1", label: "AGTR1", geneId: "185", role: "signaling" },
      ],
      edges: [
        { source: "REN", target: "AGT", mechanism: "activation" },
        { source: "AGT", target: "ACE", mechanism: "activation" },
        { source: "ACE", target: "AGTR1", mechanism: "activation" },
      ],
    },
  },
  hsa04960: {
    id: "hsa04960",
    name: "알도스테론 조절 나트륨 재흡수",
    nameEn: "Aldosterone-regulated sodium reabsorption",
    source: "KEGG",
    sourceId: "hsa04960",
    category: "신호전달",
    relevance: 0.84,
    summary:
      "안지오텐신 II가 유도한 알도스테론이 미네랄로코르티코이드 수용체(NR3C2)를 활성화하고, SGK1을 거쳐 상피 나트륨 통로(ENaC, SCNN1A)를 늘려 나트륨과 수분을 재흡수하는 경로입니다.",
    relatedPathwayIds: ["hsa04614", "hsa04962"],
    network: {
      nodes: [
        { id: "AGTR1", label: "AGTR1", geneId: "185", role: "signaling" },
        { id: "NR3C2", label: "NR3C2", geneId: "4306", role: "signaling" },
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
  hsa04962: {
    id: "hsa04962",
    name: "바소프레신 조절 수분 재흡수",
    nameEn: "Vasopressin-regulated water reabsorption",
    source: "KEGG",
    sourceId: "hsa04962",
    category: "신호전달",
    relevance: 0.8,
    summary:
      "항이뇨호르몬(바소프레신)이 V2 수용체(AVPR2)→Gs→PKA 경로를 켜서 물통로 아쿠아포린2(AQP2)를 세포막으로 이동시켜 집합관에서 수분을 재흡수하는 경로입니다.",
    relatedPathwayIds: ["hsa04960"],
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
  "R-HSA-9013700": {
    id: "R-HSA-9013700",
    name: "사구체 여과 장벽 (족세포)",
    nameEn: "Glomerular filtration barrier",
    source: "Reactome",
    sourceId: "R-HSA-9013700",
    category: "발달",
    relevance: 0.75,
    summary:
      "족세포(podocyte)의 슬릿막 단백질 네프린(NPHS1)·포도신(NPHS2)과 포도칼릭신(PODXL)이 정교한 여과 틈을 만들어 혈액에서 소변을 걸러내되 단백질은 새지 않게 하는 구조 상호작용망입니다.",
    relatedPathwayIds: ["hsa04614"],
    network: {
      nodes: [
        { id: "NPHS1", label: "NPHS1", geneId: "4868", role: "structural" },
        { id: "NPHS2", label: "NPHS2", geneId: "7827", role: "structural" },
        { id: "PODXL", label: "PODXL", geneId: "5420", role: "structural" },
      ],
      edges: [
        { source: "NPHS1", target: "NPHS2", mechanism: "interaction" },
        { source: "NPHS2", target: "PODXL", mechanism: "interaction" },
        { source: "NPHS1", target: "PODXL", mechanism: "interaction" },
      ],
    },
  },

  // ═══════════════ 췌장 (Pancreas) ═══════════════
  hsa04911: {
    id: "hsa04911",
    name: "인슐린 분비 (Insulin secretion)",
    nameEn: "Insulin secretion",
    source: "KEGG",
    sourceId: "hsa04911",
    category: "신호전달",
    relevance: 0.92,
    summary:
      "혈당이 오르면 베타세포가 포도당을 감지(GCK)해 ATP를 만들고, 이 ATP가 K-ATP 통로(KCNJ11·ABCC8)를 닫아 세포를 흥분시켜 인슐린(INS)을 분비합니다. GLP-1 수용체는 이 분비를 증폭합니다.",
    relatedPathwayIds: ["hsa04972"],
    network: {
      nodes: [
        { id: "GCK", label: "GCK", geneId: "2645", role: "signaling" },
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
  hsa04972: {
    id: "hsa04972",
    name: "췌장 소화액 분비 (Pancreatic secretion)",
    nameEn: "Pancreatic secretion",
    source: "KEGG",
    sourceId: "hsa04972",
    category: "대사",
    relevance: 0.86,
    summary:
      "선포세포는 단백질·지방·탄수화물을 분해하는 소화효소(트립신 PRSS1, 라이페이스 PNLIP, 아밀레이스 AMY2A)를 분비하고, 췌관세포는 CFTR 통로로 중탄산이 풍부한 액을 흘려 위산을 중화합니다.",
    relatedPathwayIds: ["hsa04911"],
    network: {
      nodes: [
        { id: "PRSS1", label: "PRSS1", geneId: "5644", role: "signaling" },
        { id: "PNLIP", label: "PNLIP", geneId: "5406", role: "signaling" },
        { id: "AMY2A", label: "AMY2A", geneId: "279", role: "signaling" },
        { id: "CFTR", label: "CFTR", geneId: "1080", role: "signaling" },
      ],
      edges: [
        { source: "PRSS1", target: "PNLIP", mechanism: "activation" },
        { source: "PRSS1", target: "AMY2A", mechanism: "interaction" },
        { source: "CFTR", target: "PRSS1", mechanism: "interaction" },
      ],
    },
  },

  // ═══════════════ 위 (Stomach) ═══════════════
  hsa04971: {
    id: "hsa04971",
    name: "위산 분비 (Gastric acid secretion)",
    nameEn: "Gastric acid secretion",
    source: "KEGG",
    sourceId: "hsa04971",
    category: "신호전달",
    relevance: 0.89,
    summary:
      "가스트린(GAST)과 히스타민 수용체(HRH2) 신호가 벽세포의 양성자 펌프(ATP4A)를 켜서 위 내강으로 산을 뿜어냅니다. 칼륨 통로(KCNQ1)가 펌프에 필요한 칼륨을 계속 재공급합니다.",
    relatedPathwayIds: ["hsa04974"],
    network: {
      nodes: [
        { id: "GAST", label: "GAST", geneId: "2520", role: "signaling" },
        { id: "HRH2", label: "HRH2", geneId: "3274", role: "signaling" },
        { id: "ATP4A", label: "ATP4A", geneId: "495", role: "signaling" },
        { id: "KCNQ1", label: "KCNQ1", geneId: "3784", role: "signaling" },
      ],
      edges: [
        { source: "GAST", target: "HRH2", mechanism: "activation" },
        { source: "HRH2", target: "ATP4A", mechanism: "activation" },
        { source: "KCNQ1", target: "ATP4A", mechanism: "interaction" },
      ],
    },
  },
  hsa04974: {
    id: "hsa04974",
    name: "단백질 소화·흡수 (Protein digestion & absorption)",
    nameEn: "Protein digestion and absorption",
    source: "KEGG",
    sourceId: "hsa04974",
    category: "대사",
    relevance: 0.8,
    summary:
      "주세포가 만든 펩시노겐(PGC)이 위산에 의해 펩신으로 활성화되어 단백질을 잘게 자르고, 장 상피의 펩타이드 수송체(SLC15A1)가 그 조각(펩타이드)을 세포 안으로 흡수합니다.",
    relatedPathwayIds: ["hsa04971"],
    network: {
      nodes: [
        { id: "GAST", label: "GAST", geneId: "2520", role: "signaling" },
        { id: "PGC", label: "PGC", geneId: "5225", role: "signaling" },
        { id: "SLC15A1", label: "SLC15A1", geneId: "6564", role: "signaling" },
      ],
      edges: [
        { source: "GAST", target: "PGC", mechanism: "activation" },
        { source: "PGC", target: "SLC15A1", mechanism: "interaction" },
      ],
    },
  },

  // ═══════════════ 장 (Intestine) ═══════════════
  hsa04973: {
    id: "hsa04973",
    name: "탄수화물 소화·흡수 (Carbohydrate digestion & absorption)",
    nameEn: "Carbohydrate digestion and absorption",
    source: "KEGG",
    sourceId: "hsa04973",
    category: "대사",
    relevance: 0.85,
    summary:
      "장 상피의 이당류 분해효소(수크레이스-아이소말테이스 SI)가 탄수화물을 포도당으로 자르면, 나트륨 공동수송체(SGLT1, SLC5A1)가 이를 세포로 끌어들이고, GLUT2(SLC2A2)가 혈액 쪽으로 넘겨 흡수를 완성합니다.",
    relatedPathwayIds: ["hsa04310"],
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
  hsa04310: {
    id: "hsa04310",
    name: "Wnt 신호전달 (장 줄기세포 재생)",
    nameEn: "Wnt signaling pathway",
    source: "KEGG",
    sourceId: "hsa04310",
    category: "발달",
    relevance: 0.83,
    summary:
      "Wnt 신호(WNT3)가 있으면 파괴복합체의 핵심 APC가 억제되어 β-카테닌(CTNNB1)이 쌓이고, 이것이 전사인자 TCF7L2와 손잡아 MYC 같은 증식 유전자를 켭니다. APC가 망가지면 이 스위치가 계속 켜져 대장암의 출발점이 됩니다.",
    relatedPathwayIds: ["hsa05210", "hsa04973"],
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
  hsa05210: {
    id: "hsa05210",
    name: "대장암 (Colorectal cancer)",
    nameEn: "Colorectal cancer",
    source: "KEGG",
    sourceId: "hsa05210",
    category: "세포사멸",
    relevance: 0.78,
    summary:
      "APC 소실로 β-카테닌(CTNNB1)이 폭주하고, 여기에 KRAS 활성 돌연변이와 TP53 기능 상실이 겹치면서 MYC 등 증식 신호가 통제를 벗어나 정상 대장 상피가 단계적으로 암으로 진행합니다.",
    relatedPathwayIds: ["hsa04310"],
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
        pathwayIds: ["hsa04210", "hsa04728", "R-HSA-69541"],
      },
      {
        id: "cortex",
        name: "대뇌피질",
        nameEn: "Cerebral cortex",
        description: "고차원 인지·감각·운동 처리를 담당하는 바깥층입니다.",
        position: [0, 0.7, 0.55],
        pathwayIds: ["hsa04728", "R-HSA-69541"],
      },
      {
        id: "thalamus",
        name: "시상",
        nameEn: "Thalamus",
        description: "감각 정보를 대뇌피질로 중계하는 관문입니다.",
        position: [0, 0.05, -0.1],
        pathwayIds: ["hsa04728"],
      },
      {
        id: "cerebellum",
        name: "소뇌",
        nameEn: "Cerebellum",
        description: "운동 협응과 균형, 미세 조정을 담당합니다.",
        position: [0, -0.5, -0.7],
        pathwayIds: ["hsa04210"],
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
        pathwayIds: ["hsa04260", "hsa04261", "hsa05410"],
      },
      {
        id: "conduction",
        name: "전도계",
        nameEn: "Conduction system",
        description: "동방결절 등에서 전기 신호를 만들어 박동 리듬을 지휘합니다.",
        position: [0, 0.55, 0.1],
        pathwayIds: ["hsa04261", "hsa04260"],
      },
      {
        id: "coronary",
        name: "관상동맥",
        nameEn: "Coronary artery",
        description: "심장 근육 자체에 산소와 영양을 공급하는 혈관입니다.",
        position: [-0.45, 0.1, 0.35],
        pathwayIds: ["hsa04261"],
      },
      {
        id: "endocardium",
        name: "심내막·판막",
        nameEn: "Endocardium & valves",
        description: "심장 내부를 감싸고 혈류 방향을 지키는 얇은 막과 판막입니다.",
        position: [0.1, -0.45, -0.2],
        pathwayIds: ["hsa05410"],
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
        pathwayIds: ["hsa00071", "hsa00982", "hsa04976"],
      },
      {
        id: "bileduct",
        name: "담관",
        nameEn: "Bile duct",
        description: "간세포가 만든 담즙을 모아 쓸개·장으로 흘려보내는 관입니다.",
        position: [-0.4, 0.0, 0.3],
        pathwayIds: ["hsa04976"],
      },
      {
        id: "sinusoid",
        name: "굴모세혈관",
        nameEn: "Sinusoid",
        description: "혈액과 간세포가 물질을 주고받는 특수 모세혈관입니다.",
        position: [0.1, 0.5, -0.35],
        pathwayIds: ["hsa00071"],
      },
      {
        id: "kupffer",
        name: "쿠퍼세포",
        nameEn: "Kupffer cell",
        description: "간에 상주하는 대식세포로 병원체·노폐물·이물질을 청소합니다.",
        position: [-0.3, -0.4, -0.2],
        pathwayIds: ["hsa00982"],
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
        pathwayIds: ["R-HSA-5683826", "hsa04066"],
      },
      {
        id: "bronchus",
        name: "기관지",
        nameEn: "Bronchus",
        description: "공기를 폐포로 실어 나르는 나뭇가지 모양의 통로입니다.",
        position: [0, 0.6, 0.0],
        pathwayIds: ["hsa05310"],
      },
      {
        id: "pulmonary_vessel",
        name: "폐혈관",
        nameEn: "Pulmonary vasculature",
        description: "폐포를 감싸며 산소와 이산화탄소를 실어 나르는 혈관망입니다.",
        position: [-0.45, 0.0, 0.3],
        pathwayIds: ["hsa04066"],
      },
      {
        id: "ciliated_epithelium",
        name: "섬모 상피",
        nameEn: "Ciliated epithelium",
        description: "점액과 섬모로 이물질을 밖으로 밀어내는 기도 방어층입니다.",
        position: [0.1, -0.45, -0.2],
        pathwayIds: ["hsa05310"],
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
        pathwayIds: ["R-HSA-9013700"],
      },
      {
        id: "proximal_tubule",
        name: "근위세뇨관",
        nameEn: "Proximal tubule",
        description: "포도당·아미노산·나트륨 등 유용한 물질을 대량 재흡수합니다.",
        position: [-0.4, 0.1, 0.3],
        pathwayIds: ["hsa04614"],
      },
      {
        id: "distal_tubule",
        name: "원위세뇨관",
        nameEn: "Distal tubule",
        description: "호르몬 조절 아래 나트륨·칼륨을 미세 조정하는 부위입니다.",
        position: [0.1, 0.5, -0.35],
        pathwayIds: ["hsa04960"],
      },
      {
        id: "collecting_duct",
        name: "집합관",
        nameEn: "Collecting duct",
        description: "바소프레신·알도스테론에 반응해 최종 수분·염분을 조절합니다.",
        position: [-0.2, -0.45, -0.15],
        pathwayIds: ["hsa04962", "hsa04960"],
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
        pathwayIds: ["hsa04971"],
      },
      {
        id: "chief_cell",
        name: "주세포",
        nameEn: "Chief cell",
        description: "단백질 분해효소의 전구체인 펩시노겐을 분비하는 세포입니다.",
        position: [-0.4, 0.05, 0.3],
        pathwayIds: ["hsa04974"],
      },
      {
        id: "gastric_mucosa",
        name: "점막상피",
        nameEn: "Gastric mucosa",
        description: "점액과 중탄산을 분비해 위 스스로 산에 녹지 않도록 보호합니다.",
        position: [0.1, 0.5, -0.3],
        pathwayIds: ["hsa04971"],
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
        pathwayIds: ["hsa04911"],
      },
      {
        id: "acinar_cell",
        name: "선포세포",
        nameEn: "Acinar cell",
        description: "단백질·지방·탄수화물을 분해하는 소화효소를 만들어 분비합니다.",
        position: [-0.4, 0.1, 0.3],
        pathwayIds: ["hsa04972"],
      },
      {
        id: "pancreatic_duct",
        name: "췌관",
        nameEn: "Pancreatic duct",
        description: "중탄산이 풍부한 췌장액을 십이지장으로 흘려 위산을 중화합니다.",
        position: [0.1, -0.4, -0.2],
        pathwayIds: ["hsa04972"],
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
        pathwayIds: ["hsa04973"],
      },
      {
        id: "crypt_stem",
        name: "장샘 줄기세포",
        nameEn: "Crypt stem cell",
        description: "Wnt 신호로 끊임없이 증식해 손상되는 장 상피를 계속 새로 채웁니다.",
        position: [-0.4, 0.1, 0.3],
        pathwayIds: ["hsa04310"],
      },
      {
        id: "colonocyte",
        name: "대장 상피",
        nameEn: "Colonocyte",
        description: "수분을 흡수하는 대장 상피로, 유전자 손상이 쌓이면 대장암이 생깁니다.",
        position: [0.1, -0.4, -0.2],
        pathwayIds: ["hsa05210"],
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
    if (
      g.symbol.toLowerCase().includes(q) ||
      g.fullName.toLowerCase().includes(q)
    ) {
      const organCount = findGeneDistribution(g.symbol)?.organIds.length ?? 0;
      hits.push({
        type: "gene",
        id: g.symbol,
        label: g.symbol,
        sublabel:
          organCount > 1 ? `유전자 · ${organCount}개 장기` : "유전자",
      });
    }
  }
  // 유전자 히트를 앞으로 — 심볼 검색은 대개 유전자를 찾는 의도다.
  hits.sort((a, b) => (a.type === "gene" ? -1 : 0) - (b.type === "gene" ? -1 : 0));
  return hits.slice(0, 8);
}
