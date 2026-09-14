import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.needsOnboarding) redirect("/dashboard");

  return (
    <div className="fixed inset-0 z-50 bg-rocam-dark flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#2A2E3D_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <OnboardingForm name={session.user.name ?? "Oficial"} rank={session.user.rank} />
    </div>
  );
}
