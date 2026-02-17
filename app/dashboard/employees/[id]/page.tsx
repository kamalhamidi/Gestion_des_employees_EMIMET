import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { AddAdvanceForm } from "@/components/employees/advance-input";
import { AdvanceHistory } from "@/components/employees/advance-history";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function EmployeeDetailPage({ params }: PageProps) {
    const employee = await db.employee.findUnique({
        where: { id: params.id, isDeleted: false },
        include: {
            sector: true,
            function: true,
            workdays: {
                orderBy: { date: "desc" },
                take: 20,
            },
        },
    });

    if (!employee) {
        notFound();
    }

    // Calculate total worked days and salary
    const totalWorkedDays = employee.workdays.length;
    const totalGrossSalary = employee.workdays.reduce((sum, workday) => {
        return sum + employee.dailySalary * workday.multiplier;
    }, 0);
    const netSalary = totalGrossSalary - employee.advanceAmount;

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/employees">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {employee.firstName} {employee.lastName}
                        </h1>
                        <p className="text-muted-foreground">{employee.employeeId}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/employees/${employee.id}/edit`}>
                        <Button variant="outline">
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">CIN</p>
                                <p className="font-medium">{employee.cin}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date of Birth</p>
                                <p className="font-medium">
                                    {formatShortDate(employee.dateOfBirth)}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Phone Number</p>
                                <p className="font-medium">{employee.phoneNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Join Date</p>
                                <p className="font-medium">
                                    {formatShortDate(employee.joinDate)}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium">{employee.address}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Sector</p>
                                <p className="font-medium">{employee.sector.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Function</p>
                                <p className="font-medium">{employee.function.name}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Daily Salary</p>
                                <p className="font-medium">
                                    {formatCurrency(employee.dailySalary)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Employment Status</p>
                                <span
                                    className={`inline-block px-2 py-1 rounded text-sm ${employee.employmentStatus === "ACTIVE"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                        }`}
                                >
                                    {employee.employmentStatus}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Salary Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Worked Days</p>
                            <p className="text-2xl font-bold">{totalWorkedDays}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Gross Salary</p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(totalGrossSalary)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Net Salary</p>
                            <p className="text-2xl font-bold text-primary">
                                {formatCurrency(netSalary)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {employee.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{employee.notes}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Recent Workdays ({employee.workdays.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {employee.workdays.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No workdays recorded yet
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {employee.workdays.map((workday) => (
                                <div
                                    key={workday.id}
                                    className="flex justify-between items-center p-3 bg-muted rounded-md"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {formatShortDate(workday.date)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(
                                                employee.dailySalary * workday.multiplier
                                            )}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded text-sm font-medium ${workday.multiplier === 1.0
                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                            : workday.multiplier === 1.5
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            }`}
                                    >
                                        {workday.multiplier}x
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddAdvanceForm
                employeeId={employee.id}
                currentTotal={employee.advanceAmount}
            />

            <AdvanceHistory employeeId={employee.id} />
        </div>
    );
}
