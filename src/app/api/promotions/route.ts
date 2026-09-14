import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiError, requireUser, withApiErrorHandling } from "@/lib/api-auth";
import { promotionSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { resolveDisplayName } from "@/lib/display-name";

export const GET = withApiErrorHandling(async () => {
  await requireUser();
  const promotions = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(promotions);
});

export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireUser();
  const body = promotionSchema.parse(await req.json());

  const officer = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!officer) throw new ApiError(404, "Oficial não encontrado.");

  const officerName = resolveDisplayName(officer);
  const promotion = await prisma.promotion.create({
    data: {
      userId: officer.id,
      officerName,
      newRank: body.newRank,
      date: new Date().toLocaleDateString("pt-BR"),
    },
  });

  await logActivity({
    type: "PROMOCAO",
    title: "Solicitação de Promoção Enviada",
    detail: `${officerName} indicado para promoção a ${body.newRank}.`,
    actor,
  });

  return NextResponse.json(promotion, { status: 201 });
});
