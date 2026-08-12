export function hasFullAccess(
  tier: string | null | undefined,
  isAdmin: boolean | null | undefined,
  trialExpiresAt?: string | null,
) {
  if (tier === "유료" || !!isAdmin) return true;
  if (trialExpiresAt && new Date(trialExpiresAt).getTime() > Date.now()) return true;
  return false;
}
