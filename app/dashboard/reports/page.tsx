"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ReportsPage() {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (!startDate || !endDate) {
            toast({
                variant: "destructive",
                title: t.toasts.validationError,
                description: t.toasts.selectDates,
            });
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({ startDate, endDate });
            const response = await fetch(`/api/reports/csv?${params}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `salary-report-${startDate}-${endDate}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export report:", error);
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.toasts.failedReport,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t.reports.title}</h1>
                <p className="text-muted-foreground">
                    {t.reports.subtitle}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t.reports.exportCSV}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">{t.reports.startDate}</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate">{t.reports.endDate}</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button onClick={handleExport} disabled={loading}>
                        {loading ? t.reports.generating : t.reports.downloadCSV}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t.reports.reportInfo}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>{t.reports.reportIncludes}</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>{t.reports.employeeName}</li>
                            <li>{t.reports.workedDays}</li>
                            <li>{t.reports.workedDates}</li>
                            <li>{t.reports.dailySalaryRate}</li>
                            <li>{t.reports.grossSalary}</li>
                            <li>{t.reports.advanceAmount}</li>
                            <li>{t.reports.netSalary}</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
