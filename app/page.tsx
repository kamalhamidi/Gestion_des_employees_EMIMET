import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hammer, Users, BarChart3, Shield } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Hammer className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">EMIMET</span>
                    </div>
                    <Link href="/login">
                        <Button>Login</Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-600">
                        Professional Employee Management
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Streamline your construction workforce with our comprehensive
                        employee management system. Built specifically for wood carpentry and
                        construction businesses.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/login">
                            <Button size="lg">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">
                    Everything You Need to Manage Your Team
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-lg border bg-card">
                        <Users className="h-12 w-12 text-primary mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Employee Management</h3>
                        <p className="text-muted-foreground">
                            Complete employee records with photos, documents, and department
                            assignments.
                        </p>
                    </div>
                    <div className="p-6 rounded-lg border bg-card">
                        <BarChart3 className="h-12 w-12 text-primary mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Salary Tracking</h3>
                        <p className="text-muted-foreground">
                            Automated salary calculations with overtime, advances, and detailed
                            reports.
                        </p>
                    </div>
                    <div className="p-6 rounded-lg border bg-card">
                        <Shield className="h-12 w-12 text-primary mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
                        <p className="text-muted-foreground">
                            Role-based permissions ensuring data security and proper access
                            control.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t mt-20">
                <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
                    <p>&copy; 2026 EMIMET. Professional Wood Carpentry & Construction.</p>
                </div>
            </footer>
        </div>
    );
}
