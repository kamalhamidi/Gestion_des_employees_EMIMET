import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { functionSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const functions = await db.function.findMany({
            include: {
                _count: {
                    select: { employees: true },
                },
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json(functions);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch functions" },
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
        const validated = functionSchema.parse(json);

        const func = await db.function.create({
            data: validated,
        });

        return NextResponse.json(func, { status: 201 });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Function name already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create function" },
            { status: 500 }
        );
    }
}
