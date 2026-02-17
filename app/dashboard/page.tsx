import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    DollarSign,
    Briefcase,
    TrendingUp,
    Building2,
    Calendar,
    UserCheck,
    AlertCircle
} from "lucide-react";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { getMonthlyStats } from "@/lib/salary";

export default async function DashboardPage() {
                </CardHeader >
        <CardContent>
            <p className="text-muted-foreground">
                Use the sidebar to navigate between different sections. You can manage
                employees, track workdays, calculate salaries, and generate reports.
            </p>
        </CardContent>
            </Card >
        </div >
    );
}
