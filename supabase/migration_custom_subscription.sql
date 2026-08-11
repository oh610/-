-- 자율금액구독(매달 반복결제, 원하는 금액): subscriptions.plan에 '자율' 값 추가
-- Supabase SQL Editor에서 실행하세요.

alter type subscription_plan add value if not exists '자율';
