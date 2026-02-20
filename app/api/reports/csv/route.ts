import { NextRequest, NextResponse } from "next/server";
import { calculateDetailedSalaries } from "@/lib/salary";
import { generateDetailedCSV } from "@/lib/csv";
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

        const salaries = await calculateDetailedSalaries(
            new Date(startDate),
            new Date(endDate)
        );

        const csv = generateDetailedCSV(salaries, startDate, endDate);

        // Add UTF-8 BOM for proper Excel display of French characters
        const BOM = "\uFEFF";

        return new NextResponse(BOM + csv, {
            headers: {
                "Content-Type": "text/csv;charset=utf-8",
                "Content-Disposition": `attachment; filename="rapport-salaire-${startDate}-${endDate}.csv"`,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}
