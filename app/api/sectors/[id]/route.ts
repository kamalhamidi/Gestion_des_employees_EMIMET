import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sectorSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

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
        const validated = sectorSchema.parse(json);

        const sector = await db.sector.update({
            where: { id: params.id },
            data: validated,
        });

        return NextResponse.json(sector);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update sector" },
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

        await db.sector.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === "P2003") {
            return NextResponse.json(
                { error: "Cannot delete sector with assigned employees" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to delete sector" },
            { status: 500 }
        );
    }
}
