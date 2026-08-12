"use client";

import Link from "next/link";
import { useState } from "react";

type DropdownItem = { label: string; href: string };

function NavDropdown({
  label,
  items,
  align = "left",
}: {
  label: string;
  items: DropdownItem[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex shrink-0 items-center gap-1 text-zinc-300 transition hover:text-violet-400"
      >
        {label}
        <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className={`absolute top-full z-50 pt-3 ${align === "right" ? "right-0" : "left-0"}`}>
          <div className="min-w-[9rem] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 shadow-lg">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm whitespace-nowrap text-zinc-300 transition hover:bg-zinc-800 hover:text-violet-400"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MainNav() {
  return (
    <div className="flex shrink-0 items-center gap-4 text-[13px] whitespace-nowrap sm:gap-6 sm:text-sm">
      <NavDropdown
        label="뉴스 요약"
        items={[
          { label: "오늘 뉴스", href: "/home" },
          { label: "지난 뉴스", href: "/archive" },
        ]}
      />
      <Link href="/members" className="shrink-0 text-zinc-300 transition hover:text-violet-400">
        국회의원 활동
      </Link>
      <Link href="/pricing" className="shrink-0 text-zinc-300 transition hover:text-violet-400">
        구독
      </Link>
      <NavDropdown
        label="문의"
        align="right"
        items={[
          { label: "문의", href: "/contact" },
          { label: "사용 방법", href: "/guide" },
        ]}
      />
    </div>
  );
}
