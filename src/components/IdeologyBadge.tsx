export function IdeologyBadge({ ideology }: { ideology: "진보" | "보수" }) {
  return (
    <span
      className={
        ideology === "진보"
          ? "rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
          : "rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
      }
    >
      {ideology}
    </span>
  );
}
