import { Rank } from "@/generated/prisma";

/**
 * Rank hierarchy, from highest authority (index 0) to lowest.
 * Mirrors the legacy mock's role dropdown order.
 */
export const RANK_ORDER: Rank[] = [
  Rank.STAFF,
  Rank.GESTOR,
  Rank.SUBGESTOR,
  Rank.SUPERVISOR,
  Rank.ELITE,
  Rank.GRADUADOS,
  Rank.PROBATORIOS,
];

export const RANK_LABELS: Record<Rank, string> = {
  STAFF: "Staff",
  GESTOR: "Gestor",
  SUBGESTOR: "Subgestor",
  SUPERVISOR: "Supervisor",
  ELITE: "Elite ROCAM",
  GRADUADOS: "Graduado",
  PROBATORIOS: "Probatório / Aluno",
};

export const RANK_EMOJI: Record<Rank, string> = {
  STAFF: "👑",
  GESTOR: "⚡",
  SUBGESTOR: "🛡️",
  SUPERVISOR: "🔍",
  ELITE: "⭐",
  GRADUADOS: "🏍️",
  PROBATORIOS: "🔰",
};

/** Lower number == higher authority. */
export function rankWeight(rank: Rank): number {
  const idx = RANK_ORDER.indexOf(rank);
  return idx === -1 ? RANK_ORDER.length : idx;
}

/** True if `rank` has at least the authority of `minimum` (equal or higher). */
export function isAtLeast(rank: Rank, minimum: Rank): boolean {
  return rankWeight(rank) <= rankWeight(minimum);
}

export function isStaff(rank: Rank): boolean {
  return rank === Rank.STAFF;
}

export function isGestorOrSubgestorUp(rank: Rank): boolean {
  return isAtLeast(rank, Rank.SUBGESTOR);
}

/** Alias used where "Subgestor and up" authority is required (e.g. promotion approvals). */
export function isSubgestorUpHelper(rank: Rank): boolean {
  return isAtLeast(rank, Rank.SUBGESTOR);
}

export function isSupervisorUp(rank: Rank): boolean {
  return isAtLeast(rank, Rank.SUPERVISOR);
}

/** True for anyone above a Probatório — used to gate reviewing/scoring PTR
 * evaluations (a Probatório shouldn't be able to score their own or a
 * peer's evaluation). */
export function isGraduadosUp(rank: Rank): boolean {
  return isAtLeast(rank, Rank.GRADUADOS);
}

/**
 * Given a set of Discord role IDs a member has, and the configured
 * ROLE_ID_MAP (discord role id -> Rank), returns the highest-ranked
 * matching Rank, or null if none of the member's roles are mapped.
 */
export function resolveHighestRank(
  discordRoleIds: string[],
  roleIdMap: Record<string, string>
): Rank | null {
  let best: Rank | null = null;
  for (const roleId of discordRoleIds) {
    const mapped = roleIdMap[roleId];
    if (!mapped) continue;
    if (!isValidRank(mapped)) continue;
    const candidate = mapped as Rank;
    if (best === null || rankWeight(candidate) < rankWeight(best)) {
      best = candidate;
    }
  }
  return best;
}

function isValidRank(value: string): value is Rank {
  return (RANK_ORDER as string[]).includes(value);
}
