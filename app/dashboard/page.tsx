import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getMonthlyStats } from "@/lib/salary";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Get monthly statistics
    const stats = await getMonthlyStats();

    // Get sectors with employee counts
    const sectors = await db.sector.findMany({
        include: {
            _count: {
                select: { employees: { where: { isDeleted: false, employmentStatus: "ACTIVE" } } }
            }
        }
    });

    // Get functions with employee counts
    const functions = await db.function.findMany({
        include: {
            _count: {
                select: { employees: { where: { isDeleted: false, employmentStatus: "ACTIVE" } } }
            }
        }
    });

    // Get recent workdays
    const recentWorkdays = await db.workday.findMany({
        take: 5,
        orderBy: { date: "desc" },
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true,
                    dailySalary: true
                }
            }
        }
    });

    // Calculate net salary
    const netSalary = stats.totalSalary - stats.totalAdvances;

    // Get inactive employees count
    const inactiveEmployees = await db.employee.count({
        where: { employmentStatus: "INACTIVE", isDeleted: false }
    });

    return (
        <DashboardClient
            stats={stats}
            netSalary={netSalary}
            inactiveEmployees={inactiveEmployees}
            sectors={sectors}
            functions={functions}
            recentWorkdays={recentWorkdays}
            userName={session.user?.name ?? ""}
        />
    );
}
