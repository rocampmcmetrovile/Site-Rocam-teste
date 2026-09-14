import "server-only";
import { prisma } from "@/lib/db";
import { ActivityLogType, Rank } from "@/generated/prisma";
import type { AuthedUser } from "@/lib/api-auth";

/**
 * Records an entry in the audit trail. Called from every mutating API
 * route so Staff/Supervisor+ can review the full history under
 * "Histórico de Alterações".
 */
export async function logActivity(params: {
  type: ActivityLogType;
  title: string;
  detail: string;
  actor?: AuthedUser | null;
}) {
  const { type, title, detail, actor } = params;
  try {
    await prisma.activityLog.create({
      data: {
        type,
        title,
        detail,
        userId: actor?.id,
        userRankAtTime: actor?.rank as Rank | undefined,
      },
    });
  } catch (err) {
    // Never let audit-log failures break the primary mutation.
    console.error("[activity-log] failed to write entry", err);
  }
}
