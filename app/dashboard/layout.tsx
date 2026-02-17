import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Toaster } from "@/components/ui/toaster";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="h-screen flex flex-col">
            <Header userName={session.user?.name} userRole={session.user?.role} />
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 border-r bg-muted/10">
                    <Sidebar userRole={session.user?.role} />
                </aside>
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
            <Toaster />
        </div>
    );
}
