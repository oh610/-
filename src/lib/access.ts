export function hasFullAccess(tier: string | null | undefined, isAdmin: boolean | null | undefined) {
  return tier === "유료" || !!isAdmin;
}
