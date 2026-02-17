import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    DollarSign,
    Briefcase,
    TrendingUp,
    Building2,
    Calendar,
    UserCheck,
    AlertCircle
} from "lucide-react";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { getMonthlyStats } from "@/lib/salary";

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                        EMIMET Construction
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {session.user.name}! • {formatShortDate(new Date())}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Building2 className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-900 dark:text-orange-100">
                        Wood Carpentry Division
                    </span>
                </div>
            </div>

            {/* Primary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Employees
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{stats.activeEmployees}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {inactiveEmployees} inactive
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Monthly Salary
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {formatCurrency(stats.totalSalary)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.totalWorkedDays} total worked days
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Advances
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                            {formatCurrency(stats.totalAdvances)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Paid in advance
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Net Payable
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            {formatCurrency(netSalary)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            After advances
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Sectors Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-orange-600" />
                            Sectors Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sectors.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No sectors found
                            </p>
                        ) : (
                            sectors.map((sector) => (
                                <div key={sector.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <span className="font-medium">{sector.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-orange-600">
                                            {sector._count.employees}
                                        </span>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Functions Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            Job Functions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {functions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No functions found
                            </p>
                        ) : (
                            functions.map((func) => (
                                <div key={func.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <Briefcase className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <span className="font-medium">{func.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {func._count.employees}
                                        </span>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Recent Workday Assignments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentWorkdays.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No recent workdays
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {recentWorkdays.map((workday) => (
                                <div
                                    key={workday.id}
                                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                                            {workday.employee.firstName[0]}{workday.employee.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {workday.employee.firstName} {workday.employee.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatShortDate(workday.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {formatCurrency(workday.employee.dailySalary * workday.multiplier)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {workday.employee.dailySalary} MAD × {workday.multiplier}x
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${workday.multiplier === 1.0
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                    : workday.multiplier === 1.5
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                }`}
                                        >
                                            {workday.multiplier}x
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Info */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-8 w-8 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                    Average Daily Salary
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {formatCurrency(stats.activeEmployees > 0 && stats.totalWorkedDays > 0 ? stats.totalSalary / stats.totalWorkedDays : 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Avg Days/Employee
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.activeEmployees > 0 ? (stats.totalWorkedDays / stats.activeEmployees).toFixed(1) : 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Advance Rate
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.totalSalary > 0 ? ((stats.totalAdvances / stats.totalSalary) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
