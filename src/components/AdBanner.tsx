"use client";

import { useEffect, useRef } from "react";

export function AdBanner({
  unitId,
  width,
  height,
}: {
  unitId: string;
  width: number;
  height: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unitId);
    ins.setAttribute("data-ad-width", String(width));
    ins.setAttribute("data-ad-height", String(height));
    container.appendChild(ins);

    // 카카오 애드핏은 스크립트 실행 시점에 DOM에 있는 .kakao_ad_area를 스캔하므로
    // ins를 먼저 삽입한 뒤 스크립트를 매번 새로 붙여야 함.
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [unitId, width, height]);

  return <div ref={containerRef} className="flex justify-center" />;
}
