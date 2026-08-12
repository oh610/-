type BillRankItem = {
  id: string;
  title: string;
  assemblyBillId: string | null;
  sub: string;
};

export function BillRankPanel({
  icon,
  heading,
  items,
}: {
  icon: string;
  heading: string;
  items: BillRankItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        <span aria-hidden>{icon}</span> {heading}
      </h2>
      <ol className="flex flex-col gap-1">
        {items.map((b, i) => {
          const inner = (
            <>
              <span className="w-5 shrink-0 text-center text-sm font-bold text-violet-500">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">{b.title}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{b.sub}</p>
              </div>
            </>
          );
          return (
            <li key={b.id}>
              {b.assemblyBillId ? (
                <a
                  href={`https://likms.assembly.go.kr/bill/billDetail.do?billId=${b.assemblyBillId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-lg p-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  {inner}
                </a>
              ) : (
                <div className="flex items-center gap-2.5 rounded-lg p-1.5">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
