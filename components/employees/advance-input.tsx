"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface AddAdvanceFormProps {
    employeeId: string;
    currentTotal: number;
}

export function AddAdvanceForm({ employeeId, currentTotal }: AddAdvanceFormProps) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/employees/${employeeId}/advances`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    notes: notes || undefined,
                }),
            });

            if (response.ok) {
                toast({
                    variant: "success",
                    title: "Success!",
                    description: "Advance payment added successfully",
                });
                setAmount("");
                setNotes("");
                setShowForm(false);
                router.refresh();
            } else {
                const data = await response.json();
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.error || "Failed to add advance",
                });
            }
        } catch (error) {
            console.error("Failed to add advance:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!showForm) {
        return (
            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <div>
                    <p className="text-sm text-muted-foreground">Total Advances</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(currentTotal)}
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Advance
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Add New Advance Payment
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <Label htmlFor="amount">Amount (MAD) *</Label>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g., Monthly advance, Emergency"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <DollarSign className="h-4 w-4 mr-2" />
                        {loading ? "Adding..." : "Add Advance"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setShowForm(false);
                            setAmount("");
                            setNotes("");
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
