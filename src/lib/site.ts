// 공유 링크·사이트맵에 들어갈 절대 주소.
// 직접 도메인을 연결하면 NEXT_PUBLIC_SITE_URL, 아니면 Vercel이 넣어주는 운영 도메인을 쓴다.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "BioAtlas";
export const SITE_TITLE = "BioAtlas — 분자생물학 3D 지도";
export const SITE_DESCRIPTION =
  "인체에서 유전자까지, 3D 공간으로 연결되는 분자생물학 지도. 장기와 조직을 따라 들어가 패스웨이와 유전자 네트워크를 탐색하세요.";
