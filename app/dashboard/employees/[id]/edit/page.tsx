"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface Sector {
    id: string;
    name: string;
}

interface Function {
    id: string;
    name: string;
}

interface Employee {
    id: string;
    cin: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    address: string;
    sectorId: string;
    functionId: string;
    dailySalary: number;
    advanceAmount: number;
    joinDate: string;
    employmentStatus: string;
    notes: string;
}

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const employeeId = params.id as string;

    const [sectors, setSectors] = useState<Sector[]>([]);
    const [functions, setFunctions] = useState<Function[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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
        advanceAmount: "",
        joinDate: "",
        employmentStatus: "ACTIVE",
        notes: "",
    });

    useEffect(() => {
        fetchEmployee();
        fetchSectors();
        fetchFunctions();
    }, []);

    const fetchEmployee = async () => {
        try {
            const response = await fetch(`/api/employees/${employeeId}`);
            const data: Employee = await response.json();

            setFormData({
                cin: data.cin,
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth.split("T")[0],
                phoneNumber: data.phoneNumber,
                address: data.address,
                sectorId: data.sectorId,
                functionId: data.functionId,
                dailySalary: data.dailySalary.toString(),
                advanceAmount: data.advanceAmount.toString(),
                joinDate: data.joinDate.split("T")[0],
                employmentStatus: data.employmentStatus,
                notes: data.notes || "",
            });
        } catch (error) {
            console.error("Failed to fetch employee:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load employee data",
            });
        } finally {
            setFetching(false);
        }
    };

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
            const response = await fetch(`/api/employees/${employeeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    dailySalary: parseFloat(formData.dailySalary),
                    advanceAmount: parseFloat(formData.advanceAmount),
                }),
            });

            if (response.ok) {
                router.push(`/dashboard/employees/${employeeId}`);
            } else {
                const data = await response.json();
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.error || "Failed to update employee",
                });
            }
        } catch (error) {
            console.error("Failed to update employee:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred. Please try again.",
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

    if (fetching) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/employees/${employeeId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Edit Employee</h1>
                    <p className="text-muted-foreground">
                        Update employee information
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cin">CIN *</Label>
                                <Input
                                    id="cin"
                                    name="cin"
                                    value={formData.cin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phoneNumber">Phone Number *</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
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
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sectorId">Sector *</Label>
                                <select
                                    id="sectorId"
                                    name="sectorId"
                                    value={formData.sectorId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="">Select a sector...</option>
                                    {sectors.map((sector) => (
                                        <option key={sector.id} value={sector.id}>
                                            {sector.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="functionId">Function *</Label>
                                <select
                                    id="functionId"
                                    name="functionId"
                                    value={formData.functionId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="">Select a function...</option>
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
                                <Label htmlFor="dailySalary">Daily Salary (MAD) *</Label>
                                <Input
                                    id="dailySalary"
                                    name="dailySalary"
                                    type="number"
                                    step="0.01"
                                    value={formData.dailySalary}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="advanceAmount">Advance Amount (MAD)</Label>
                                <Input
                                    id="advanceAmount"
                                    name="advanceAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.advanceAmount}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="joinDate">Join Date *</Label>
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
                                <Label htmlFor="employmentStatus">Employment Status *</Label>
                                <select
                                    id="employmentStatus"
                                    name="employmentStatus"
                                    value={formData.employmentStatus}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Additional notes about the employee..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4 mt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Employee"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
