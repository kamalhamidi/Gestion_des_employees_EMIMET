"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/language-context";

interface Sector {
    id: string;
    name: string;
}

interface Function {
    id: string;
    name: string;
}

export default function NewEmployeePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [functions, setFunctions] = useState<Function[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cin: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        phoneNumber: "",
        address: "",
        sectorId: "",
        functionId: "",
        dailySalary: "",
        advanceAmount: "0",
        joinDate: new Date().toISOString().split("T")[0],
        employmentStatus: "ACTIVE" as const,
        notes: "",
    });

    useEffect(() => {
        fetchSectors();
        fetchFunctions();
    }, []);

    const fetchSectors = async () => {
        try {
            const response = await fetch("/api/sectors");
            const data = await response.json();
            setSectors(data);
        } catch (error) {
            console.error("Failed to fetch sectors:", error);
        }
    };

    const fetchFunctions = async () => {
        try {
            const response = await fetch("/api/functions");
            const data = await response.json();
            setFunctions(data);
        } catch (error) {
            console.error("Failed to fetch functions:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    dailySalary: parseFloat(formData.dailySalary),
                    advanceAmount: parseFloat(formData.advanceAmount),
                }),
            });

            if (response.ok) {
                router.push("/dashboard/employees");
            } else {
                const data = await response.json();
                toast({
                    variant: "destructive",
                    title: t.common.error,
                    description: data.error || "Failed to create employee",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.toasts.anErrorOccurred,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">{t.employees.addNewEmployee}</h1>
                <p className="text-muted-foreground">
                    {t.employees.fillInfo}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t.employees.personalInfo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cin">{t.employees.cin} *</Label>
                                <Input
                                    id="cin"
                                    name="cin"
                                    value={formData.cin}
                                    onChange={handleChange}
                                    placeholder="AB123456"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phoneNumber">{t.employees.phoneNumber} *</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+212612345678"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">{t.employees.firstName} *</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Mohammed"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">{t.employees.lastName} *</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Alami"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="dateOfBirth">{t.employees.dateOfBirth} *</Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">{t.employees.address} *</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Rue Hassan II, Casablanca"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>{t.employees.employmentDetails}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sectorId">{t.employees.sector} *</Label>
                                <select
                                    id="sectorId"
                                    name="sectorId"
                                    value={formData.sectorId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="">{t.employees.selectSector}</option>
                                    {sectors.map((sector) => (
                                        <option key={sector.id} value={sector.id}>
                                            {sector.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="functionId">{t.employees.function} *</Label>
                                <select
                                    id="functionId"
                                    name="functionId"
                                    value={formData.functionId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="">{t.employees.selectFunction}</option>
                                    {functions.map((func) => (
                                        <option key={func.id} value={func.id}>
                                            {func.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dailySalary">{t.employees.dailySalary} *</Label>
                                <Input
                                    id="dailySalary"
                                    name="dailySalary"
                                    type="number"
                                    step="0.01"
                                    value={formData.dailySalary}
                                    onChange={handleChange}
                                    placeholder="250.00"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="advanceAmount">{t.employees.advanceAmount}</Label>
                                <Input
                                    id="advanceAmount"
                                    name="advanceAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.advanceAmount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="joinDate">{t.employees.joinDate} *</Label>
                                <Input
                                    id="joinDate"
                                    name="joinDate"
                                    type="date"
                                    value={formData.joinDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="employmentStatus">{t.employees.employmentStatus} *</Label>
                                <select
                                    id="employmentStatus"
                                    name="employmentStatus"
                                    value={formData.employmentStatus}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="ACTIVE">{t.common.active}</option>
                                    <option value="INACTIVE">{t.common.inactive}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">{t.common.notes}</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder={t.employees.additionalNotes}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4 mt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? t.employees.creating : t.employees.createEmployee}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        {t.common.cancel}
                    </Button>
                </div>
            </form>
        </div>
    );
}
