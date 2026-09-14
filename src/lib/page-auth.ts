import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Rank } from "@/generated/prisma";
import { isAtLeast, isStaff } from "@/lib/permissions";

/** Server Component guard: redirects to /dashboard if the real session rank is below `minimum`. */
export async function requirePageRank(minimum: Rank) {
  const session = await auth();
  if (!session?.user || !isAtLeast(session.user.rank, minimum)) {
    redirect("/dashboard");
  }
  return session.user;
}

/** Server Component guard: redirects to /dashboard unless the real session rank is Staff. */
export async function requirePageStaff() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.rank)) {
    redirect("/dashboard");
  }
  return session.user;
}
