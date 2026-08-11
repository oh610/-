import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaddleClient } from "@/lib/paddle/server";

const DONATION_PRODUCT_ID = process.env.PADDLE_DONATION_PRODUCT_ID;
const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 1000000;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!DONATION_PRODUCT_ID) {
    return NextResponse.json({ error: "후원 상품이 아직 설정되지 않았습니다." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return NextResponse.json(
      {
        error: `후원 금액은 ${MIN_AMOUNT.toLocaleString()}원 이상 ${MAX_AMOUNT.toLocaleString()}원 이하의 정수로 입력해 주세요.`,
      },
      { status: 400 },
    );
  }

  const paddle = getPaddleClient();
  const transaction = await paddle.transactions.create({
    items: [
      {
        price: {
          description: "정치뉴스요약서비스 후원",
          unitPrice: { amount: String(amount), currencyCode: "KRW" },
          productId: DONATION_PRODUCT_ID,
        },
        quantity: 1,
      },
    ],
    customData: { userId: user.id, donorName: user.email ?? "익명" },
  });

  return NextResponse.json({ transactionId: transaction.id });
}
