import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { getMonthlyStats } from "@/lib/salary";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
    const stats = await getMonthlyStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your workforce and monthly statistics
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Employees
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently employed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Salary (This Month)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.totalSalary)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Based on worked days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Advances
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.totalAdvances)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all employees
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Welcome to EMIMET Employee Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Use the sidebar to navigate between different sections. You can manage
                        employees, track workdays, calculate salaries, and generate reports.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
