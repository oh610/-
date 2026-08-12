// NAVER API HUB 뉴스 검색.
const ENDPOINT = "https://naverapihub.apigw.ntruss.com/search/v1/news";

export type NaverNewsItem = {
  title: string; // HTML 태그(<b>) 포함
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
};

const HTML_ENTITIES: Record<string, string> = {
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
};

function stripHtml(text: string): string {
  const withoutTags = text.replace(/<[^>]+>/g, "");
  return withoutTags.replace(/&quot;|&apos;|&#39;|&lt;|&gt;|&amp;/g, (m) => HTML_ENTITIES[m]);
}

export async function searchNews(query: string, display = 10): Promise<NaverNewsItem[]> {
  const clientId = process.env.NAVER_NEWS_CLIENT_ID;
  const clientSecret = process.env.NAVER_NEWS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("NAVER_NEWS_CLIENT_ID / NAVER_NEWS_CLIENT_SECRET is not set");
  }

  const url = new URL(ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("display", String(display));
  url.searchParams.set("sort", "date");

  const res = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": clientId,
      "X-NCP-APIGW-API-KEY": clientSecret,
    },
  });
  if (!res.ok) throw new Error(`Naver news search failed: ${res.status}`);

  const data: { items: NaverNewsItem[] } = await res.json();
  return data.items.map((item) => ({
    ...item,
    title: stripHtml(item.title),
    description: stripHtml(item.description),
  }));
}

// 특정 검색어를 언급한 전체 뉴스 건수만 필요할 때(언급량 랭킹 등) 결과 본문 없이 가볍게 조회.
export async function getNewsMentionCount(query: string): Promise<number> {
  const clientId = process.env.NAVER_NEWS_CLIENT_ID;
  const clientSecret = process.env.NAVER_NEWS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("NAVER_NEWS_CLIENT_ID / NAVER_NEWS_CLIENT_SECRET is not set");
  }

  const url = new URL(ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("display", "1");

  const res = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": clientId,
      "X-NCP-APIGW-API-KEY": clientSecret,
    },
  });
  if (!res.ok) throw new Error(`Naver news search failed: ${res.status}`);

  const data: { total: number } = await res.json();
  return data.total;
}
