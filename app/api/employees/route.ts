import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employeeSchema } from "@/lib/validations";
import { generateEmployeeId } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const search = searchParams.get("search") || "";
        const sectorId = searchParams.get("sectorId") || "";
        const functionId = searchParams.get("functionId") || "";
        const status = searchParams.get("status") || "";
        const limit = 20;

        const where: any = { isDeleted: false };

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { cin: { contains: search, mode: "insensitive" } },
                { employeeId: { contains: search, mode: "insensitive" } },
            ];
        }

        if (sectorId) where.sectorId = sectorId;
        if (functionId) where.functionId = functionId;
        if (status) where.employmentStatus = status;

        const [employees, total] = await Promise.all([
            db.employee.findMany({
                where,
                include: {
                    sector: true,
                    function: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db.employee.count({ where }),
        ]);

        return NextResponse.json({
            employees,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch employees" },
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
        const validated = employeeSchema.parse(json);

        const employee = await db.employee.create({
            data: {
                ...validated,
                employeeId: generateEmployeeId(),
                dateOfBirth: new Date(validated.dateOfBirth),
                joinDate: new Date(validated.joinDate),
            },
            include: {
                sector: true,
                function: true,
            },
        });

        return NextResponse.json(employee, { status: 201 });
    } catch (error: any) {
        // Handle Zod validation errors
        if (error.name === "ZodError") {
            const fieldErrors = error.errors.map((err: any) => ({
                field: err.path.join("."),
                message: err.message,
            }));
            return NextResponse.json(
                {
                    error: fieldErrors[0]?.message || "Validation failed",
                    details: fieldErrors.map((f: any) => `${f.field}: ${f.message}`).join(", "),
                    fields: fieldErrors
                },
                { status: 400 }
            );
        }

        // Handle unique constraint violation (duplicate CIN)
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "CIN already exists. Please use a different CIN number." },
                { status: 400 }
            );
        }

        // Generic error
        console.error("Employee creation error:", error);
        return NextResponse.json(
            { error: "Failed to create employee. Please try again." },
            { status: 500 }
        );
    }
}
