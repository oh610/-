import "./_env";
import { syncBills } from "@/lib/pipeline/sync-bills";

const billCount = Number(process.argv[2] ?? "100");

syncBills(billCount).catch((err) => {
  console.error(err);
  process.exit(1);
});
