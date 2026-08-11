import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CONTACT_EMAIL = "dhaostk@gmail.com";

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "이메일 발송이 아직 설정되지 않았습니다." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const title = (body?.title ?? "").trim();
  const content = (body?.content ?? "").trim();
  if (!title || !content) {
    return NextResponse.json({ error: "제목과 내용을 모두 입력해 주세요." }, { status: 400 });
  }
  if (title.length > 200 || content.length > 5000) {
    return NextResponse.json({ error: "제목 또는 내용이 너무 깁니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "정치한스푼 문의 <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      ...(user?.email ? { reply_to: user.email } : {}),
      subject: `[문의] ${title}`,
      text: `${content}\n\n---\n보낸 사람: ${user?.email ?? "비로그인 사용자"}`,
    }),
  });

  if (!res.ok) {
    console.error("[contact] resend error", await res.text());
    return NextResponse.json({ error: "메일 발송에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
