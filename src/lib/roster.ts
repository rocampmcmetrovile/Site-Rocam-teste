import "server-only";
import type { Prisma } from "@/generated/prisma";

/**
 * Shared `select` for exposing `User` rows as roster ("Efetivo") entries —
 * dropdowns, lists, arrest participants, etc. Deliberately omits
 * account/auth fields (`discordId`, `isStaffMaster`, `avatarUrl`) so any
 * authenticated user browsing the roster doesn't see other people's raw
 * Discord IDs or staff flags.
 */
export const rosterSelect = {
  id: true,
  characterName: true,
  discordNick: true,
  username: true,
  passport: true,
  badge: true,
  rank: true,
  status: true,
  arrestsCount: true,
  warningsCount: true,
} satisfies Prisma.UserSelect;

export type RosterMember = Prisma.UserGetPayload<{ select: typeof rosterSelect }>;

/** Only accounts that finished the mandatory onboarding form count as full
 * roster members (they have a passport on file). */
export const onboardedFilter = { passport: { not: null } } satisfies Prisma.UserWhereInput;
