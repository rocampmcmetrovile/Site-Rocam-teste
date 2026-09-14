import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, withApiErrorHandling, ApiError } from "@/lib/api-auth";
import { onboardingSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { RANK_LABELS } from "@/lib/permissions";

/**
 * Completes the mandatory first-login form: Nome IC + Passaporte (+ Badge).
 * This is what turns an authenticated `User` account into a full "Efetivo"
 * roster member (`passport` becomes non-null). Rank is never accepted here
 * — it's always the Discord-role-derived value already on the account.
 */
export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireUser();
  const body = onboardingSchema.parse(await req.json());

  const current = await prisma.user.findUnique({ where: { id: actor.id } });
  if (!current) {
    throw new ApiError(401, "Não autenticado.");
  }
  if (current.passport) {
    throw new ApiError(400, "Cadastro já foi concluído anteriormente.");
  }

  const existing = await prisma.user.findUnique({ where: { passport: body.passport } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe um oficial com este passaporte." },
      { status: 409 }
    );
  }

  const officer = await prisma.user.update({
    where: { id: actor.id },
    data: {
      characterName: body.characterName,
      passport: body.passport,
      badge: body.badge || null,
    },
  });

  await logActivity({
    type: "EFETIVO",
    title: "Novo Oficial Registrado",
    detail: `${officer.characterName} (passaporte ${officer.passport}) entrou para o efetivo via primeiro login com Discord — cargo: ${RANK_LABELS[officer.rank]}.`,
    actor,
  });

  return NextResponse.json({ ok: true });
});
