"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatShortDate } from "@/lib/utils";

interface Workday {
    id: string;
    date: string;
    multiplier: number;
    employee: {
        firstName: string;
        lastName: string;
        employeeId: string;
    };
}

export default function WorkdaysPage() {
    const [workdays, setWorkdays] = useState<Workday[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkdays();
    }, []);

    const fetchWorkdays = async () => {
        try {
            const response = await fetch("/api/workdays");
            const data = await response.json();
            setWorkdays(data);
        } catch (error) {
            console.error("Failed to fetch workdays:", error);
        } finally {
            setLoading(false);
        }
    };

    // Group workdays by date
    const groupedWorkdays = workdays.reduce((acc, workday) => {
        const dateKey = formatShortDate(workday.date);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(workday);
        return acc;
    }, {} as Record<string, Workday[]>);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Workdays</h1>
                    <p className="text-muted-foreground">
                        Track employee work assignments and overtime
                    </p>
                </div>
                <Link href="/dashboard/workdays/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Workday
                    </Button>
                </Link>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedWorkdays)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([date, dayWorkdays]) => (
                        <Card key={date} className="p-6">
                            <h3 className="font-semibold text-lg mb-4">{date}</h3>
                            <div className="space-y-2">
                                {dayWorkdays.map((workday) => (
                                    <div
                                        key={workday.id}
                                        className="flex justify-between items-center p-3 bg-muted rounded-md"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {workday.employee.firstName} {workday.employee.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {workday.employee.employeeId}
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
                        </Card>
                    ))}
            </div>

            {workdays.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                        No workdays assigned yet. Start by assigning employees to a date.
                    </p>
                </Card>
            )}
        </div>
    );
}
