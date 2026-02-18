"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Shield, User } from "lucide-react";
import { formatShortDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/language-context";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        role: "USER",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/users");
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                const errorData = await response.json();
                console.error("Error fetching users:", errorData);
                toast({
                    variant: "destructive",
                    title: t.toasts.failedFetchUsers,
                    description: errorData.error || "Unknown error",
                });
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast({
                variant: "destructive",
                title: t.toasts.networkError,
                description: t.toasts.failedConnect,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const newUser = await response.json();
                setUsers([newUser, ...users]);
                setFormData({ email: "", password: "", name: "", role: "USER" });
                setShowForm(false);
                toast({
                    variant: "success",
                    title: t.common.success,
                    description: t.toasts.userCreated,
                });
            } else {
                const data = await response.json();
                toast({
                    variant: "destructive",
                    title: t.common.error,
                    description: data.error || "Failed to create user",
                });
            }
        } catch (error) {
            console.error("Failed to create user:", error);
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.toasts.anErrorOccurred,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            MANAGER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            USER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        };
        return styles[role as keyof typeof styles] || styles.USER;
    };

    if (loading) {
        return <div>{t.common.loading}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t.users.title}</h1>
                    <p className="text-muted-foreground">
                        {t.users.subtitle}
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {showForm ? t.common.cancel : t.users.addUser}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t.users.createUser}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">{t.users.fullName} *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">{t.common.email} *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        placeholder="user@emimet.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="password">{t.users.password} *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        placeholder={t.users.passwordPlaceholder}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="role">{t.common.role} *</Label>
                                    <select
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        required
                                    >
                                        <option value="USER">User</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? t.users.creating : t.users.createUser}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                    disabled={submitting}
                                >
                                    {t.common.cancel}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {users.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8 text-muted-foreground">
                            {t.users.noUsers}
                        </CardContent>
                    </Card>
                ) : (
                    users.map((user) => (
                        <Card key={user.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        {user.role === "ADMIN" ? (
                                            <Shield className="h-6 w-6 text-primary" />
                                        ) : (
                                            <User className="h-6 w-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{user.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">{t.common.created}</p>
                                        <p className="text-sm font-medium">
                                            {formatShortDate(user.createdAt)}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(
                                            user.role
                                        )}`}
                                    >
                                        {user.role}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
