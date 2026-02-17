"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Sector {
    id: string;
    name: string;
    _count: { employees: number };
}

export default function SectorsPage() {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "" });

    useEffect(() => {
        fetchSectors();
    }, []);

    const fetchSectors = async () => {
        try {
            const response = await fetch("/api/sectors");
            const data = await response.json();
            setSectors(data);
        } catch (error) {
            console.error("Failed to fetch sectors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editId ? `/api/sectors/${editId}` : "/api/sectors";
            const method = editId ? "PUT" : "POST";

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            setFormData({ name: "" });
            setEditId(null);
            fetchSectors();
        } catch (error) {
            console.error("Failed to save sector:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this sector?")) return;

        try {
            await fetch(`/api/sectors/${id}`, { method: "DELETE" });
            fetchSectors();
        } catch (error) {
            console.error("Failed to delete sector:", error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Sectors</h1>
                <p className="text-muted-foreground">Manage construction sectors</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{editId ? "Edit" : "Add"} Sector</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="name">Sector Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                                placeholder="e.g., Wood Carpentry"
                                required
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button type="submit">
                                <Plus className="h-4 w-4 mr-2" />
                                {editId ? " Update" : "Add"}
                            </Button>
                            {editId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditId(null);
                                        setFormData({ name: "" });
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sectors.map((sector) => (
                    <Card key={sector.id}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{sector.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {sector._count.employees} employee(s)
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditId(sector.id);
                                            setFormData({ name: sector.name });
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(sector.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
