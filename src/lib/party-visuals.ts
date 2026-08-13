// 정당별 로고 파일(public/party-logos)과 상징색. 로고는 각 정당 공식 사이트 또는
// 위키미디어 공용에 게시된 공식 로고 이미지를 내려받아 자체 호스팅한다.
// 상징색은 국민의힘/더불어민주당/진보당/사회민주당은 공식 로고 이미지의 픽셀에서,
// 개혁신당/조국혁신당은 공식 로고 SVG의 fill 색상에서 직접 추출한 값이다.
// 기본소득당은 로고가 흑백이라 공개적으로 알려진 브랜드 색(민트)을 근사치로 사용한다.
export const PARTY_LOGOS: Record<string, string> = {
  더불어민주당: "/party-logos/더불어민주당.png",
  국민의힘: "/party-logos/국민의힘.png",
  조국혁신당: "/party-logos/조국혁신당.svg",
  진보당: "/party-logos/진보당.png",
  개혁신당: "/party-logos/개혁신당.svg",
  기본소득당: "/party-logos/기본소득당.svg",
  사회민주당: "/party-logos/사회민주당.png",
};

export const PARTY_COLORS: Record<string, string> = {
  더불어민주당: "#152484",
  국민의힘: "#E60024",
  조국혁신당: "#17479E",
  진보당: "#DC1E2E",
  개혁신당: "#ED6C00",
  기본소득당: "#00C9A6",
  사회민주당: "#F58400",
};

export const INDEPENDENT_COLOR = "#A1A1AA";

export function getPartyLogo(name: string): string | null {
  return PARTY_LOGOS[name] ?? null;
}

export function getPartyColor(name: string): string {
  return PARTY_COLORS[name] ?? "#71717A";
}
