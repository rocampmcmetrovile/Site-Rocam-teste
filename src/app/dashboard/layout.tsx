import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ViewAsProvider } from "@/components/view-as-context";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.needsOnboarding) redirect("/onboarding");

  return (
    <ViewAsProvider realRank={session.user.rank}>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar username={session.user.name ?? "Oficial"} avatarUrl={session.user.image ?? null} />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
          <Header />
          <div className="p-4 md:p-6 space-y-6 flex-1">{children}</div>
        </main>
      </div>
    </ViewAsProvider>
  );
}
