import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const advanceSchema = z.object({
    amount: z.number().positive(),
    notes: z.string().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const advances = await db.advanceLog.findMany({
            where: { employeeId: params.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(advances);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch advances" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await request.json();
        const validated = advanceSchema.parse(json);

        // Create advance log
        const advanceLog = await db.advanceLog.create({
            data: {
                employeeId: params.id,
                amount: validated.amount,
                notes: validated.notes,
                createdBy: session.user.name,
            },
        });

        // Update employee's total advance amount
        const employee = await db.employee.findUnique({
            where: { id: params.id },
            select: { advanceAmount: true },
        });

        await db.employee.update({
            where: { id: params.id },
            data: {
                advanceAmount: (employee?.advanceAmount || 0) + validated.amount,
            },
        });

        return NextResponse.json(advanceLog);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Failed to create advance:", error);
        return NextResponse.json(
            { error: "Failed to create advance" },
            { status: 500 }
        );
    }
}
