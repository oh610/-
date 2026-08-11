// 열린국회정보 Open API 클라이언트.
// Referer 헤더가 없으면 게이트웨이 WAF가 400 Bad Request로 차단하므로 반드시 포함해야 함.

const BASE_URL = "https://open.assembly.go.kr/portal/openapi";
const CURRENT_MEMBERS_SERVICE_ID = "nwvrqwxyaytdsfvhu"; // 국회의원 인적사항(현직만, 22대 299명)
const BILL_SEARCH_SERVICE_ID = "TVBPMBILL11"; // 의안 통합검색
const PLENARY_VOTE_SERVICE_ID = "nojepdqqaweusdfbi"; // 본회의 표결정보 (BILL_ID 필수)
const CURRENT_AGE = "22";

async function callAssemblyApi<T>(
  serviceId: string,
  params: Record<string, string>,
): Promise<T> {
  const key = process.env.ASSEMBLY_API_KEY;
  if (!key) throw new Error("ASSEMBLY_API_KEY is not set");

  const url = new URL(`${BASE_URL}/${serviceId}`);
  url.searchParams.set("KEY", key);
  url.searchParams.set("Type", "json");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://open.assembly.go.kr/",
    },
  });
  if (!res.ok) throw new Error(`Assembly API request failed: ${res.status}`);
  return res.json();
}

export type AssemblyCurrentMemberRow = {
  HG_NM: string; // 이름
  POLY_NM: string | null; // 정당명
  ORIG_NM: string | null; // 지역구명
  ELECT_GBN_NM: "지역구" | "비례대표" | null;
  MONA_CD: string; // 고유 코드
};

type AssemblyListResponse<TRow> = {
  [serviceId: string]:
    | [{ head: [{ list_total_count: number }, { RESULT: { CODE: string; MESSAGE: string } }] }, { row: TRow[] }]
    | undefined;
};

export async function fetchCurrentMembers(): Promise<AssemblyCurrentMemberRow[]> {
  const data = await callAssemblyApi<AssemblyListResponse<AssemblyCurrentMemberRow>>(
    CURRENT_MEMBERS_SERVICE_ID,
    { pIndex: "1", pSize: "500" },
  );
  return data[CURRENT_MEMBERS_SERVICE_ID]?.[1]?.row ?? [];
}

export type AssemblyBillRow = {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NAME: string;
  PROPOSER: string | null;
  PROPOSER_KIND: string | null;
  PROPOSE_DT: string; // "YYYY-MM-DD"
  RST_MONA_CD: string | null; // 대표발의자 코드
  PROC_RESULT_CD: string | null;
  PASS_GUBUN: string | null;
};

export async function fetchRecentBills(count: number): Promise<AssemblyBillRow[]> {
  const data = await callAssemblyApi<AssemblyListResponse<AssemblyBillRow>>(
    BILL_SEARCH_SERVICE_ID,
    { pIndex: "1", pSize: String(count), AGE: CURRENT_AGE },
  );
  return data[BILL_SEARCH_SERVICE_ID]?.[1]?.row ?? [];
}

export type AssemblyVoteRow = {
  MONA_CD: string;
  RESULT_VOTE_MOD: "찬성" | "반대" | "기권" | "불참";
  VOTE_DATE: string; // "YYYYMMDD HHMMSS"
};

export async function fetchVotesForBill(billId: string): Promise<AssemblyVoteRow[]> {
  const data = await callAssemblyApi<AssemblyListResponse<AssemblyVoteRow>>(
    PLENARY_VOTE_SERVICE_ID,
    { pIndex: "1", pSize: "500", AGE: CURRENT_AGE, BILL_ID: billId },
  );
  return data[PLENARY_VOTE_SERVICE_ID]?.[1]?.row ?? [];
}
