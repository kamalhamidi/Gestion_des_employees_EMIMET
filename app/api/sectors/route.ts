import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sectorSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const sectors = await db.sector.findMany({
            include: {
                _count: {
                    select: { employees: true },
                },
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json(sectors);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch sectors" },
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
        const validated = sectorSchema.parse(json);

        const sector = await db.sector.create({
            data: validated,
        });

        return NextResponse.json(sector, { status: 201 });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Sector name already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create sector" },
            { status: 500 }
        );
    }
}
