import "./_env";
import { generateDailySummary } from "@/lib/pipeline/generate-summary";

generateDailySummary().catch((err) => {
  console.error(err);
  process.exit(1);
});
