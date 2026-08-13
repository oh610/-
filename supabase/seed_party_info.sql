-- 정당별 홈페이지 링크/소개 문구 채우기. migration_party_pages.sql 실행 후 사용하세요.
-- 소개 문구는 창당 시점 등 공개된 사실 정보만 담은 중립적인 한 문장입니다.
-- 새로 원내 진입하는 정당이 생기면 이 파일에 UPDATE 문을 추가해 실행하면 됩니다.

update parties set
  homepage_url = 'https://www.peoplepowerparty.kr/',
  description = '2020년 2월 미래통합당으로 창당해 그해 9월 국민의힘으로 당명을 바꿨습니다.'
where name = '국민의힘';

update parties set
  homepage_url = 'https://theminjoo.kr/',
  description = '2014년 새정치민주연합으로 출범해 2015년 더불어민주당으로 당명을 바꿨습니다.'
where name = '더불어민주당';

update parties set
  homepage_url = 'https://rebuildingkoreaparty.kr/',
  description = '2024년 3월 창당한 정당입니다.'
where name = '조국혁신당';

update parties set
  homepage_url = 'https://www.reformparty.kr/',
  description = '2024년 1월 창당대회를 열고 출범한 정당입니다.'
where name = '개혁신당';

update parties set
  homepage_url = 'https://jinboparty.com/',
  description = '2017년 창당한 정당입니다.'
where name = '진보당';

update parties set
  homepage_url = 'https://basicincomeparty.kr/bikr/',
  description = '2020년 국내 최초로 온라인 창당 방식을 통해 출범한 정당입니다.'
where name = '기본소득당';

update parties set
  homepage_url = 'https://www.samindang.kr/',
  description = '2024년 2월 창당한 정당입니다.'
where name = '사회민주당';
