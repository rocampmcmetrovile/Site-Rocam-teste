import type { Rank } from "@/generated/prisma";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
      rank: Rank;
      isStaffMaster: boolean;
      /** True until the mandatory first-login onboarding form is submitted. */
      needsOnboarding: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string;
    appUserId?: string;
    username?: string;
    discordNick?: string | null;
    characterName?: string | null;
    avatarUrl?: string | null;
    rank?: Rank;
    isStaffMaster?: boolean;
    needsOnboarding?: boolean;
  }
}
