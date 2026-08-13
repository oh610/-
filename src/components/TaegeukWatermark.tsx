// 대통령 섹션(소개/지지율/공약) 배경에 쓰는 연한 태극 문양 워터마크.
// 콘텐츠 가독성을 해치지 않도록 아주 낮은 불투명도로만 사용한다.
// 태극 문양 기하는 실제 태극기(위키미디어 공용 Flag_of_South_Korea.svg)의
// 좌표/회전각(rotate 33.69006752598 = atan(2/3))을 그대로 옮겨온 것으로,
// 빨강이 좌상단, 파랑이 우하단에 오는 실제 국기와 동일한 방향이다.
export function TaegeukWatermark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className="pointer-events-none absolute -top-24 -right-24 h-[380px] w-[380px] opacity-[0.05] sm:h-[520px] sm:w-[520px] dark:opacity-[0.07]"
    >
      <g transform="translate(100,100) scale(4.16667) rotate(33.69006752598)">
        <path d="M12 0a18 18 0 11-36 0 24 24 0 1148 0" fill="#CD2E3A" />
        <path d="M-24 0a24 24 0 1048 0A12 12 0 100 0a12 12 0 11-24 0" fill="#0047A0" />
      </g>
    </svg>
  );
}
