"use client";

import type { ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function PartyFilter({ parties }: { parties: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const party = searchParams.get("party") ?? "";

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set("party", e.target.value);
    else params.delete("party");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={party}
      onChange={handleChange}
      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <option value="">정당 선택</option>
      {parties.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}
