"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Function {
    id: string;
    name: string;
    _count: { employees: number };
}

export default function FunctionsPage() {
    const [functions, setFunctions] = useState<Function[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "" });

    useEffect(() => {
        fetchFunctions();
    }, []);

    const fetchFunctions = async () => {
        try {
            const response = await fetch("/api/functions");
            const data = await response.json();
            setFunctions(data);
        } catch (error) {
            console.error("Failed to fetch functions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editId ? `/api/functions/${editId}` : "/api/functions";
            const method = editId ? "PUT" : "POST";

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            setFormData({ name: "" });
            setEditId(null);
            fetchFunctions();
        } catch (error) {
            console.error("Failed to save function:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this function?")) return;

        try {
            await fetch(`/api/functions/${id}`, { method: "DELETE" });
            fetchFunctions();
        } catch (error) {
            console.error("Failed to delete function:", error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Functions</h1>
                <p className="text-muted-foreground">Manage job functions</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{editId ? "Edit" : "Add"} Function</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="name">Function Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                                placeholder="e.g., Senior Carpenter"
                                required
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button type="submit">
                                <Plus className="h-4 w-4 mr-2" />
                                {editId ? "Update" : "Add"}
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
                {functions.map((func) => (
                    <Card key={func.id}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{func.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {func._count.employees} employee(s)
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditId(func.id);
                                            setFormData({ name: func.name });
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(func.id)}
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
