import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, withApiErrorHandling } from "@/lib/api-auth";
import { staffMemberSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

export const GET = withApiErrorHandling(async () => {
  await requireRank(Rank.STAFF);
  const staffMembers = await prisma.staffMember.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(staffMembers);
});

export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.STAFF);
  const body = staffMemberSchema.parse(await req.json());

  const staffMember = await prisma.staffMember.create({ data: body });

  await logActivity({
    type: "STAFF",
    title: "Membro de Staff Adicionado",
    detail: `${staffMember.name} (${staffMember.cargo}) foi adicionado à equipe de Staff.`,
    actor,
  });

  return NextResponse.json(staffMember, { status: 201 });
});
