import { prisma } from "@/lib/db";
import { requirePageStaff } from "@/lib/page-auth";
import { onboardedFilter } from "@/lib/roster";
import { StaffPanelClient } from "@/components/staff-panel/staff-panel-client";

export default async function StaffPanelPage() {
  await requirePageStaff();

  const [staffMembers, userCount, officerCount] = await Promise.all([
    prisma.staffMember.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.user.count(),
    prisma.user.count({ where: onboardedFilter }),
  ]);

  return (
    <StaffPanelClient
      initialStaffMembers={staffMembers}
      stats={{ userCount, officerCount }}
    />
  );
}
