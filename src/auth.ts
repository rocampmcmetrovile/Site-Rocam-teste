import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { fetchGuildMember } from "@/lib/discord";
import { resolveHighestRank } from "@/lib/permissions";
import { getRoleIdMap } from "@/lib/discord";
import { syncDiscordProfile } from "@/lib/discord-profile-sync";
import { resolveDisplayName } from "@/lib/display-name";
import { prisma } from "@/lib/db";
import { Rank } from "@/generated/prisma";

/**
 * Thrown from the `signIn` callback when the Discord user isn't a member of
 * the configured guild, or has no role mapped in ROLE_ID_MAP. NextAuth
 * redirects to `/login?error=AccessDenied` in this case (see errorLink
 * mapping below), which we render as a dedicated "Acesso Restrito" screen.
 */
class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessDenied";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: { params: { scope: "identify" } },
    }),
  ],
  session: {
    // JWT sessions: this app has a single OAuth provider and no email
    // features, so we skip the Account/Session/VerificationToken adapter
    // tables and keep our own `User` row (with `rank`) as the source of
    // truth, refreshed on every sign-in via the Discord guild role sync.
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, profile }) {
      const discordId = (profile as { id?: string } | undefined)?.id ?? user.id;
      if (!discordId) return false;

      // Single bot-API call gives us both the member's roles (-> rank) and
      // their guild-specific nickname ("apelido") in one round trip.
      const member = await fetchGuildMember(discordId);
      if (!member) {
        throw new AccessDeniedError(
          "Você não é membro do servidor do Discord da ROCAM Metroville, ou seu cargo não está configurado no sistema."
        );
      }

      const rank = resolveHighestRank(member.roles, getRoleIdMap());
      if (!rank) {
        throw new AccessDeniedError(
          "Você não é membro do servidor do Discord da ROCAM Metroville, ou seu cargo não está configurado no sistema."
        );
      }

      await syncDiscordProfile({
        discordId,
        username: user.name ?? "Oficial Desconhecido",
        avatarUrl: user.image ?? null,
        discordNick: member.nick ?? null,
        rank,
      });

      return true;
    },

    async jwt({ token, profile }) {
      const discordId =
        (profile as { id?: string } | undefined)?.id ?? (token.discordId as string | undefined);
      if (!discordId) return token;

      // Re-read the freshly upserted row (or an existing one on subsequent
      // requests) so the JWT always carries the current DB rank/appUserId.
      const dbUser = await prisma.user.findUnique({ where: { discordId } });
      if (dbUser) {
        token.discordId = dbUser.discordId;
        token.appUserId = dbUser.id;
        token.username = dbUser.username;
        token.discordNick = dbUser.discordNick;
        token.characterName = dbUser.characterName;
        token.avatarUrl = dbUser.avatarUrl;
        token.rank = dbUser.rank;
        token.isStaffMaster = dbUser.isStaffMaster;
        token.needsOnboarding = !dbUser.passport;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = (token.appUserId as string) ?? session.user.id;
      session.user.discordId = token.discordId as string;
      session.user.rank = (token.rank as Rank) ?? Rank.PROBATORIOS;
      session.user.isStaffMaster = Boolean(token.isStaffMaster);
      session.user.needsOnboarding = Boolean(token.needsOnboarding);
      session.user.name = resolveDisplayName({
        discordNick: token.discordNick as string | null | undefined,
        characterName: token.characterName as string | null | undefined,
        username: (token.username as string) ?? session.user.name ?? "Oficial",
      });
      session.user.image = (token.avatarUrl as string) ?? session.user.image;
      return session;
    },
  },
});
