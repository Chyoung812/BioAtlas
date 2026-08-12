// Interactive Micro-Map 스토리 데이터 (79개 유전자 전체)
// 각 유전자는 3장면(비트) 시퀀스로 자기가 하는 일을 연기한다.
// 렌더는 components/MicroMap.tsx가 담당 — 여기는 순수 데이터.

export type Actor = {
  id: string;
  /** 이모지 배우 */
  emoji?: string;
  /** 라벨 배우(색 원 안 텍스트) — 단백질 표현용 */
  label?: string;
  color?: string;
  /** 무대 내 위치 (%). 0~100 */
  x: number;
  y: number;
  /** 픽셀 크기 (기본 40) */
  size?: number;
};

export type Beat = { caption: string; actors: Actor[] };

export const RED = "#ef4444";
export const INDIGO = "#6366f1";
export const VIOLET = "#8b5cf6";
export const SKY = "#38bdf8";
export const AMBER = "#f59e0b";
export const GREEN = "#22c55e";

// 뇌 아폽토시스 경로 유전자들의 스토리 (사용자가 실제로 탐색하는 핵심 경로)
export const STORIES: Record<string, Beat[]> = {
  // CYCS — 시토크롬 c가 새어나와 경보
  alarm: [
    {
      caption: "평소엔 시토크롬 c가 미토콘드리아 안에서 에너지 만드는 일을 도와요",
      actors: [
        { id: "mito", emoji: "🫘", x: 50, y: 52, size: 96 },
        { id: "c", label: "c", color: RED, x: 50, y: 52, size: 28 },
      ],
    },
    {
      caption: "그런데 BAX가 다가와 미토콘드리아에 구멍을 뚫으면…",
      actors: [
        { id: "mito", emoji: "🫘", x: 44, y: 52, size: 96 },
        { id: "c", label: "c", color: RED, x: 44, y: 54, size: 28 },
        { id: "bax", label: "BAX", color: VIOLET, x: 76, y: 38, size: 34 },
        { id: "hole", emoji: "🕳️", x: 62, y: 48, size: 26 },
      ],
    },
    {
      caption: "시토크롬 c가 구멍으로 빠져나와요",
      actors: [
        { id: "mito", emoji: "🫘", x: 38, y: 54, size: 90 },
        { id: "bax", label: "BAX", color: VIOLET, x: 58, y: 34, size: 30 },
        { id: "hole", emoji: "🕳️", x: 54, y: 50, size: 24 },
        { id: "c", label: "c", color: RED, x: 82, y: 52, size: 30 },
      ],
    },
    {
      caption: "→ 세포에 사멸 경보가 울립니다 🚨",
      actors: [
        { id: "mito", emoji: "🫘", x: 32, y: 56, size: 82 },
        { id: "c", label: "c", color: RED, x: 64, y: 46, size: 30 },
        { id: "alarm", emoji: "🚨", x: 82, y: 32, size: 42 },
      ],
    },
  ],

  // BAX — 미토콘드리아에 구멍을 뚫는 단백질
  pore: [
    {
      caption: "BAX가 미토콘드리아 표면으로 다가가요",
      actors: [
        { id: "mito", emoji: "🫘", x: 42, y: 52, size: 96 },
        { id: "bax", label: "BAX", color: VIOLET, x: 80, y: 42, size: 36 },
      ],
    },
    {
      caption: "막에 구멍(pore)을 뚫어요",
      actors: [
        { id: "mito", emoji: "🫘", x: 45, y: 52, size: 96 },
        { id: "bax", label: "BAX", color: VIOLET, x: 58, y: 46, size: 32 },
        { id: "hole", emoji: "🕳️", x: 65, y: 48, size: 26 },
      ],
    },
    {
      caption: "안의 사멸 신호물질이 쏟아져 나와요",
      actors: [
        { id: "mito", emoji: "🫘", x: 38, y: 54, size: 90 },
        { id: "hole", emoji: "🕳️", x: 56, y: 50, size: 24 },
        { id: "c", label: "c", color: RED, x: 76, y: 42, size: 26 },
        { id: "c2", label: "c", color: RED, x: 84, y: 60, size: 22 },
      ],
    },
  ],

  // BCL2 — BAX를 막아 세포를 지키는 보호자
  shield: [
    {
      caption: "BAX가 미토콘드리아에 구멍을 뚫으려 해요",
      actors: [
        { id: "mito", emoji: "🫘", x: 44, y: 52, size: 96 },
        { id: "bax", label: "BAX", color: VIOLET, x: 72, y: 44, size: 34 },
      ],
    },
    {
      caption: "BCL2가 BAX를 가로막아요",
      actors: [
        { id: "mito", emoji: "🫘", x: 42, y: 52, size: 96 },
        { id: "bax", label: "BAX", color: VIOLET, x: 72, y: 44, size: 30 },
        { id: "bcl2", emoji: "🛡️", x: 58, y: 46, size: 40 },
      ],
    },
    {
      caption: "구멍이 안 뚫려 세포가 살아남아요 💚",
      actors: [
        { id: "mito", emoji: "🫘", x: 48, y: 52, size: 100 },
        { id: "bcl2", emoji: "🛡️", x: 66, y: 40, size: 34 },
        { id: "ok", emoji: "💚", x: 50, y: 22, size: 30 },
      ],
    },
  ],

  // TP53 — 유전체의 수호자
  guardian: [
    {
      caption: "p53이 우리 DNA를 순찰하며 검사해요",
      actors: [
        { id: "dna", emoji: "🧬", x: 42, y: 54, size: 72 },
        { id: "p53", label: "p53", color: INDIGO, x: 72, y: 44, size: 38 },
      ],
    },
    {
      caption: "DNA 손상을 발견하면…",
      actors: [
        { id: "dna", emoji: "🧬", x: 42, y: 54, size: 72 },
        { id: "dmg", emoji: "💥", x: 42, y: 38, size: 34 },
        { id: "p53", label: "p53", color: INDIGO, x: 58, y: 48, size: 38 },
      ],
    },
    {
      caption: "세포를 멈추거나 스스로 사라지게 해 암을 막아요",
      actors: [
        { id: "p53", label: "p53", color: INDIGO, x: 50, y: 38, size: 40 },
        { id: "stop", emoji: "🛑", x: 36, y: 62, size: 32 },
        { id: "apop", emoji: "🍂", x: 66, y: 62, size: 30 },
      ],
    },
  ],

  // CASP3 — 사멸의 집행관(가위)
  scissors: [
    {
      caption: "사멸 신호가 도착하면 CASP3가 켜져요",
      actors: [
        { id: "sig", emoji: "⚡", x: 26, y: 36, size: 30 },
        { id: "casp", emoji: "✂️", x: 58, y: 52, size: 42 },
      ],
    },
    {
      caption: "세포 안 단백질들을 싹둑 잘라내요",
      actors: [
        { id: "casp", emoji: "✂️", x: 48, y: 48, size: 42 },
        { id: "p1", emoji: "🧩", x: 72, y: 38, size: 26 },
        { id: "p2", emoji: "🧩", x: 74, y: 62, size: 26 },
      ],
    },
    {
      caption: "세포가 깔끔하게 해체돼요",
      actors: [
        { id: "casp", emoji: "✂️", x: 42, y: 50, size: 34 },
        { id: "p1", emoji: "🧩", x: 66, y: 30, size: 20 },
        { id: "p2", emoji: "🧩", x: 80, y: 66, size: 20 },
        { id: "p3", emoji: "🧩", x: 58, y: 72, size: 18 },
      ],
    },
  ],

  // PRKACA(PKA) — cAMP가 켜는 만능 인산화 스위치
  switch: [
    {
      caption: "cAMP 신호가 도착하면 PKA 스위치가 켜져요",
      actors: [
        { id: "camp", label: "cAMP", color: "#38bdf8", x: 24, y: 38, size: 34 },
        { id: "pka", label: "PKA", color: INDIGO, x: 58, y: 54, size: 46 },
      ],
    },
    {
      caption: "PKA가 표적 단백질에 인산기(P)를 '딱' 붙여요",
      actors: [
        { id: "pka", label: "PKA", color: INDIGO, x: 30, y: 52, size: 40 },
        { id: "target", label: "표적", color: "#64748b", x: 68, y: 56, size: 46 },
        { id: "p", label: "P", color: "#f59e0b", x: 68, y: 40, size: 24 },
      ],
    },
    {
      caption: "표적이 '켜져' 심장은 수축·신장은 물 재흡수를 시작해요 💡",
      actors: [
        { id: "target", label: "ON", color: "#22c55e", x: 44, y: 56, size: 46 },
        { id: "p", label: "P", color: "#f59e0b", x: 44, y: 40, size: 24 },
        { id: "bulb", emoji: "💡", x: 72, y: 44, size: 36 },
      ],
    },
  ],

  // APAF1 — 아폽토솜(처형대) 조립공
  assembler: [
    {
      caption: "빠져나온 시토크롬 c가 APAF1과 만나요",
      actors: [
        { id: "c", label: "c", color: RED, x: 28, y: 46, size: 28 },
        { id: "apaf", label: "APAF1", color: INDIGO, x: 66, y: 50, size: 42 },
      ],
    },
    {
      caption: "여러 개가 모여 아폽토솜(처형대)을 조립해요",
      actors: [
        { id: "ring", emoji: "⚙️", x: 50, y: 52, size: 66 },
        { id: "apaf", label: "APAF1", color: INDIGO, x: 50, y: 52, size: 34 },
        { id: "c", label: "c", color: RED, x: 50, y: 28, size: 22 },
      ],
    },
    {
      caption: "이 처형대가 카스파제를 활성화해요",
      actors: [
        { id: "ring", emoji: "⚙️", x: 42, y: 52, size: 58 },
        { id: "casp", emoji: "✂️", x: 76, y: 46, size: 34 },
      ],
    },
  ],

  // ─────────── 심장·간·폐·신장·기타 유전자 스토리 ───────────

  // MYC — 세포 성장의 가속 페달(원발암유전자)
  accelerator: [
    {
      caption: "Wnt 신호가 MYC라는 '가속 페달'을 밟아요",
      actors: [
        { id: "wnt", label: "Wnt", color: SKY, x: 24, y: 38, size: 32 },
        { id: "myc", label: "MYC", color: INDIGO, x: 60, y: 54, size: 46 },
      ],
    },
    {
      caption: "MYC가 세포 성장·증식 유전자를 총괄해 켜요 🚀",
      actors: [
        { id: "myc", label: "MYC", color: INDIGO, x: 38, y: 52, size: 44 },
        { id: "go", emoji: "🚀", x: 64, y: 42, size: 32 },
        { id: "cell", emoji: "🧫", x: 80, y: 58, size: 32 },
      ],
    },
    {
      caption: "통제를 벗어나 과하게 켜지면 종양을 키워요 ⚠️",
      actors: [
        { id: "myc", label: "MYC", color: RED, x: 38, y: 52, size: 44 },
        { id: "cell", emoji: "🧫", x: 62, y: 40, size: 28 },
        { id: "cell2", emoji: "🧫", x: 72, y: 62, size: 28 },
        { id: "warn", emoji: "⚠️", x: 84, y: 34, size: 30 },
      ],
    },
  ],

  // APC — 증식 브레이크(종양억제자)
  brake: [
    {
      caption: "β-카테닌이 자꾸 증식 신호를 켜려고 해요",
      actors: [
        { id: "bcat", label: "β", color: AMBER, x: 30, y: 44, size: 30 },
        { id: "apc", label: "APC", color: INDIGO, x: 66, y: 54, size: 44 },
      ],
    },
    {
      caption: "APC가 β-카테닌을 붙잡아 없애요 (증식 브레이크)",
      actors: [
        { id: "apc", label: "APC", color: INDIGO, x: 46, y: 54, size: 44 },
        { id: "bcat", label: "β", color: AMBER, x: 46, y: 38, size: 24 },
      ],
    },
    {
      caption: "세포가 멋대로 증식하지 않게 막아요 🛑",
      actors: [
        { id: "apc", label: "APC", color: INDIGO, x: 44, y: 52, size: 44 },
        { id: "stop", emoji: "🛑", x: 70, y: 44, size: 34 },
      ],
    },
  ],

  // CFTR — 염소 이온 수문
  channel: [
    {
      caption: "CFTR는 세포막의 '이온 수문'이에요",
      actors: [
        { id: "cftr", label: "CFTR", color: INDIGO, x: 52, y: 54, size: 46 },
        { id: "cl", label: "Cl⁻", color: SKY, x: 34, y: 42, size: 26 },
      ],
    },
    {
      caption: "염소·중탄산 이온을 밖으로 내보내요",
      actors: [
        { id: "cftr", label: "CFTR", color: INDIGO, x: 42, y: 54, size: 44 },
        { id: "cl", label: "Cl⁻", color: SKY, x: 68, y: 42, size: 24 },
        { id: "cl2", label: "Cl⁻", color: SKY, x: 78, y: 60, size: 22 },
      ],
    },
    {
      caption: "분비액이 묽어져 잘 흐르게 돼요 💧",
      actors: [
        { id: "cftr", label: "CFTR", color: INDIGO, x: 40, y: 54, size: 42 },
        { id: "drop", emoji: "💧", x: 68, y: 46, size: 32 },
        { id: "drop2", emoji: "💧", x: 80, y: 58, size: 26 },
      ],
    },
  ],

  // INS·GAST — 호르몬(분비 → 이동 → 명령)
  hormone: [
    {
      caption: "신호가 오면 호르몬이 분비돼요",
      actors: [
        { id: "gland", emoji: "🏭", x: 24, y: 46, size: 40 },
        { id: "h", emoji: "💊", x: 46, y: 50, size: 30 },
      ],
    },
    {
      caption: "혈류를 타고 표적 세포로 이동해요",
      actors: [
        { id: "h", emoji: "💊", x: 54, y: 46, size: 30 },
        { id: "target", label: "표적", color: "#64748b", x: 80, y: 54, size: 42 },
      ],
    },
    {
      caption: "표적에게 할 일을 명령해요 📣",
      actors: [
        { id: "h", emoji: "💊", x: 42, y: 48, size: 26 },
        { id: "target", label: "ON", color: GREEN, x: 60, y: 54, size: 42 },
        { id: "mega", emoji: "📣", x: 82, y: 38, size: 32 },
      ],
    },
  ],

  // GCK — 혈당 계량기
  sensor: [
    {
      caption: "포도당이 들어오면 GCK가 그 양을 재요",
      actors: [
        { id: "glc", emoji: "🍬", x: 26, y: 40, size: 28 },
        { id: "gck", label: "GCK", color: INDIGO, x: 60, y: 54, size: 44 },
      ],
    },
    {
      caption: "들어온 양에 딱 맞춰 반응해요 📏",
      actors: [
        { id: "gck", label: "GCK", color: INDIGO, x: 50, y: 54, size: 44 },
        { id: "glc", emoji: "🍬", x: 50, y: 38, size: 24 },
        { id: "ruler", emoji: "📏", x: 78, y: 44, size: 30 },
      ],
    },
    {
      caption: "인슐린을 언제 얼마나 낼지 정해요",
      actors: [
        { id: "gck", label: "GCK", color: INDIGO, x: 40, y: 52, size: 42 },
        { id: "ins", emoji: "💊", x: 68, y: 46, size: 28 },
        { id: "ins2", emoji: "💊", x: 80, y: 60, size: 24 },
      ],
    },
  ],

  // DRD2·ADRB1·GLP1R·HRH2 — 표면 수신 안테나
  antenna: [
    {
      caption: "바깥 신호분자가 표면 안테나(수용체)에 다가와요",
      actors: [
        { id: "sig", label: "신호", color: SKY, x: 24, y: 36, size: 32 },
        { id: "rec", emoji: "📡", x: 56, y: 56, size: 44 },
      ],
    },
    {
      caption: "안테나에 '딱' 결합하면 모양이 바뀌어요",
      actors: [
        { id: "rec", emoji: "📡", x: 52, y: 56, size: 46 },
        { id: "sig", label: "신호", color: SKY, x: 52, y: 38, size: 28 },
      ],
    },
    {
      caption: "신호를 세포 안으로 전달해요 →",
      actors: [
        { id: "rec", emoji: "📡", x: 34, y: 54, size: 40 },
        { id: "arrow", emoji: "➡️", x: 58, y: 52, size: 30 },
        { id: "g", label: "G", color: INDIGO, x: 80, y: 52, size: 38 },
      ],
    },
  ],

  // GNAI2·GNAS — G단백질 중계기
  relay: [
    {
      caption: "수용체가 G단백질(Gα)을 깨워요",
      actors: [
        { id: "rec", emoji: "📡", x: 26, y: 44, size: 34 },
        { id: "g", label: "Gα", color: INDIGO, x: 58, y: 54, size: 44 },
      ],
    },
    {
      caption: "G단백질이 신호를 받아 이동해요",
      actors: [
        { id: "g", label: "Gα", color: INDIGO, x: 54, y: 50, size: 42 },
        { id: "spark", emoji: "✨", x: 74, y: 40, size: 24 },
      ],
    },
    {
      caption: "다음 단계 효소에 신호를 넘겨줘요 🔁",
      actors: [
        { id: "g", label: "Gα", color: INDIGO, x: 40, y: 52, size: 40 },
        { id: "enz", emoji: "⚙️", x: 72, y: 48, size: 40 },
      ],
    },
  ],

  // RYR2 — 칼슘 방출 밸브
  calcium: [
    {
      caption: "작은 칼슘 신호가 RYR2 밸브를 열어요",
      actors: [
        { id: "sig", emoji: "⚡", x: 22, y: 36, size: 28 },
        { id: "ryr", label: "RYR2", color: INDIGO, x: 52, y: 54, size: 46 },
        { id: "ca", label: "Ca", color: SKY, x: 52, y: 54, size: 22 },
      ],
    },
    {
      caption: "저장된 칼슘이 왈칵 쏟아져 나와요 🌊",
      actors: [
        { id: "ryr", label: "RYR2", color: INDIGO, x: 32, y: 54, size: 42 },
        { id: "ca", label: "Ca", color: SKY, x: 60, y: 42, size: 22 },
        { id: "ca2", label: "Ca", color: SKY, x: 72, y: 58, size: 20 },
        { id: "ca3", label: "Ca", color: SKY, x: 68, y: 34, size: 20 },
      ],
    },
    {
      caption: "칼슘이 심장을 힘차게 수축시켜요 💓",
      actors: [
        { id: "heart", emoji: "💓", x: 58, y: 50, size: 50 },
        { id: "ca", label: "Ca", color: SKY, x: 36, y: 44, size: 20 },
      ],
    },
  ],

  // MYH7 — 근육 수축 모터
  motor: [
    {
      caption: "미오신 모터(MYH7)가 액틴 필라멘트를 붙잡아요",
      actors: [
        { id: "myo", label: "MYH7", color: INDIGO, x: 38, y: 52, size: 42 },
        { id: "fil", emoji: "🧵", x: 72, y: 50, size: 40 },
      ],
    },
    {
      caption: "에너지를 써서 필라멘트를 잡아당겨요",
      actors: [
        { id: "myo", label: "MYH7", color: INDIGO, x: 44, y: 52, size: 42 },
        { id: "fil", emoji: "🧵", x: 60, y: 50, size: 38 },
      ],
    },
    {
      caption: "→ 근육이 힘차게 수축해요 💪",
      actors: [{ id: "muscle", emoji: "💪", x: 52, y: 50, size: 56 }],
    },
  ],

  // NR1H4(FXR) — 담즙산 센서
  bilesensor: [
    {
      caption: "담즙산이 많아지면 FXR 센서가 감지해요",
      actors: [
        { id: "ba1", emoji: "🟡", x: 24, y: 40, size: 26 },
        { id: "ba2", emoji: "🟡", x: 32, y: 58, size: 24 },
        { id: "fxr", label: "FXR", color: INDIGO, x: 64, y: 52, size: 44 },
      ],
    },
    {
      caption: "배출은 늘리고 합성은 줄이도록 조절해요",
      actors: [
        { id: "fxr", label: "FXR", color: INDIGO, x: 44, y: 52, size: 44 },
        { id: "out", emoji: "➡️", x: 68, y: 44, size: 28 },
        { id: "ba1", emoji: "🟡", x: 82, y: 46, size: 22 },
      ],
    },
    {
      caption: "담즙산이 넘치지 않게 균형을 맞춰요 🧭",
      actors: [
        { id: "fxr", label: "FXR", color: INDIGO, x: 44, y: 52, size: 42 },
        { id: "compass", emoji: "🧭", x: 70, y: 46, size: 34 },
      ],
    },
  ],

  // CYP3A4 — 약물 해독 효소
  detox: [
    {
      caption: "약물이나 독소가 들어오면 CYP3A4가 붙잡아요",
      actors: [
        { id: "drug", emoji: "💊", x: 26, y: 40, size: 30 },
        { id: "cyp", label: "CYP", color: INDIGO, x: 62, y: 54, size: 46 },
      ],
    },
    {
      caption: "산소를 붙여 잘게 분해해요 🧪",
      actors: [
        { id: "cyp", label: "CYP", color: INDIGO, x: 48, y: 54, size: 44 },
        { id: "drug", emoji: "💊", x: 48, y: 38, size: 24 },
        { id: "spark", emoji: "✨", x: 72, y: 42, size: 26 },
      ],
    },
    {
      caption: "몸 밖으로 내보내기 쉽게 만들어요",
      actors: [
        { id: "p1", emoji: "🧩", x: 56, y: 44, size: 24 },
        { id: "p2", emoji: "🧩", x: 68, y: 60, size: 22 },
        { id: "out", emoji: "➡️", x: 84, y: 50, size: 30 },
      ],
    },
  ],

  // SFTPB·SFTPC — 폐포 계면활성제
  surfactant: [
    {
      caption: "폐 세포가 표면활성물질을 만들어요",
      actors: [
        { id: "sp", label: "SP", color: INDIGO, x: 30, y: 44, size: 36 },
        { id: "alv", emoji: "🫧", x: 62, y: 54, size: 54 },
      ],
    },
    {
      caption: "폐포 안쪽 표면에 얇게 펼쳐져요",
      actors: [
        { id: "alv", emoji: "🫧", x: 50, y: 52, size: 64 },
        { id: "sp", label: "SP", color: INDIGO, x: 50, y: 52, size: 28 },
      ],
    },
    {
      caption: "숨 내쉴 때 폐포가 쪼그라들지 않게 막아요 🌬️",
      actors: [
        { id: "alv", emoji: "🫧", x: 46, y: 52, size: 66 },
        { id: "breath", emoji: "🌬️", x: 76, y: 38, size: 34 },
      ],
    },
  ],

  // HIF1A — 저산소 경보 대장
  oxygen: [
    {
      caption: "산소가 충분하면 HIF-1α는 바로 분해돼요",
      actors: [
        { id: "o2", label: "O₂", color: SKY, x: 30, y: 38, size: 30 },
        { id: "hif", label: "HIF", color: INDIGO, x: 58, y: 54, size: 40 },
        { id: "gone", emoji: "💨", x: 80, y: 48, size: 28 },
      ],
    },
    {
      caption: "산소가 부족하면 HIF-1α가 살아남아 쌓여요",
      actors: [
        { id: "hif", label: "HIF", color: INDIGO, x: 44, y: 50, size: 40 },
        { id: "hif2", label: "HIF", color: INDIGO, x: 58, y: 62, size: 36 },
        { id: "hif3", label: "HIF", color: INDIGO, x: 66, y: 42, size: 34 },
      ],
    },
    {
      caption: "혈관을 늘리는 저산소 적응 유전자를 켜요 🚨",
      actors: [
        { id: "hif", label: "HIF", color: INDIGO, x: 42, y: 52, size: 40 },
        { id: "alarm", emoji: "🚨", x: 68, y: 42, size: 34 },
        { id: "blood", emoji: "🩸", x: 82, y: 56, size: 26 },
      ],
    },
  ],

  // AQP2 — 물 전용 통로
  waterchannel: [
    {
      caption: "바소프레신 신호가 오면…",
      actors: [
        { id: "sig", label: "신호", color: SKY, x: 26, y: 38, size: 32 },
        { id: "aqp", label: "AQP2", color: INDIGO, x: 60, y: 56, size: 42 },
      ],
    },
    {
      caption: "아쿠아포린 물통로가 세포막에 열려요",
      actors: [
        { id: "aqp", label: "AQP2", color: INDIGO, x: 50, y: 46, size: 44 },
      ],
    },
    {
      caption: "물이 다시 흡수되고 소변이 진해져요 💧",
      actors: [
        { id: "aqp", label: "AQP2", color: INDIGO, x: 42, y: 52, size: 40 },
        { id: "w1", emoji: "💧", x: 66, y: 44, size: 30 },
        { id: "w2", emoji: "💧", x: 78, y: 58, size: 26 },
      ],
    },
  ],

  // REN — 혈압 조절 방아쇠
  renin: [
    {
      caption: "혈압이 떨어지면 신장이 레닌(REN)을 분비해요",
      actors: [
        { id: "bp", emoji: "📉", x: 24, y: 38, size: 32 },
        { id: "ren", label: "REN", color: INDIGO, x: 60, y: 54, size: 44 },
      ],
    },
    {
      caption: "레닌이 혈압 조절 연쇄반응의 방아쇠를 당겨요 🎯",
      actors: [
        { id: "ren", label: "REN", color: INDIGO, x: 40, y: 52, size: 42 },
        { id: "target", emoji: "🎯", x: 66, y: 46, size: 34 },
        { id: "agt", label: "AGT", color: "#64748b", x: 82, y: 60, size: 34 },
      ],
    },
    {
      caption: "혈관이 좁아지고 혈압이 올라가요 📈",
      actors: [
        { id: "bp", emoji: "📈", x: 58, y: 42, size: 34 },
        { id: "blood", emoji: "🩸", x: 40, y: 52, size: 30 },
      ],
    },
  ],

  // ═══════════════ 심장 (Heart) ═══════════════

  // CACNA1C — L형 칼슘 대문
  ltype: [
    {
      caption: "전기 신호가 심근세포 막에 도착해요",
      actors: [
        { id: "sig", emoji: "⚡", x: 24, y: 36, size: 30 },
        { id: "ch", label: "Ca 대문", color: INDIGO, x: 58, y: 56, size: 48 },
      ],
    },
    {
      caption: "L형 칼슘 대문이 열리고 칼슘이 '조금' 들어와요",
      actors: [
        { id: "ch", label: "Ca 대문", color: INDIGO, x: 44, y: 56, size: 46 },
        { id: "ca", label: "Ca", color: SKY, x: 66, y: 44, size: 24 },
      ],
    },
    {
      caption: "이 작은 칼슘이 훨씬 큰 칼슘 방출의 방아쇠가 돼요 🎯",
      actors: [
        { id: "ca", label: "Ca", color: SKY, x: 34, y: 46, size: 24 },
        { id: "target", emoji: "🎯", x: 58, y: 50, size: 36 },
        { id: "ryr", label: "RYR2", color: VIOLET, x: 82, y: 54, size: 38 },
      ],
    },
  ],

  // ATP2A2 — 칼슘 회수 펌프 (SERCA2)
  serca: [
    {
      caption: "수축이 끝나면 칼슘이 세포 안에 흩어져 있어요",
      actors: [
        { id: "ca1", label: "Ca", color: SKY, x: 30, y: 40, size: 22 },
        { id: "ca2", label: "Ca", color: SKY, x: 46, y: 62, size: 20 },
        { id: "ca3", label: "Ca", color: SKY, x: 62, y: 36, size: 20 },
        { id: "pump", label: "SERCA", color: INDIGO, x: 78, y: 54, size: 44 },
      ],
    },
    {
      caption: "SERCA 펌프가 ATP를 써서 칼슘을 창고로 퍼 담아요",
      actors: [
        { id: "pump", label: "SERCA", color: INDIGO, x: 52, y: 54, size: 46 },
        { id: "atp", emoji: "🔋", x: 30, y: 40, size: 28 },
        { id: "ca1", label: "Ca", color: SKY, x: 72, y: 44, size: 22 },
      ],
    },
    {
      caption: "칼슘이 빠지면 심장이 이완해요 (다음 박동 준비) 🫀",
      actors: [
        { id: "heart", emoji: "🫀", x: 52, y: 50, size: 56 },
        { id: "store", emoji: "📦", x: 80, y: 42, size: 30 },
      ],
    },
  ],

  // PLN — SERCA 펌프의 브레이크
  phospholamban: [
    {
      caption: "평소엔 PLN이 SERCA 펌프를 붙잡아 속도를 늦춰요",
      actors: [
        { id: "pump", label: "SERCA", color: INDIGO, x: 44, y: 54, size: 46 },
        { id: "pln", label: "PLN", color: RED, x: 68, y: 46, size: 34 },
      ],
    },
    {
      caption: "아드레날린 신호가 오면 PLN에 인산기(P)가 붙어요",
      actors: [
        { id: "pump", label: "SERCA", color: INDIGO, x: 40, y: 56, size: 44 },
        { id: "pln", label: "PLN", color: RED, x: 66, y: 50, size: 32 },
        { id: "p", label: "P", color: AMBER, x: 66, y: 32, size: 24 },
      ],
    },
    {
      caption: "브레이크가 풀려 펌프가 빨라지고 심장이 더 빨리 이완해요 ⚡",
      actors: [
        { id: "pump", label: "SERCA", color: GREEN, x: 46, y: 54, size: 48 },
        { id: "pln", label: "PLN", color: "#64748b", x: 78, y: 34, size: 26 },
        { id: "fast", emoji: "⚡", x: 70, y: 56, size: 32 },
      ],
    },
  ],

  // TNNT2 — 트로포닌 복합체를 고정하는 걸쇠
  troponin: [
    {
      caption: "트로포닌 복합체가 가느다란 필라멘트 위에 얹혀 있어요",
      actors: [
        { id: "fil", emoji: "🧵", x: 44, y: 60, size: 46 },
        { id: "tnt", label: "TnT", color: INDIGO, x: 66, y: 42, size: 40 },
      ],
    },
    {
      caption: "TNNT2가 복합체를 필라멘트에 단단히 고정해요 (걸쇠)",
      actors: [
        { id: "fil", emoji: "🧵", x: 44, y: 58, size: 46 },
        { id: "tnt", label: "TnT", color: INDIGO, x: 50, y: 46, size: 40 },
        { id: "clip", emoji: "📎", x: 74, y: 40, size: 30 },
      ],
    },
    {
      caption: "칼슘 신호가 이 연결을 타고 수축으로 바뀌어요 💓",
      actors: [
        { id: "ca", label: "Ca", color: SKY, x: 28, y: 38, size: 22 },
        { id: "tnt", label: "TnT", color: INDIGO, x: 50, y: 50, size: 38 },
        { id: "heart", emoji: "💓", x: 78, y: 52, size: 40 },
      ],
    },
  ],

  // ACTC1 — 미오신이 잡아당기는 레일
  actin: [
    {
      caption: "액틴이 줄줄이 이어 붙어 필라멘트(레일)를 만들어요",
      actors: [
        { id: "a1", label: "A", color: SKY, x: 32, y: 54, size: 26 },
        { id: "a2", label: "A", color: SKY, x: 48, y: 54, size: 26 },
        { id: "a3", label: "A", color: SKY, x: 64, y: 54, size: 26 },
      ],
    },
    {
      caption: "미오신 모터가 이 레일을 붙잡아요",
      actors: [
        { id: "fil", emoji: "🧵", x: 40, y: 58, size: 46 },
        { id: "myo", label: "MYH7", color: INDIGO, x: 70, y: 44, size: 42 },
      ],
    },
    {
      caption: "레일 위를 미끄러지며 근육이 짧아져요 💪",
      actors: [{ id: "muscle", emoji: "💪", x: 52, y: 50, size: 56 }],
    },
  ],

  // MYBPC3 — 미오신을 묶고 속도를 조율하는 조율사
  conductor: [
    {
      caption: "미오신 모터들이 제멋대로 움직이려 해요",
      actors: [
        { id: "m1", label: "M", color: VIOLET, x: 34, y: 40, size: 30 },
        { id: "m2", label: "M", color: VIOLET, x: 46, y: 64, size: 30 },
        { id: "m3", label: "M", color: VIOLET, x: 62, y: 38, size: 30 },
      ],
    },
    {
      caption: "MYBPC3가 미오신을 제자리에 묶고 박자를 맞춰요",
      actors: [
        { id: "mbp", label: "MyBP-C", color: INDIGO, x: 44, y: 52, size: 48 },
        { id: "baton", emoji: "🎼", x: 74, y: 44, size: 34 },
      ],
    },
    {
      caption: "고장 나면 조율이 풀려 심근이 두꺼워져요 (비대성 심근증) ⚠️",
      actors: [
        { id: "heart", emoji: "🫀", x: 46, y: 52, size: 58 },
        { id: "warn", emoji: "⚠️", x: 78, y: 36, size: 32 },
      ],
    },
  ],

  // TPM1 — 수축 스위치를 덮어두는 덮개
  cover: [
    {
      caption: "트로포마이오신이 필라멘트를 감싸 수축 스위치를 덮어둬요",
      actors: [
        { id: "fil", emoji: "🧵", x: 46, y: 58, size: 48 },
        { id: "tpm", label: "TPM1", color: INDIGO, x: 46, y: 44, size: 42 },
      ],
    },
    {
      caption: "칼슘이 도착하면 덮개가 옆으로 비켜나요",
      actors: [
        { id: "fil", emoji: "🧵", x: 44, y: 58, size: 48 },
        { id: "tpm", label: "TPM1", color: INDIGO, x: 72, y: 36, size: 38 },
        { id: "ca", label: "Ca", color: SKY, x: 26, y: 40, size: 24 },
      ],
    },
    {
      caption: "미오신이 액틴을 붙잡을 길이 열려요 🔓",
      actors: [
        { id: "open", emoji: "🔓", x: 40, y: 44, size: 34 },
        { id: "myo", label: "MYH7", color: VIOLET, x: 70, y: 54, size: 42 },
      ],
    },
  ],

  // ═══════════════ 간 (Liver) ═══════════════

  // ABCB11 — 담즙산 배출펌프 (BSEP)
  bilepump: [
    {
      caption: "간세포 안에 담즙산이 점점 쌓여요",
      actors: [
        { id: "b1", emoji: "🟡", x: 26, y: 40, size: 24 },
        { id: "b2", emoji: "🟡", x: 36, y: 60, size: 22 },
        { id: "pump", label: "BSEP", color: INDIGO, x: 68, y: 52, size: 46 },
      ],
    },
    {
      caption: "BSEP 펌프가 ATP를 써서 담즙산을 담관으로 퍼내요",
      actors: [
        { id: "pump", label: "BSEP", color: INDIGO, x: 46, y: 52, size: 46 },
        { id: "atp", emoji: "🔋", x: 24, y: 40, size: 26 },
        { id: "b1", emoji: "🟡", x: 76, y: 46, size: 24 },
      ],
    },
    {
      caption: "고장 나면 담즙산이 간에 갇혀 간을 손상시켜요 ⚠️",
      actors: [
        { id: "pump", label: "BSEP", color: RED, x: 44, y: 54, size: 44 },
        { id: "b1", emoji: "🟡", x: 26, y: 38, size: 24 },
        { id: "warn", emoji: "⚠️", x: 74, y: 44, size: 34 },
      ],
    },
  ],

  // CYP7A1 — 담즙산 합성의 첫 단추
  bilesynth: [
    {
      caption: "콜레스테롤이 간세포로 들어와요",
      actors: [
        { id: "chol", emoji: "🧈", x: 26, y: 40, size: 30 },
        { id: "cyp", label: "CYP7A1", color: INDIGO, x: 62, y: 54, size: 48 },
      ],
    },
    {
      caption: "CYP7A1이 첫 단추를 끼워 담즙산으로 바꿔요 (속도 결정)",
      actors: [
        { id: "cyp", label: "CYP7A1", color: INDIGO, x: 44, y: 54, size: 46 },
        { id: "ba", emoji: "🟡", x: 72, y: 44, size: 26 },
      ],
    },
    {
      caption: "담즙산이 충분해지면 FXR 센서가 이 효소를 꺼요 🔻",
      actors: [
        { id: "fxr", label: "FXR", color: VIOLET, x: 34, y: 42, size: 36 },
        { id: "cyp", label: "CYP7A1", color: "#64748b", x: 64, y: 56, size: 44 },
        { id: "off", emoji: "🔻", x: 82, y: 38, size: 28 },
      ],
    },
  ],

  // SLC10A1 — 담즙산 재흡수 통로 (NTCP)
  uptake: [
    {
      caption: "장을 돌고 온 담즙산이 혈액을 타고 간에 도착해요",
      actors: [
        { id: "ba", emoji: "🟡", x: 24, y: 38, size: 26 },
        { id: "blood", emoji: "🩸", x: 38, y: 58, size: 26 },
        { id: "ntcp", label: "NTCP", color: INDIGO, x: 70, y: 52, size: 46 },
      ],
    },
    {
      caption: "NTCP가 담즙산을 간세포 안으로 빨아들여요",
      actors: [
        { id: "ntcp", label: "NTCP", color: INDIGO, x: 48, y: 52, size: 46 },
        { id: "ba", emoji: "🟡", x: 48, y: 34, size: 24 },
      ],
    },
    {
      caption: "재활용되고, 그 농도가 센서(FXR)에 전달돼요 ♻️",
      actors: [
        { id: "recycle", emoji: "♻️", x: 40, y: 46, size: 36 },
        { id: "fxr", label: "FXR", color: VIOLET, x: 74, y: 54, size: 40 },
      ],
    },
  ],

  // SREBF1 — 지질 합성 총감독
  lipidboss: [
    {
      caption: "영양이 넘치면 SREBP-1이 활성화돼요",
      actors: [
        { id: "food", emoji: "🍔", x: 26, y: 38, size: 30 },
        { id: "srebp", label: "SREBP", color: INDIGO, x: 62, y: 54, size: 46 },
      ],
    },
    {
      caption: "핵으로 들어가 지방 합성 유전자들을 한꺼번에 켜요",
      actors: [
        { id: "dna", emoji: "🧬", x: 44, y: 54, size: 56 },
        { id: "srebp", label: "SREBP", color: INDIGO, x: 44, y: 54, size: 32 },
        { id: "on", emoji: "💡", x: 76, y: 40, size: 30 },
      ],
    },
    {
      caption: "지방 공장이 통째로 가동돼요 🏭",
      actors: [
        { id: "factory", emoji: "🏭", x: 48, y: 50, size: 52 },
        { id: "fat", emoji: "🧈", x: 78, y: 56, size: 28 },
      ],
    },
  ],

  // FASN — 지방산 조립 라인
  assemblyline: [
    {
      caption: "당에서 얻은 재료(아세틸-CoA)가 들어와요",
      actors: [
        { id: "c1", label: "C₂", color: SKY, x: 24, y: 40, size: 24 },
        { id: "c2", label: "C₂", color: SKY, x: 36, y: 58, size: 24 },
        { id: "fasn", label: "FASN", color: INDIGO, x: 70, y: 52, size: 48 },
      ],
    },
    {
      caption: "FASN 조립 라인이 탄소를 두 개씩 이어 붙여요",
      actors: [
        { id: "fasn", label: "FASN", color: INDIGO, x: 44, y: 52, size: 48 },
        { id: "chain", emoji: "🔗", x: 72, y: 46, size: 32 },
      ],
    },
    {
      caption: "지방산이 완성돼 에너지로 저장돼요 🧈",
      actors: [
        { id: "fat", emoji: "🧈", x: 50, y: 48, size: 44 },
        { id: "store", emoji: "📦", x: 78, y: 58, size: 30 },
      ],
    },
  ],

  // HMGCR — 콜레스테롤 합성의 속도 밸브
  valve: [
    {
      caption: "HMGCR은 콜레스테롤 합성 라인의 '속도 조절 밸브'예요",
      actors: [
        { id: "hmg", label: "HMGCR", color: INDIGO, x: 50, y: 54, size: 50 },
        { id: "chol", emoji: "🧈", x: 78, y: 44, size: 28 },
      ],
    },
    {
      caption: "스타틴 약이 이 밸브를 잠가요 💊",
      actors: [
        { id: "hmg", label: "HMGCR", color: "#64748b", x: 46, y: 54, size: 48 },
        { id: "statin", emoji: "💊", x: 46, y: 34, size: 30 },
      ],
    },
    {
      caption: "콜레스테롤 생산이 줄어 혈중 수치가 낮아져요 🔻",
      actors: [
        { id: "down", emoji: "📉", x: 52, y: 48, size: 44 },
        { id: "chol", emoji: "🧈", x: 80, y: 58, size: 22 },
      ],
    },
  ],

  // LDLR — 혈중 LDL을 낚아채는 수용체
  catcher: [
    {
      caption: "혈액에 LDL 콜레스테롤이 떠다녀요",
      actors: [
        { id: "ldl", label: "LDL", color: AMBER, x: 26, y: 38, size: 30 },
        { id: "ldl2", label: "LDL", color: AMBER, x: 40, y: 60, size: 26 },
        { id: "rec", label: "LDLR", color: INDIGO, x: 74, y: 50, size: 46 },
      ],
    },
    {
      caption: "LDLR 수용체가 LDL을 낚아채요",
      actors: [
        { id: "rec", label: "LDLR", color: INDIGO, x: 50, y: 54, size: 46 },
        { id: "ldl", label: "LDL", color: AMBER, x: 50, y: 34, size: 28 },
      ],
    },
    {
      caption: "간으로 끌어들여 치워요. 고장 나면 혈액에 쌓여요 ⚠️",
      actors: [
        { id: "liver", emoji: "🫀", x: 40, y: 52, size: 44 },
        { id: "in", emoji: "➡️", x: 64, y: 46, size: 28 },
        { id: "warn", emoji: "⚠️", x: 84, y: 56, size: 28 },
      ],
    },
  ],

  // PPARA — 지방을 태우라고 지시하는 감독
  burner: [
    {
      caption: "굶거나 지방이 많아지면 PPARα가 켜져요",
      actors: [
        { id: "fat", emoji: "🧈", x: 26, y: 40, size: 28 },
        { id: "ppar", label: "PPARα", color: INDIGO, x: 62, y: 54, size: 48 },
      ],
    },
    {
      caption: "핵에서 '지방을 태우라'는 유전자들을 켜요",
      actors: [
        { id: "dna", emoji: "🧬", x: 44, y: 54, size: 54 },
        { id: "ppar", label: "PPARα", color: INDIGO, x: 44, y: 54, size: 32 },
      ],
    },
    {
      caption: "지방산이 연료로 연소돼요 🔥",
      actors: [
        { id: "fire", emoji: "🔥", x: 50, y: 48, size: 46 },
        { id: "energy", emoji: "🔋", x: 78, y: 56, size: 30 },
      ],
    },
  ],

  // NR1I2 — 이물질 경비원 (PXR)
  guard: [
    {
      caption: "낯선 약물·독소가 간세포에 들어와요",
      actors: [
        { id: "drug", emoji: "💊", x: 26, y: 38, size: 28 },
        { id: "tox", emoji: "☠️", x: 38, y: 60, size: 26 },
        { id: "pxr", label: "PXR", color: INDIGO, x: 72, y: 50, size: 46 },
      ],
    },
    {
      caption: "PXR 경비원이 위험 물질을 감지해요 👮",
      actors: [
        { id: "pxr", label: "PXR", color: INDIGO, x: 48, y: 52, size: 48 },
        { id: "drug", emoji: "💊", x: 48, y: 34, size: 24 },
        { id: "eye", emoji: "👮", x: 78, y: 46, size: 32 },
      ],
    },
    {
      caption: "해독 효소들을 대량으로 켜서 내보낼 준비를 해요 🚨",
      actors: [
        { id: "alarm", emoji: "🚨", x: 34, y: 40, size: 32 },
        { id: "cyp1", label: "CYP", color: VIOLET, x: 60, y: 56, size: 36 },
        { id: "cyp2", label: "CYP", color: VIOLET, x: 80, y: 44, size: 32 },
      ],
    },
  ],

  // CYP2E1 — 알코올 분해 효소
  alcohol: [
    {
      caption: "알코올이 간세포에 들어와요 🍺",
      actors: [
        { id: "beer", emoji: "🍺", x: 26, y: 40, size: 32 },
        { id: "cyp", label: "CYP2E1", color: INDIGO, x: 64, y: 54, size: 48 },
      ],
    },
    {
      caption: "CYP2E1이 알코올을 분해해요",
      actors: [
        { id: "cyp", label: "CYP2E1", color: INDIGO, x: 46, y: 54, size: 46 },
        { id: "p1", emoji: "🧩", x: 70, y: 42, size: 24 },
        { id: "p2", emoji: "🧩", x: 80, y: 60, size: 22 },
      ],
    },
    {
      caption: "이때 활성산소가 생겨, 과음하면 간이 다쳐요 ⚠️",
      actors: [
        { id: "ros", emoji: "💥", x: 44, y: 44, size: 36 },
        { id: "liver", emoji: "🫀", x: 70, y: 56, size: 40 },
        { id: "warn", emoji: "⚠️", x: 86, y: 36, size: 26 },
      ],
    },
  ],

  // ═══════════════ 폐 (Lung) ═══════════════

  // ABCA3 — 표면활성물질 지질 운반 펌프
  lipidcargo: [
    {
      caption: "표면활성물질의 지질 재료가 만들어져요",
      actors: [
        { id: "lip", emoji: "🧈", x: 26, y: 40, size: 28 },
        { id: "abca", label: "ABCA3", color: INDIGO, x: 64, y: 54, size: 46 },
      ],
    },
    {
      caption: "ABCA3 펌프가 지질을 저장 창고(판층소체)로 옮겨요",
      actors: [
        { id: "abca", label: "ABCA3", color: INDIGO, x: 42, y: 54, size: 44 },
        { id: "lip", emoji: "🧈", x: 62, y: 44, size: 24 },
        { id: "box", emoji: "📦", x: 82, y: 54, size: 38 },
      ],
    },
    {
      caption: "폐포에 분비될 표면활성물질이 채워져요 🫧",
      actors: [
        { id: "box", emoji: "📦", x: 38, y: 50, size: 40 },
        { id: "alv", emoji: "🫧", x: 70, y: 50, size: 50 },
      ],
    },
  ],

  // SFTPC — 지질막을 안정화하는 작은 소수성 단백
  spc: [
    {
      caption: "SP-C는 아주 작고 기름을 좋아하는 단백질이에요",
      actors: [
        { id: "spc", label: "SP-C", color: INDIGO, x: 36, y: 48, size: 34 },
        { id: "lip", emoji: "🧈", x: 66, y: 54, size: 34 },
      ],
    },
    {
      caption: "지질막 사이에 쏙 끼어 막을 단단히 붙들어요",
      actors: [
        { id: "alv", emoji: "🫧", x: 52, y: 52, size: 62 },
        { id: "spc", label: "SP-C", color: INDIGO, x: 52, y: 52, size: 28 },
      ],
    },
    {
      caption: "폐포 표면장력이 낮게 유지돼요 🫧",
      actors: [
        { id: "alv", emoji: "🫧", x: 46, y: 52, size: 64 },
        { id: "ok", emoji: "💚", x: 78, y: 38, size: 30 },
      ],
    },
  ],

  // SFTPA1 — 폐의 선천 면역 파수꾼
  sentry: [
    {
      caption: "세균·바이러스가 폐포에 들어와요",
      actors: [
        { id: "bug", emoji: "🦠", x: 26, y: 38, size: 30 },
        { id: "spa", label: "SP-A", color: INDIGO, x: 62, y: 54, size: 44 },
      ],
    },
    {
      caption: "SP-A가 침입자를 붙잡아 '먹어도 좋다'고 표시해요",
      actors: [
        { id: "spa", label: "SP-A", color: INDIGO, x: 46, y: 52, size: 44 },
        { id: "bug", emoji: "🦠", x: 46, y: 34, size: 24 },
        { id: "tag", emoji: "🏷️", x: 72, y: 44, size: 28 },
      ],
    },
    {
      caption: "대식세포가 표시된 침입자를 삼켜요 🛡️",
      actors: [
        { id: "mac", emoji: "🛡️", x: 56, y: 50, size: 46 },
        { id: "bug", emoji: "🦠", x: 82, y: 58, size: 20 },
      ],
    },
  ],

  // VHL — HIF에 분해 딱지를 붙이는 청소부
  tagger: [
    {
      caption: "산소가 충분하면 VHL이 HIF-1α를 찾아내요",
      actors: [
        { id: "o2", label: "O₂", color: SKY, x: 24, y: 36, size: 28 },
        { id: "vhl", label: "VHL", color: INDIGO, x: 50, y: 54, size: 42 },
        { id: "hif", label: "HIF", color: VIOLET, x: 76, y: 48, size: 38 },
      ],
    },
    {
      caption: "HIF에 '분해 딱지'를 붙여요 🏷️",
      actors: [
        { id: "vhl", label: "VHL", color: INDIGO, x: 42, y: 54, size: 40 },
        { id: "hif", label: "HIF", color: VIOLET, x: 64, y: 52, size: 38 },
        { id: "tag", emoji: "🏷️", x: 64, y: 32, size: 26 },
      ],
    },
    {
      caption: "HIF가 분해돼요. 이 청소부가 망가지면 혈관종양이 생겨요 ⚠️",
      actors: [
        { id: "gone", emoji: "💨", x: 46, y: 46, size: 36 },
        { id: "warn", emoji: "⚠️", x: 76, y: 52, size: 30 },
      ],
    },
  ],

  // VEGFA — 새 혈관을 만들라는 성장 신호
  angio: [
    {
      caption: "저산소 경보(HIF)가 켜지면 VEGF가 분비돼요",
      actors: [
        { id: "hif", label: "HIF", color: VIOLET, x: 26, y: 40, size: 34 },
        { id: "vegf", label: "VEGF", color: INDIGO, x: 60, y: 54, size: 42 },
      ],
    },
    {
      caption: "혈관 내피세포가 이 신호를 받아요 📡",
      actors: [
        { id: "vegf", label: "VEGF", color: INDIGO, x: 40, y: 46, size: 36 },
        { id: "rec", emoji: "📡", x: 70, y: 54, size: 42 },
      ],
    },
    {
      caption: "산소가 모자란 곳으로 새 혈관이 자라나요 🌱",
      actors: [
        { id: "grow", emoji: "🌱", x: 44, y: 50, size: 44 },
        { id: "blood", emoji: "🩸", x: 74, y: 46, size: 32 },
      ],
    },
  ],

  // IL4 — 제2형(알레르기) 면역의 지휘자
  th2: [
    {
      caption: "Th2 면역세포가 IL-4를 뿜어요",
      actors: [
        { id: "th2", emoji: "🧫", x: 28, y: 46, size: 38 },
        { id: "il4", label: "IL-4", color: INDIGO, x: 60, y: 52, size: 38 },
      ],
    },
    {
      caption: "다른 면역세포들을 알레르기 반응 쪽으로 몰아가요",
      actors: [
        { id: "il4", label: "IL-4", color: INDIGO, x: 38, y: 48, size: 34 },
        { id: "c1", emoji: "🧫", x: 66, y: 38, size: 28 },
        { id: "c2", emoji: "🧫", x: 76, y: 60, size: 28 },
      ],
    },
    {
      caption: "제2형 면역이 켜져 천식의 밑바탕이 만들어져요",
      actors: [
        { id: "lung", emoji: "🫁", x: 50, y: 50, size: 52 },
        { id: "warn", emoji: "⚠️", x: 80, y: 38, size: 28 },
      ],
    },
  ],

  // IL13 — 천식의 주동자 사이토카인
  asthma: [
    {
      caption: "IL-13이 기도 점막을 직접 자극해요",
      actors: [
        { id: "il13", label: "IL-13", color: INDIGO, x: 30, y: 42, size: 38 },
        { id: "airway", emoji: "🫁", x: 66, y: 54, size: 48 },
      ],
    },
    {
      caption: "점액 분비와 기도 과민반응이 늘어요",
      actors: [
        { id: "airway", emoji: "🫁", x: 44, y: 52, size: 48 },
        { id: "mucus", emoji: "💧", x: 70, y: 40, size: 28 },
        { id: "mucus2", emoji: "💧", x: 80, y: 58, size: 24 },
      ],
    },
    {
      caption: "기도가 좁아져 숨이 쌕쌕거려요 😮‍💨",
      actors: [
        { id: "narrow", emoji: "😮‍💨", x: 52, y: 50, size: 52 },
      ],
    },
  ],

  // MUC5AC — 기도 점액의 끈끈한 젤
  mucus: [
    {
      caption: "기도 배상세포가 뮤신을 뿜어요",
      actors: [
        { id: "cell", emoji: "🧫", x: 28, y: 46, size: 36 },
        { id: "muc", label: "MUC", color: INDIGO, x: 60, y: 52, size: 36 },
      ],
    },
    {
      caption: "물을 머금고 부풀어 끈끈한 젤이 돼요",
      actors: [
        { id: "gel", emoji: "🫧", x: 48, y: 52, size: 56 },
        { id: "w", emoji: "💧", x: 76, y: 42, size: 26 },
      ],
    },
    {
      caption: "이물질을 붙잡아 내보내요. 천식에선 과다 분비돼 기도를 막아요 ⚠️",
      actors: [
        { id: "gel", emoji: "🫧", x: 40, y: 52, size: 50 },
        { id: "dust", emoji: "🦠", x: 40, y: 52, size: 20 },
        { id: "warn", emoji: "⚠️", x: 76, y: 42, size: 30 },
      ],
    },
  ],

  // ═══════════════ 신장 (Kidney) ═══════════════

  // AGT — 혈압 연쇄반응의 원료
  substrate: [
    {
      caption: "간이 안지오텐시노겐을 혈액에 늘 흘려보내요 (원료)",
      actors: [
        { id: "liver", emoji: "🏭", x: 26, y: 46, size: 40 },
        { id: "agt", label: "AGT", color: "#64748b", x: 62, y: 52, size: 44 },
      ],
    },
    {
      caption: "레닌이 이 원료를 싹둑 잘라요 ✂️",
      actors: [
        { id: "ren", label: "REN", color: INDIGO, x: 30, y: 42, size: 36 },
        { id: "agt", label: "AGT", color: "#64748b", x: 58, y: 54, size: 44 },
        { id: "cut", emoji: "✂️", x: 80, y: 42, size: 30 },
      ],
    },
    {
      caption: "안지오텐신 I이 만들어지며 혈압 조절이 시작돼요",
      actors: [
        { id: "ang1", label: "Ang I", color: AMBER, x: 50, y: 50, size: 42 },
        { id: "next", emoji: "➡️", x: 78, y: 50, size: 30 },
      ],
    },
  ],

  // ACE — 안지오텐신 I → II 전환 효소
  converter: [
    {
      caption: "약한 안지오텐신 I이 폐혈관을 지나가요",
      actors: [
        { id: "ang1", label: "Ang I", color: AMBER, x: 28, y: 44, size: 38 },
        { id: "ace", label: "ACE", color: INDIGO, x: 66, y: 54, size: 46 },
      ],
    },
    {
      caption: "ACE가 끝을 잘라 강력한 안지오텐신 II로 바꿔요",
      actors: [
        { id: "ace", label: "ACE", color: INDIGO, x: 44, y: 54, size: 44 },
        { id: "ang2", label: "Ang II", color: RED, x: 74, y: 44, size: 40 },
      ],
    },
    {
      caption: "혈관이 수축하고 혈압이 올라가요. ACE 억제제가 이걸 막아요 💊",
      actors: [
        { id: "bp", emoji: "📈", x: 40, y: 44, size: 36 },
        { id: "pill", emoji: "💊", x: 70, y: 54, size: 34 },
      ],
    },
  ],

  // AGTR1 — 혈압 상승 수용체 (AT1)
  at1: [
    {
      caption: "안지오텐신 II가 AT1 수용체에 도착해요",
      actors: [
        { id: "ang2", label: "Ang II", color: RED, x: 26, y: 38, size: 34 },
        { id: "at1", emoji: "📡", x: 60, y: 56, size: 46 },
      ],
    },
    {
      caption: "수용체가 신호를 세포 안으로 전달해요",
      actors: [
        { id: "at1", emoji: "📡", x: 44, y: 54, size: 44 },
        { id: "ang2", label: "Ang II", color: RED, x: 44, y: 34, size: 28 },
        { id: "arrow", emoji: "➡️", x: 74, y: 50, size: 30 },
      ],
    },
    {
      caption: "혈관이 수축하고 알도스테론이 나와 혈압이 올라가요 📈",
      actors: [
        { id: "vessel", emoji: "🩸", x: 34, y: 50, size: 34 },
        { id: "aldo", label: "알도", color: AMBER, x: 60, y: 56, size: 36 },
        { id: "bp", emoji: "📈", x: 82, y: 40, size: 32 },
      ],
    },
  ],

  // NR3C2 — 나트륨 재흡수 지휘 수용체 (MR)
  mr: [
    {
      caption: "알도스테론이 MR 수용체에 결합해요",
      actors: [
        { id: "aldo", label: "알도", color: AMBER, x: 26, y: 40, size: 32 },
        { id: "mr", label: "MR", color: INDIGO, x: 62, y: 54, size: 46 },
      ],
    },
    {
      caption: "핵으로 들어가 나트륨 재흡수 유전자를 켜요",
      actors: [
        { id: "dna", emoji: "🧬", x: 46, y: 54, size: 54 },
        { id: "mr", label: "MR", color: INDIGO, x: 46, y: 54, size: 30 },
        { id: "on", emoji: "💡", x: 78, y: 40, size: 30 },
      ],
    },
    {
      caption: "나트륨과 물이 다시 흡수돼 혈압이 올라가요 📈",
      actors: [
        { id: "na", label: "Na", color: SKY, x: 36, y: 50, size: 28 },
        { id: "w", emoji: "💧", x: 58, y: 56, size: 28 },
        { id: "bp", emoji: "📈", x: 80, y: 42, size: 32 },
      ],
    },
  ],

  // SGK1 — MR의 명령을 실행하는 중간 관리자
  middleman: [
    {
      caption: "MR의 명령으로 SGK1이 만들어져요",
      actors: [
        { id: "mr", label: "MR", color: VIOLET, x: 26, y: 40, size: 34 },
        { id: "sgk", label: "SGK1", color: INDIGO, x: 62, y: 54, size: 46 },
      ],
    },
    {
      caption: "SGK1이 나트륨 통로에 인산기(P)를 붙여요",
      actors: [
        { id: "sgk", label: "SGK1", color: INDIGO, x: 38, y: 52, size: 42 },
        { id: "enac", label: "ENaC", color: "#64748b", x: 70, y: 56, size: 44 },
        { id: "p", label: "P", color: AMBER, x: 70, y: 36, size: 24 },
      ],
    },
    {
      caption: "통로가 세포막에 더 오래 머물러 나트륨을 더 흡수해요",
      actors: [
        { id: "enac", label: "ENaC", color: GREEN, x: 44, y: 54, size: 46 },
        { id: "na", label: "Na", color: SKY, x: 72, y: 44, size: 26 },
      ],
    },
  ],

  // SCNN1A — 상피 나트륨 통로 (ENaC)
  enac: [
    {
      caption: "SGK1 신호로 ENaC 통로가 세포막에 자리 잡아요",
      actors: [
        { id: "sgk", label: "SGK1", color: VIOLET, x: 26, y: 38, size: 32 },
        { id: "enac", label: "ENaC", color: INDIGO, x: 60, y: 56, size: 48 },
      ],
    },
    {
      caption: "나트륨이 통로를 타고 세포 안으로 들어와요",
      actors: [
        { id: "enac", label: "ENaC", color: INDIGO, x: 46, y: 54, size: 48 },
        { id: "na", label: "Na", color: SKY, x: 46, y: 32, size: 26 },
        { id: "na2", label: "Na", color: SKY, x: 72, y: 44, size: 22 },
      ],
    },
    {
      caption: "물이 따라 들어와 체액량과 혈압이 올라가요 💧",
      actors: [
        { id: "w", emoji: "💧", x: 44, y: 48, size: 36 },
        { id: "bp", emoji: "📈", x: 74, y: 48, size: 34 },
      ],
    },
  ],

  // AVPR2 — 신장의 V2 수용체
  v2: [
    {
      caption: "몸에 물이 부족하면 바소프레신이 분비돼요",
      actors: [
        { id: "dry", emoji: "🏜️", x: 26, y: 40, size: 32 },
        { id: "avp", label: "AVP", color: SKY, x: 58, y: 50, size: 34 },
      ],
    },
    {
      caption: "집합관의 V2 수용체가 이를 받아요 📡",
      actors: [
        { id: "rec", emoji: "📡", x: 50, y: 56, size: 46 },
        { id: "avp", label: "AVP", color: SKY, x: 50, y: 34, size: 28 },
      ],
    },
    {
      caption: "'물을 아껴라' 신호가 세포 안으로 전달돼요 (→ AQP2)",
      actors: [
        { id: "rec", emoji: "📡", x: 34, y: 54, size: 40 },
        { id: "arrow", emoji: "➡️", x: 58, y: 50, size: 28 },
        { id: "aqp", label: "AQP2", color: INDIGO, x: 82, y: 52, size: 40 },
      ],
    },
  ],

  // NPHS1 — 여과막의 지퍼 (네프린)
  zipper: [
    {
      caption: "족세포의 발돌기들이 서로 마주 봐요",
      actors: [
        { id: "f1", label: "발", color: VIOLET, x: 30, y: 52, size: 40 },
        { id: "f2", label: "발", color: VIOLET, x: 70, y: 52, size: 40 },
      ],
    },
    {
      caption: "네프린이 맞물려 지퍼처럼 촘촘한 틈을 만들어요",
      actors: [
        { id: "f1", label: "발", color: VIOLET, x: 36, y: 52, size: 40 },
        { id: "f2", label: "발", color: VIOLET, x: 64, y: 52, size: 40 },
        { id: "zip", label: "네프린", color: INDIGO, x: 50, y: 52, size: 34 },
      ],
    },
    {
      caption: "물은 통과, 단백질은 못 새게 막아요 🚧",
      actors: [
        { id: "zip", label: "네프린", color: INDIGO, x: 46, y: 52, size: 34 },
        { id: "w", emoji: "💧", x: 46, y: 24, size: 24 },
        { id: "prot", emoji: "🚧", x: 76, y: 50, size: 32 },
      ],
    },
  ],

  // NPHS2 — 네프린을 붙드는 받침대 (포도신)
  anchor: [
    {
      caption: "네프린이 세포막에서 흔들려요",
      actors: [
        { id: "nep", label: "네프린", color: VIOLET, x: 46, y: 42, size: 38 },
        { id: "pod", label: "포도신", color: INDIGO, x: 74, y: 56, size: 40 },
      ],
    },
    {
      caption: "포도신이 네프린을 제자리에 붙들어 줘요 ⚓",
      actors: [
        { id: "nep", label: "네프린", color: VIOLET, x: 50, y: 40, size: 38 },
        { id: "pod", label: "포도신", color: INDIGO, x: 50, y: 60, size: 40 },
        { id: "anc", emoji: "⚓", x: 78, y: 50, size: 30 },
      ],
    },
    {
      caption: "고장 나면 여과막이 무너져 단백뇨가 생겨요 ⚠️",
      actors: [
        { id: "broken", emoji: "💥", x: 44, y: 48, size: 38 },
        { id: "warn", emoji: "⚠️", x: 74, y: 52, size: 32 },
      ],
    },
  ],

  // PODXL — 음전하 코팅으로 밀어내기
  repel: [
    {
      caption: "족세포 발돌기가 서로 달라붙으려 해요",
      actors: [
        { id: "f1", label: "발", color: VIOLET, x: 42, y: 52, size: 40 },
        { id: "f2", label: "발", color: VIOLET, x: 58, y: 52, size: 40 },
      ],
    },
    {
      caption: "포도칼릭신이 표면을 음전하(−)로 코팅해요",
      actors: [
        { id: "f1", label: "−", color: INDIGO, x: 34, y: 52, size: 42 },
        { id: "f2", label: "−", color: INDIGO, x: 66, y: 52, size: 42 },
      ],
    },
    {
      caption: "같은 전하끼리 밀어내 여과 틈이 열린 채 유지돼요 ⚡",
      actors: [
        { id: "f1", label: "−", color: INDIGO, x: 26, y: 52, size: 40 },
        { id: "spark", emoji: "⚡", x: 50, y: 50, size: 30 },
        { id: "f2", label: "−", color: INDIGO, x: 74, y: 52, size: 40 },
      ],
    },
  ],

  // ═══════════════ 췌장 (Pancreas) ═══════════════

  // ABCC8 — K-ATP 통로의 조절 손잡이 (SUR1)
  sur1: [
    {
      caption: "SUR1이 세포 안 ATP(에너지) 신호를 읽어요",
      actors: [
        { id: "atp", emoji: "🔋", x: 26, y: 40, size: 30 },
        { id: "sur", label: "SUR1", color: INDIGO, x: 62, y: 54, size: 48 },
      ],
    },
    {
      caption: "혈당이 오르면 ATP가 늘고, SUR1이 통로를 닫으라 명령해요",
      actors: [
        { id: "sur", label: "SUR1", color: INDIGO, x: 42, y: 54, size: 46 },
        { id: "kir", label: "Kir6.2", color: VIOLET, x: 72, y: 54, size: 42 },
        { id: "close", emoji: "🔒", x: 72, y: 32, size: 26 },
      ],
    },
    {
      caption: "당뇨약 설포닐우레아도 여기 붙어 통로를 닫아요 💊",
      actors: [
        { id: "sur", label: "SUR1", color: INDIGO, x: 46, y: 54, size: 46 },
        { id: "pill", emoji: "💊", x: 46, y: 32, size: 28 },
        { id: "ins", emoji: "💉", x: 78, y: 50, size: 32 },
      ],
    },
  ],

  // KCNJ11 — K-ATP 통로의 실제 칼륨 문 (Kir6.2)
  kir: [
    {
      caption: "평소엔 Kir6.2 칼륨 문이 열려 있어요",
      actors: [
        { id: "kir", label: "Kir6.2", color: INDIGO, x: 50, y: 54, size: 50 },
        { id: "k", label: "K", color: SKY, x: 76, y: 40, size: 24 },
      ],
    },
    {
      caption: "혈당이 오르면 문이 닫히고 세포가 흥분해요 ⚡",
      actors: [
        { id: "kir", label: "Kir6.2", color: INDIGO, x: 42, y: 54, size: 48 },
        { id: "lock", emoji: "🔒", x: 42, y: 32, size: 26 },
        { id: "spark", emoji: "⚡", x: 74, y: 48, size: 32 },
      ],
    },
    {
      caption: "인슐린이 쏟아져 나와요 💉",
      actors: [
        { id: "ins", emoji: "💉", x: 48, y: 48, size: 44 },
        { id: "h", emoji: "💊", x: 78, y: 58, size: 26 },
      ],
    },
  ],

  // PRSS1 — 트립신 (소화효소의 대장)
  trypsin: [
    {
      caption: "트립시노겐(잠긴 원본)이 췌장에서 장으로 나가요",
      actors: [
        { id: "pro", label: "원본", color: "#64748b", x: 34, y: 50, size: 44 },
        { id: "gut", emoji: "➡️", x: 68, y: 50, size: 30 },
      ],
    },
    {
      caption: "장에서 잘려 활성 트립신이 돼요 ✂️",
      actors: [
        { id: "tryp", label: "트립신", color: INDIGO, x: 46, y: 52, size: 46 },
        { id: "cut", emoji: "✂️", x: 76, y: 44, size: 32 },
      ],
    },
    {
      caption: "다른 소화효소들까지 깨워요. 췌장 안에서 켜지면 췌장염 ⚠️",
      actors: [
        { id: "tryp", label: "트립신", color: INDIGO, x: 34, y: 50, size: 40 },
        { id: "e1", emoji: "⚙️", x: 60, y: 42, size: 28 },
        { id: "e2", emoji: "⚙️", x: 68, y: 62, size: 26 },
        { id: "warn", emoji: "⚠️", x: 86, y: 40, size: 28 },
      ],
    },
  ],

  // PNLIP — 지방 가위
  fatscissors: [
    {
      caption: "음식 속 지방(중성지방) 방울이 들어와요",
      actors: [
        { id: "fat", emoji: "🧈", x: 28, y: 42, size: 34 },
        { id: "lip", label: "리파아제", color: INDIGO, x: 66, y: 54, size: 48 },
      ],
    },
    {
      caption: "리파아제가 지방을 싹둑 잘라요 ✂️",
      actors: [
        { id: "lip", label: "리파아제", color: INDIGO, x: 44, y: 54, size: 46 },
        { id: "cut", emoji: "✂️", x: 70, y: 42, size: 30 },
        { id: "p1", emoji: "🧩", x: 82, y: 58, size: 24 },
      ],
    },
    {
      caption: "흡수 가능한 조각이 돼요. 오를리스타트가 이 효소를 막아요 💊",
      actors: [
        { id: "p1", emoji: "🧩", x: 40, y: 46, size: 26 },
        { id: "p2", emoji: "🧩", x: 54, y: 60, size: 24 },
        { id: "pill", emoji: "💊", x: 80, y: 44, size: 32 },
      ],
    },
  ],

  // AMY2A — 탄수화물 가위
  starch: [
    {
      caption: "녹말(긴 탄수화물 사슬)이 들어와요",
      actors: [
        { id: "st", emoji: "🍚", x: 28, y: 42, size: 34 },
        { id: "amy", label: "아밀레이스", color: INDIGO, x: 66, y: 54, size: 50 },
      ],
    },
    {
      caption: "아밀레이스가 사슬을 잘게 잘라요 ✂️",
      actors: [
        { id: "amy", label: "아밀레이스", color: INDIGO, x: 44, y: 54, size: 48 },
        { id: "cut", emoji: "✂️", x: 72, y: 42, size: 30 },
      ],
    },
    {
      caption: "작은 당으로 바뀌어 소장에서 최종 소화돼요 🍬",
      actors: [
        { id: "s1", emoji: "🍬", x: 42, y: 44, size: 26 },
        { id: "s2", emoji: "🍬", x: 58, y: 60, size: 24 },
        { id: "s3", emoji: "🍬", x: 74, y: 42, size: 24 },
      ],
    },
  ],

  // ═══════════════ 위 (Stomach) ═══════════════

  // ATP4A — 위산을 뿜는 양성자 펌프
  protonpump: [
    {
      caption: "벽세포가 위산을 만들 준비를 해요",
      actors: [
        { id: "cell", emoji: "🧫", x: 28, y: 46, size: 38 },
        { id: "pump", label: "H⁺ 펌프", color: INDIGO, x: 66, y: 54, size: 48 },
      ],
    },
    {
      caption: "펌프가 수소이온(H⁺)을 위 안으로 퍼내요",
      actors: [
        { id: "pump", label: "H⁺ 펌프", color: INDIGO, x: 42, y: 54, size: 46 },
        { id: "h1", label: "H⁺", color: RED, x: 68, y: 42, size: 24 },
        { id: "h2", label: "H⁺", color: RED, x: 80, y: 58, size: 22 },
      ],
    },
    {
      caption: "강한 산성이 만들어져요. PPI 약이 이 펌프를 잠가요 💊",
      actors: [
        { id: "acid", emoji: "🧪", x: 44, y: 48, size: 42 },
        { id: "pill", emoji: "💊", x: 74, y: 50, size: 34 },
      ],
    },
  ],

  // KCNQ1 — 칼륨 재공급 통로
  krecycle: [
    {
      caption: "양성자 펌프가 위산을 만들려면 칼륨(K⁺)이 계속 필요해요",
      actors: [
        { id: "pump", label: "H⁺ 펌프", color: VIOLET, x: 36, y: 54, size: 44 },
        { id: "k", label: "K⁺", color: SKY, x: 68, y: 44, size: 28 },
      ],
    },
    {
      caption: "KCNQ1이 칼륨을 위 내강으로 다시 대줘요",
      actors: [
        { id: "kq", label: "KCNQ1", color: INDIGO, x: 44, y: 54, size: 48 },
        { id: "k", label: "K⁺", color: SKY, x: 72, y: 44, size: 26 },
      ],
    },
    {
      caption: "펌프가 멈추지 않고 계속 돌아가요 🔁",
      actors: [
        { id: "loop", emoji: "🔁", x: 44, y: 48, size: 40 },
        { id: "acid", emoji: "🧪", x: 76, y: 52, size: 34 },
      ],
    },
  ],

  // PGC — 펩신의 잠긴 원본
  pepsin: [
    {
      caption: "주세포가 펩시노겐(잠긴 원본)을 분비해요",
      actors: [
        { id: "cell", emoji: "🧫", x: 28, y: 46, size: 36 },
        { id: "pro", label: "원본", color: "#64748b", x: 62, y: 52, size: 44 },
      ],
    },
    {
      caption: "강한 위산을 만나면 스스로 잘려 활성 펩신이 돼요",
      actors: [
        { id: "acid", emoji: "🧪", x: 28, y: 40, size: 30 },
        { id: "pep", label: "펩신", color: INDIGO, x: 62, y: 54, size: 46 },
      ],
    },
    {
      caption: "단백질을 잘게 자르기 시작해요 ✂️",
      actors: [
        { id: "pep", label: "펩신", color: INDIGO, x: 38, y: 52, size: 42 },
        { id: "cut", emoji: "✂️", x: 62, y: 44, size: 30 },
        { id: "p1", emoji: "🧩", x: 82, y: 56, size: 24 },
      ],
    },
  ],

  // SLC15A1 — 펩타이드 흡수 통로 (PEPT1)
  peptide: [
    {
      caption: "잘게 잘린 펩타이드 조각이 장 표면에 도착해요",
      actors: [
        { id: "p1", emoji: "🧩", x: 26, y: 40, size: 26 },
        { id: "p2", emoji: "🧩", x: 36, y: 60, size: 24 },
        { id: "pept", label: "PEPT1", color: INDIGO, x: 70, y: 52, size: 46 },
      ],
    },
    {
      caption: "PEPT1이 조각을 세포 안으로 실어 날라요",
      actors: [
        { id: "pept", label: "PEPT1", color: INDIGO, x: 48, y: 52, size: 46 },
        { id: "p1", emoji: "🧩", x: 48, y: 32, size: 24 },
      ],
    },
    {
      caption: "일부 항생제도 이 통로를 타고 흡수돼요 💊",
      actors: [
        { id: "pept", label: "PEPT1", color: INDIGO, x: 40, y: 54, size: 44 },
        { id: "pill", emoji: "💊", x: 70, y: 44, size: 32 },
      ],
    },
  ],

  // ═══════════════ 장 (Intestine) ═══════════════

  // SI — 이당류 가위
  sucrase: [
    {
      caption: "설탕·녹말 조각이 장 표면 융모에 닿아요",
      actors: [
        { id: "sug", emoji: "🍬", x: 28, y: 40, size: 28 },
        { id: "si", label: "SI", color: INDIGO, x: 64, y: 54, size: 48 },
      ],
    },
    {
      caption: "수크레이스-이소말테이스가 이당류를 잘라요 ✂️",
      actors: [
        { id: "si", label: "SI", color: INDIGO, x: 44, y: 54, size: 46 },
        { id: "cut", emoji: "✂️", x: 70, y: 42, size: 30 },
      ],
    },
    {
      caption: "포도당이 되어 흡수 직전 단계로 넘어가요",
      actors: [
        { id: "g1", label: "포도당", color: SKY, x: 42, y: 46, size: 34 },
        { id: "g2", label: "포도당", color: SKY, x: 70, y: 58, size: 32 },
      ],
    },
  ],

  // SLC5A1 — 나트륨·포도당 동반 흡수 펌프 (SGLT1)
  sglt1: [
    {
      caption: "나트륨이 세포 안으로 들어오려 해요",
      actors: [
        { id: "na", label: "Na", color: SKY, x: 26, y: 38, size: 28 },
        { id: "sglt", label: "SGLT1", color: INDIGO, x: 62, y: 54, size: 48 },
      ],
    },
    {
      caption: "SGLT1이 나트륨과 포도당을 '함께' 끌어들여요",
      actors: [
        { id: "sglt", label: "SGLT1", color: INDIGO, x: 48, y: 54, size: 48 },
        { id: "na", label: "Na", color: SKY, x: 36, y: 32, size: 24 },
        { id: "glc", emoji: "🍬", x: 62, y: 32, size: 26 },
      ],
    },
    {
      caption: "경구 수액(ORS)이 설사 탈수에 듣는 이유예요 💧",
      actors: [
        { id: "w", emoji: "💧", x: 44, y: 48, size: 40 },
        { id: "ok", emoji: "💚", x: 74, y: 48, size: 32 },
      ],
    },
  ],

  // SLC2A2 — 포도당 출구 통로 (GLUT2)
  exit: [
    {
      caption: "흡수된 포도당이 세포 안에 모여요",
      actors: [
        { id: "g1", emoji: "🍬", x: 28, y: 42, size: 26 },
        { id: "g2", emoji: "🍬", x: 40, y: 60, size: 24 },
        { id: "glut", label: "GLUT2", color: INDIGO, x: 72, y: 52, size: 46 },
      ],
    },
    {
      caption: "GLUT2가 포도당을 혈액 쪽으로 내보내요",
      actors: [
        { id: "glut", label: "GLUT2", color: INDIGO, x: 48, y: 52, size: 46 },
        { id: "g1", emoji: "🍬", x: 76, y: 44, size: 26 },
      ],
    },
    {
      caption: "온몸으로 실려 나가요 🩸",
      actors: [
        { id: "blood", emoji: "🩸", x: 50, y: 48, size: 44 },
        { id: "g1", emoji: "🍬", x: 78, y: 58, size: 24 },
      ],
    },
  ],

  // WNT3 — 재생 신호물질
  wnt: [
    {
      caption: "장샘 바닥에서 Wnt 신호물질이 분비돼요",
      actors: [
        { id: "niche", emoji: "🏠", x: 28, y: 52, size: 40 },
        { id: "wnt", label: "Wnt", color: SKY, x: 60, y: 48, size: 38 },
      ],
    },
    {
      caption: "줄기세포 표면 수용체에 붙어요 📡",
      actors: [
        { id: "wnt", label: "Wnt", color: SKY, x: 42, y: 38, size: 32 },
        { id: "rec", emoji: "📡", x: 66, y: 56, size: 44 },
      ],
    },
    {
      caption: "'계속 자라라' — 장 상피가 매일 새로 채워져요 🌱",
      actors: [
        { id: "grow", emoji: "🌱", x: 44, y: 50, size: 44 },
        { id: "cell", emoji: "🧫", x: 74, y: 48, size: 32 },
      ],
    },
  ],

  // CTNNB1 — 접착 부품에서 증식 스위치로
  betacatenin: [
    {
      caption: "평소 β-카테닌은 세포끼리 붙이는 접착 부품이에요",
      actors: [
        { id: "c1", emoji: "🧫", x: 32, y: 52, size: 38 },
        { id: "bcat", label: "β", color: AMBER, x: 50, y: 52, size: 30 },
        { id: "c2", emoji: "🧫", x: 68, y: 52, size: 38 },
      ],
    },
    {
      caption: "Wnt 신호가 오면 핵으로 들어가요",
      actors: [
        { id: "wnt", label: "Wnt", color: SKY, x: 24, y: 36, size: 30 },
        { id: "dna", emoji: "🧬", x: 58, y: 54, size: 54 },
        { id: "bcat", label: "β", color: AMBER, x: 58, y: 54, size: 26 },
      ],
    },
    {
      caption: "증식 유전자를 켜요. APC 브레이크가 고장 나면 쌓여서 암이 돼요 ⚠️",
      actors: [
        { id: "bcat", label: "β", color: RED, x: 38, y: 48, size: 32 },
        { id: "myc", label: "MYC", color: VIOLET, x: 64, y: 54, size: 38 },
        { id: "warn", emoji: "⚠️", x: 86, y: 40, size: 28 },
      ],
    },
  ],

  // TCF7L2 — 핵 안의 결재자
  decider: [
    {
      caption: "β-카테닌이 핵 안에 도착해요",
      actors: [
        { id: "bcat", label: "β", color: AMBER, x: 28, y: 42, size: 30 },
        { id: "tcf", label: "TCF7L2", color: INDIGO, x: 64, y: 54, size: 48 },
      ],
    },
    {
      caption: "TCF7L2와 짝을 이뤄 DNA에 앉아요",
      actors: [
        { id: "dna", emoji: "🧬", x: 50, y: 58, size: 54 },
        { id: "tcf", label: "TCF7L2", color: INDIGO, x: 44, y: 42, size: 42 },
        { id: "bcat", label: "β", color: AMBER, x: 68, y: 38, size: 26 },
      ],
    },
    {
      caption: "어떤 유전자를 켤지 결정해요 (제2형 당뇨 위험과도 연관) 📋",
      actors: [
        { id: "tcf", label: "TCF7L2", color: INDIGO, x: 42, y: 52, size: 44 },
        { id: "list", emoji: "📋", x: 72, y: 46, size: 34 },
      ],
    },
  ],

  // KRAS — 켜고 꺼지는 분자 스위치
  gtpase: [
    {
      caption: "성장 신호가 오면 KRAS가 켜져요 (GTP 결합)",
      actors: [
        { id: "sig", label: "신호", color: SKY, x: 26, y: 38, size: 32 },
        { id: "kras", label: "KRAS", color: GREEN, x: 62, y: 54, size: 48 },
      ],
    },
    {
      caption: "신호를 아래로 전달하고, 정상이라면 스스로 꺼져요",
      actors: [
        { id: "kras", label: "KRAS", color: GREEN, x: 38, y: 52, size: 44 },
        { id: "arrow", emoji: "➡️", x: 62, y: 50, size: 28 },
        { id: "off", label: "OFF", color: "#64748b", x: 84, y: 52, size: 38 },
      ],
    },
    {
      caption: "돌연변이로 '켜짐'에 고정되면 멈추지 않고 증식해요 ⚠️",
      actors: [
        { id: "kras", label: "ON", color: RED, x: 40, y: 52, size: 46 },
        { id: "cell", emoji: "🧫", x: 66, y: 42, size: 28 },
        { id: "cell2", emoji: "🧫", x: 76, y: 62, size: 26 },
        { id: "warn", emoji: "⚠️", x: 88, y: 38, size: 26 },
      ],
    },
  ],
};

// 알려지지 않은 애셋(데이터 확장 시 대비)용 한 컷 폴백
export function genericStory(symbol: string): Beat[] {
  return [
    {
      caption: `${symbol}이(가) 세포 안에서 일하는 모습`,
      actors: [
        { id: "cell", emoji: "🔬", x: 26, y: 36, size: 30 },
        { id: "prot", label: symbol, color: INDIGO, x: 56, y: 54, size: 46 },
        { id: "spark", emoji: "✨", x: 78, y: 40, size: 24 },
      ],
    },
  ];
}
