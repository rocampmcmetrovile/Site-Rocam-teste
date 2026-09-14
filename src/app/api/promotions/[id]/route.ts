import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, withApiErrorHandling } from "@/lib/api-auth";
import { promotionStatusSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

export const PATCH = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUBGESTOR);
  const id = new URL(req.url).pathname.split("/").pop()!;
  const body = promotionStatusSchema.parse(await req.json());

  const promotion = await prisma.promotion.update({ where: { id }, data: body });

  if (body.status === "APROVADO" && promotion.userId) {
    await prisma.user.update({
      where: { id: promotion.userId },
      data: { rank: promotion.newRank },
    });
  }

  await logActivity({
    type: "PROMOCAO",
    title: "Status de Promoção Atualizado",
    detail: `Promoção de ${promotion.officerName} para ${promotion.newRank} marcada como ${promotion.status}.`,
    actor,
  });

  return NextResponse.json(promotion);
});
