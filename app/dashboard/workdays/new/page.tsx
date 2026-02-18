"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SALARY_MULTIPLIERS } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/language-context";

interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
}

export default function NewWorkdayPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [date, setDate] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    const [multipliers, setMultipliers] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch("/api/employees?status=ACTIVE");
            const data = await response.json();
            setEmployees(data.employees);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    const toggleEmployee = (id: string) => {
        const newSet = new Set(selectedEmployees);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
            if (!multipliers[id]) {
                setMultipliers({ ...multipliers, [id]: 1.0 });
            }
        }
        setSelectedEmployees(newSet);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || selectedEmployees.size === 0) {
            toast({
                variant: "destructive",
                title: t.toasts.validationError,
                description: t.toasts.selectDateAndEmployee,
            });
            return;
        }

        setLoading(true);
        try {
            const promises = Array.from(selectedEmployees).map((employeeId) =>
                fetch("/api/workdays", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date,
                        employeeId,
                        multiplier: multipliers[employeeId] || 1.0,
                    }),
                })
            );

            await Promise.all(promises);
            toast({
                variant: "success",
                title: t.common.success,
                description: t.toasts.workdaysCreated,
            });
            router.push("/dashboard/workdays");
        } catch (error) {
            console.error("Failed to create workdays:", error);
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.toasts.workdaysExist,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t.workdays.assignWorkday}</h1>
                <p className="text-muted-foreground">
                    {t.workdays.subtitle}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t.workdays.selectDate}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label htmlFor="date">{t.workdays.workDate}</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>{t.workdays.selectEmployees} ({selectedEmployees.size})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {employees.map((employee) => (
                                <div key={employee.id} className="flex items-center gap-4 p-3 border rounded-md">
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.has(employee.id)}
                                        onChange={() => toggleEmployee(employee.id)}
                                        className="h-4 w-4"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {employee.firstName} {employee.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {employee.employeeId}
                                        </p>
                                    </div>
                                    {selectedEmployees.has(employee.id) && (
                                        <select
                                            value={multipliers[employee.id] || 1.0}
                                            onChange={(e) =>
                                                setMultipliers({
                                                    ...multipliers,
                                                    [employee.id]: parseFloat(e.target.value),
                                                })
                                            }
                                            className="border rounded px-3 py-2"
                                        >
                                            {SALARY_MULTIPLIERS.map((m) => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4 mt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? t.workdays.assigning : t.workdays.assignWorkdays}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        {t.common.cancel}
                    </Button>
                </div>
            </form>
        </div>
    );
}
