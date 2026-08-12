"use client";

import { useMemo, type ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DistrictOption } from "@/lib/supabase/members";

export function DistrictFilter({ districts }: { districts: DistrictOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const region = searchParams.get("region") ?? "";
  const district = searchParams.get("district") ?? "";

  const regions = useMemo(() => [...new Set(districts.map((d) => d.region))], [districts]);
  const districtsInRegion = useMemo(
    () => districts.filter((d) => d.region === region),
    [districts, region],
  );

  function updateParams(next: { region?: string; district?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.region !== undefined) {
      if (next.region) params.set("region", next.region);
      else params.delete("region");
      params.delete("district");
    }
    if (next.district !== undefined) {
      if (next.district) params.set("district", next.district);
      else params.delete("district");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <select
        value={region}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => updateParams({ region: e.target.value })}
        className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="">시/도 선택</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <select
        value={district}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => updateParams({ district: e.target.value })}
        disabled={!region}
        className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="">{region ? "시군구 선택" : "시/도를 먼저 선택하세요"}</option>
        {districtsInRegion.map((d) => (
          <option key={d.districtName} value={d.districtName}>
            {d.districtLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
