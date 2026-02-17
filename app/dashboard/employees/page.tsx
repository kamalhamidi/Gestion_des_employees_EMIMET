"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { formatCurrency, formatShortDate } from "@/lib/utils";

interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    cin: string;
    sector: { name: string };
    function: { name: string };
    dailySalary: number;
    employmentStatus: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchEmployees();
    }, [search, page]);

    const fetchEmployees = async () => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                ...(search && { search }),
            });

            const response = await fetch(`/api/employees?${params}`);
            const data = await response.json();
            setEmployees(data.employees);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Employees</h1>
                    <p className="text-muted-foreground">
                        Manage your workforce ({total} total)
                    </p>
                </div>
                <Link href="/dashboard/employees/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                </Link>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, CIN, or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {employees.map((employee) => (
                    <Card key={employee.id} className="p-4">
                        <Link href={`/dashboard/employees/${employee.id}`}>
                            <div className="flex justify-between items-center hover:bg-accent rounded-md p-2 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">
                                            {employee.firstName} {employee.lastName}
                                        </h3>
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                            {employee.employeeId}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${employee.employmentStatus === "ACTIVE"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                                }`}
                                        >
                                            {employee.employmentStatus}
                                        </span>
                                    </div>
                                    <div className="flex gap-6 text-sm text-muted-foreground">
                                        <span>CIN: {employee.cin}</span>
                                        <span>{employee.sector.name}</span>
                                        <span>{employee.function.name}</span>
                                        <span>{formatCurrency(employee.dailySalary)}/day</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    View Details
                                </Button>
                            </div>
                        </Link>
                    </Card>
                ))}
            </div>

            {total > 20 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4">
                        Page {page} of {Math.ceil(total / 20)}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= Math.ceil(total / 20)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
