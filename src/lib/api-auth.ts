import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Rank } from "@/generated/prisma";
import { isAtLeast } from "@/lib/permissions";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface AuthedUser {
  id: string;
  discordId: string;
  rank: Rank;
  isStaffMaster: boolean;
  name: string;
}

/**
 * Authenticates the caller from the (signed, server-verified) session JWT.
 * Never trust a client-supplied role/rank — this always reads the rank that
 * was written to the token during sign-in / role sync.
 */
export async function requireUser(): Promise<AuthedUser> {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError(401, "Não autenticado.");
  }
  return {
    id: session.user.id,
    discordId: session.user.discordId,
    rank: session.user.rank,
    isStaffMaster: session.user.isStaffMaster,
    name: session.user.name ?? "Oficial",
  };
}

/** Authenticates the caller AND requires at least `minimum` rank authority. */
export async function requireRank(minimum: Rank): Promise<AuthedUser> {
  const user = await requireUser();
  if (!isAtLeast(user.rank, minimum)) {
    throw new ApiError(
      403,
      `Acesso restrito. Requer nível ${minimum} ou superior.`
    );
  }
  return user;
}

/** Wraps a route handler, converting ApiError (and Zod-style errors) to responses. */
export function withApiErrorHandling(
  fn: (req: Request) => Promise<Response>
) {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json(
        { error: "Erro interno no servidor." },
        { status: 500 }
      );
    }
  };
}
