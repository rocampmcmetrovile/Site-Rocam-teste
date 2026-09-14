import "server-only";

export interface DiscordGuildMember {
  roles: string[];
  nick?: string | null;
  user?: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

/**
 * Looks up a Discord role id -> Rank map from the ROLE_ID_MAP env var.
 * Example: {"111...":"STAFF","222...":"GESTOR", ...}
 */
export function getRoleIdMap(): Record<string, string> {
  const raw = process.env.ROLE_ID_MAP;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Record<string, string>;
  } catch {
    console.error(
      "[discord] Falha ao interpretar ROLE_ID_MAP como JSON. Verifique o formato em .env"
    );
    return {};
  }
}

/**
 * Fetches a member's roles in the configured guild using the Discord Bot
 * Token. Returns `null` if the user is not a member of the guild (404) or
 * the bot/guild is misconfigured.
 */
export async function fetchGuildMember(
  discordUserId: string
): Promise<DiscordGuildMember | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!botToken || !guildId) {
    console.error(
      "[discord] DISCORD_BOT_TOKEN ou DISCORD_GUILD_ID não configurados."
    );
    return null;
  }

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
    {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
    }
  );

  if (res.status === 404) {
    // User is authenticated with Discord but is not a member of the guild.
    return null;
  }

  if (!res.ok) {
    console.error(
      `[discord] Falha ao buscar membro da guild (status ${res.status}): ${await res
        .text()
        .catch(() => "")}`
    );
    return null;
  }

  return (await res.json()) as DiscordGuildMember;
}
