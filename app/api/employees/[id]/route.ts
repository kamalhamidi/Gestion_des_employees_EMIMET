import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employeeSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const employee = await db.employee.findUnique({
            where: { id: params.id },
            include: {
                sector: true,
                function: true,
                workdays: {
                    orderBy: { date: "desc" },
                    take: 10,
                },
            },
        });

        if (!employee || employee.isDeleted) {
            return NextResponse.json(
                { error: "Employee not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(employee);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch employee" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await request.json();

        // Check if this is a partial update (e.g., just advance amount)
        const isPartialUpdate = Object.keys(json).length < 5;

        let updateData: any = {};

        if (isPartialUpdate) {
            // For partial updates, only validate and update the fields provided
            if (json.advanceAmount !== undefined) {
                updateData.advanceAmount = parseFloat(json.advanceAmount);
            }
            if (json.dailySalary !== undefined) {
                updateData.dailySalary = parseFloat(json.dailySalary);
            }
            if (json.employmentStatus !== undefined) {
                updateData.employmentStatus = json.employmentStatus;
            }
            if (json.notes !== undefined) {
                updateData.notes = json.notes;
            }
        } else {
            // For full updates, validate with schema
            const validated = employeeSchema.parse(json);
            updateData = {
                ...validated,
                dateOfBirth: new Date(validated.dateOfBirth),
                joinDate: new Date(validated.joinDate),
            };
        }

        const employee = await db.employee.update({
            where: { id: params.id },
            data: updateData,
            include: {
                sector: true,
                function: true,
            },
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error("Update employee error:", error);
        return NextResponse.json(
            { error: "Failed to update employee" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Soft delete
        await db.employee.update({
            where: { id: params.id },
            data: { isDeleted: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete employee" },
            { status: 500 }
        );
    }
}
