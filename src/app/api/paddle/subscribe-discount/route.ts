import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaddleClient } from "@/lib/paddle/server";

const DONATION_PRODUCT_ID = process.env.PADDLE_DONATION_PRODUCT_ID;
const MONTHLY_AMOUNT = 4900;
const DISCOUNT_RATE = 0.2;
const DISCOUNT_MONTHS = 3;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!DONATION_PRODUCT_ID) {
    return NextResponse.json({ error: "구독 상품이 아직 설정되지 않았습니다." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) {
    return NextResponse.json({ error: "쿠폰 코드를 입력해 주세요." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("discount_coupon_code, discount_coupon_redeemed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.discount_coupon_code || profile.discount_coupon_code.toUpperCase() !== code) {
    return NextResponse.json({ error: "유효하지 않은 쿠폰 코드입니다." }, { status: 400 });
  }
  if (profile.discount_coupon_redeemed_at) {
    return NextResponse.json({ error: "이미 사용한 쿠폰입니다." }, { status: 400 });
  }

  const discountedAmount = Math.round(MONTHLY_AMOUNT * (1 - DISCOUNT_RATE));
  const discountUntil = new Date();
  discountUntil.setMonth(discountUntil.getMonth() + DISCOUNT_MONTHS);

  const paddle = getPaddleClient();
  const transaction = await paddle.transactions.create({
    items: [
      {
        price: {
          description: "정론관 월간 구독 (20% 할인, 3개월)",
          unitPrice: { amount: String(discountedAmount), currencyCode: "KRW" },
          billingCycle: { interval: "month", frequency: 1 },
          productId: DONATION_PRODUCT_ID,
        },
        quantity: 1,
      },
    ],
    customData: { userId: user.id, kind: "discount", discountUntil: discountUntil.toISOString() },
  });

  return NextResponse.json({ transactionId: transaction.id });
}
