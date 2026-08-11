-- schema.sql 적용 후 실행. 화면에 표시할 더미 요약카드 1건을 삽입합니다.

insert into summary_cards (
  issue_title,
  issue_summary,
  pro_stance_summary,
  con_stance_summary,
  bias_check_passed,
  published_date
) values (
  '예시 이슈: 국회 본회의 쟁점 법안 처리',
  '이것은 더미 데이터입니다. 실제 서비스에서는 매일 발행되는 정치 이슈 1건이 이 자리에 표시됩니다.',
  '여당 측은 해당 법안이 필요한 이유로 정책 효과와 시급성을 들어 찬성 입장을 밝혔습니다. (더미 텍스트)',
  '야당 측은 절차적 문제와 부작용 우려를 근거로 반대 입장을 밝혔습니다. (더미 텍스트)',
  true,
  '2026-08-10'
);
