import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSummaryCardById } from "@/lib/supabase/queries";

export const alt = "정론관 - 여당·야당 입장을 나란히 비교";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const regular = readFile(join(process.cwd(), "src/assets/fonts/NotoSansKR-Regular.ttf"));
const bold = readFile(join(process.cwd(), "src/assets/fonts/NotoSansKR-Bold.ttf"));

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getSummaryCardById(id);

  const [regularFont, boldFont] = await Promise.all([regular, bold]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0c0a14 0%, #1e1338 60%, #2b1a4d 100%)",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 700, color: "#a78bfa" }}>
          정론<span style={{ color: "#ffffff" }}>관</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: card && card.issueTitle.length > 28 ? 46 : 56,
            fontWeight: 700,
            lineHeight: 1.35,
            color: "#ffffff",
          }}
        >
          {card ? truncate(card.issueTitle, 42) : "오늘의 정치 이슈를 한눈에"}
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 44 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              borderRadius: 20,
              padding: "24px 28px",
              background: "rgba(59,130,246,0.16)",
              border: "1px solid rgba(96,165,250,0.4)",
            }}
          >
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#93c5fd" }}>찬성(여당) 측</div>
            <div style={{ display: "flex", marginTop: 10, fontSize: 22, lineHeight: 1.5, color: "#e5e9f5" }}>
              {card ? truncate(card.proStanceSummary, 60) : "여당의 논리를 확인해 보세요"}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              borderRadius: 20,
              padding: "24px 28px",
              background: "rgba(244,63,94,0.14)",
              border: "1px solid rgba(251,113,133,0.4)",
            }}
          >
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#fda4af" }}>반대(야당) 측</div>
            <div style={{ display: "flex", marginTop: 10, fontSize: 22, lineHeight: 1.5, color: "#e5e9f5" }}>
              {card ? truncate(card.conStanceSummary, 60) : "야당의 논리를 확인해 보세요"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: "auto", fontSize: 22, color: "#b8b0cc" }}>
          {card ? `${card.publishedDate} 발행 · ` : ""}진보·보수 양쪽 입장을 한눈에 · polispoon.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: regularFont, style: "normal", weight: 400 },
        { name: "Noto Sans KR", data: boldFont, style: "normal", weight: 700 },
      ],
    },
  );
}
