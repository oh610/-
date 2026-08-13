import "./_env";
import { syncMemberMentions } from "@/lib/pipeline/sync-member-mentions";

syncMemberMentions().catch((err) => {
  console.error(err);
  process.exit(1);
});
