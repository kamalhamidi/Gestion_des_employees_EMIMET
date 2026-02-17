import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workdaySchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const where: any = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const workdays = await db.workday.findMany({
            where,
            include: {
                employee: {
                    include: {
                        sector: true,
                        function: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(workdays);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch workdays" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await request.json();
        const validated = workdaySchema.parse(json);

        const workday = await db.workday.create({
            data: {
                date: new Date(validated.date),
                employeeId: validated.employeeId,
                multiplier: validated.multiplier,
            },
            include: {
                employee: true,
            },
        });

        return NextResponse.json(workday, { status: 201 });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Workday already exists for this employee on this date" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create workday" },
            { status: 500 }
        );
    }
}
