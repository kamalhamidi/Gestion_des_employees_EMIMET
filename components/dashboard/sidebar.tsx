"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Building2,
    Briefcase,
    UserCircle,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface SidebarProps {
    userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navigation = [
        { name: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
        { name: t.nav.employees, href: "/dashboard/employees", icon: Users },
        { name: t.nav.workdays, href: "/dashboard/workdays", icon: Calendar },
        { name: t.nav.sectors, href: "/dashboard/sectors", icon: Building2 },
        { name: t.nav.functions, href: "/dashboard/functions", icon: Briefcase },
        { name: t.nav.reports, href: "/dashboard/reports", icon: FileText },
        {
            name: t.nav.users,
            href: "/dashboard/users",
            icon: UserCircle,
            adminOnly: true,
        },
    ];

    const filteredNav = navigation.filter(
        (item) => !item.adminOnly || userRole === "ADMIN"
    );

    return (
        <div className="flex flex-col h-full py-6 px-3 gap-2">
            {filteredNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        {item.name}
                    </Link>
                );
            })}
        </div>
    );
}
