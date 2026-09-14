import "server-only";
import { prisma } from "@/lib/db";
import type { Rank } from "@/generated/prisma";

/**
 * Keeps the small set of Discord-sourced fields on `User` in sync on every
 * login: rank (from guild roles), global username, and guild nickname
 * ("apelido"). Roster fields (characterName/passport/badge/status) are
 * intentionally NOT touched here — those are only set once via the
 * mandatory onboarding form (src/app/onboarding) and afterwards managed by
 * hand by a Supervisor+, so a login never silently overwrites them.
 *
 * Never throws: a profile sync hiccup should not block someone from
 * logging in.
 */
export async function syncDiscordProfile(params: {
  discordId: string;
  username: string;
  avatarUrl: string | null;
  discordNick: string | null;
  rank: Rank;
}) {
  const { discordId, username, avatarUrl, discordNick, rank } = params;
  try {
    return await prisma.user.upsert({
      where: { discordId },
      create: {
        discordId,
        username,
        avatarUrl,
        discordNick,
        rank,
      },
      update: {
        username,
        avatarUrl: avatarUrl ?? undefined,
        discordNick,
        rank,
      },
    });
  } catch (err) {
    console.error("[discord-profile-sync] failed to sync user", discordId, err);
    return null;
  }
}
