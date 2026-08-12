import type { MetadataRoute } from "next";
import { getAllSummaryCards } from "@/lib/supabase/queries";
import { searchMembers } from "@/lib/supabase/members";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://polispoon.vercel.app";

const STATIC_PATHS = ["/", "/home", "/archive", "/members", "/pricing", "/guide", "/contact", "/terms", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const [cards, members] = await Promise.all([
    getAllSummaryCards().catch(() => []),
    searchMembers("").catch(() => []),
  ]);

  const cardEntries: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `${SITE_URL}/archive/${card.id}`,
    lastModified: new Date(card.publishedDate),
  }));

  const memberEntries: MetadataRoute.Sitemap = members.map((member) => ({
    url: `${SITE_URL}/members/${member.id}`,
  }));

  return [...staticEntries, ...cardEntries, ...memberEntries];
}
