"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function ReportsPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (!startDate || !endDate) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please select both start and end dates",
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
                title: "Error",
                description: "Failed to generate report",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Salary Reports</h1>
                <p className="text-muted-foreground">
                    Generate and download salary reports for any date range
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Export Salary Report (CSV)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button onClick={handleExport} disabled={loading}>
                        {loading ? "Generating..." : "Download CSV Report"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Report Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>The CSV report includes the following data for each employee:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Employee Name</li>
                            <li>Number of Worked Days</li>
                            <li>List of Worked Dates</li>
                            <li>Daily Salary Rate</li>
                            <li>Gross Salary (with multipliers applied)</li>
                            <li>Advance Amount</li>
                            <li>Net Salary (Gross - Advance)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
