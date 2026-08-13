// 대통령 섹션(소개/지지율/공약) 배경에 쓰는 연한 태극 문양 워터마크.
// 콘텐츠 가독성을 해치지 않도록 아주 낮은 불투명도로만 사용한다.
export function TaegeukWatermark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className="pointer-events-none absolute -top-24 -right-24 h-[380px] w-[380px] opacity-[0.05] sm:h-[520px] sm:w-[520px] dark:opacity-[0.07]"
    >
      <circle cx="100" cy="100" r="100" fill="#C60C30" />
      <path d="M100,0 A50,50 0 0,1 100,100 A50,50 0 0,0 100,200 A100,100 0 0,1 100,0 Z" fill="#003478" />
    </svg>
  );
}
