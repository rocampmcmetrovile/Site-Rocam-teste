import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginCard } from "@/components/login-card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <div className="fixed inset-0 z-50 bg-rocam-dark flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#2A2E3D_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <LoginCard error={error} />
    </div>
  );
}
