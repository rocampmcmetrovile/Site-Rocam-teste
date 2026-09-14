import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, withApiErrorHandling } from "@/lib/api-auth";
import { rosterSelect, onboardedFilter } from "@/lib/roster";

// No POST here anymore — roster ("Efetivo") entries can only be created by
// completing the mandatory onboarding form on first Discord login (see
// src/app/api/onboarding/route.ts). Supervisor+ can still edit/remove
// existing entries via PATCH/DELETE on /api/officers/[id].
export const GET = withApiErrorHandling(async () => {
  await requireUser();
  const officers = await prisma.user.findMany({
    where: onboardedFilter,
    select: rosterSelect,
    orderBy: { characterName: "asc" },
  });
  return NextResponse.json(officers);
});
