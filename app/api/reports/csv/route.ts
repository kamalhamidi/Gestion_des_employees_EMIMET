import { NextRequest, NextResponse } from "next/server";
import { calculateAllSalaries } from "@/lib/salary";
import { generateCSV } from "@/lib/csv";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "Start date and end date are required" },
                { status: 400 }
            );
        }

        const salaries = await calculateAllSalaries(
            new Date(startDate),
            new Date(endDate)
        );

        const csv = generateCSV(salaries);

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="salary-report-${startDate}-${endDate}.csv"`,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}
