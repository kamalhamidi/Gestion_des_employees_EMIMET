"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, DollarSign, Calendar } from "lucide-react";
import { formatCurrency, formatShortDate } from "@/lib/utils";

interface AdvanceLog {
    id: string;
    amount: number;
    notes: string | null;
    createdAt: string;
    createdBy: string | null;
}

interface AdvanceHistoryProps {
    employeeId: string;
}

export function AdvanceHistory({ employeeId }: AdvanceHistoryProps) {
    const [advances, setAdvances] = useState<AdvanceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (showHistory) {
            fetchAdvances();
        }
    }, [showHistory, employeeId]);

    const fetchAdvances = async () => {
        try {
            const response = await fetch(`/api/employees/${employeeId}/advances`);
            if (response.ok) {
                const data = await response.json();
                setAdvances(data);
            }
        } catch (error) {
            console.error("Failed to fetch advances:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!showHistory) {
        return (
            <Button
                variant="outline"
                onClick={() => setShowHistory(true)}
                className="w-full"
            >
                <History className="h-4 w-4 mr-2" />
                Show Advance History
            </Button>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-orange-600" />
                        Advance Payment History
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(false)}
                    >
                        Hide
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading...</p>
                ) : advances.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No advances recorded yet
                    </p>
                ) : (
                    <div className="space-y-3">
                        {advances.map((advance) => (
                            <div
                                key={advance.id}
                                className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">
                                            {formatCurrency(advance.amount)}
                                        </p>
                                        {advance.notes && (
                                            <p className="text-sm text-muted-foreground">
                                                {advance.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatShortDate(advance.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(advance.createdAt).toLocaleTimeString()}
                                    </p>
                                    {advance.createdBy && (
                                        <p className="text-xs text-muted-foreground">
                                            by {advance.createdBy}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
