import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { functionSchema } from "@/lib/validations";
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
        const validated = functionSchema.parse(json);

        const func = await db.function.update({
            where: { id: params.id },
            data: validated,
        });

        return NextResponse.json(func);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update function" },
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

        await db.function.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === "P2003") {
            return NextResponse.json(
                { error: "Cannot delete function with assigned employees" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to delete function" },
            { status: 500 }
        );
    }
}
