/**
 * Resolves the name shown throughout the app for a given account.
 *
 * Preference order:
 * 1. `discordNick` — the person's nickname ("apelido") in the ROCAM Discord
 *    server, refreshed on every login via the bot API. This is what the
 *    rest of the team actually calls them in-game/in-server.
 * 2. `characterName` — the in-game character name ("Nome IC") they entered
 *    during onboarding, used as a fallback if they have no server nickname.
 * 3. `username` — their global Discord display name, last resort.
 */
export function resolveDisplayName(user: {
  discordNick?: string | null;
  characterName?: string | null;
  username: string;
}): string {
  return user.discordNick?.trim() || user.characterName?.trim() || user.username;
}
