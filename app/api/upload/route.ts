import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
];
const ALLOWED_DOC_TYPES = ["application/pdf"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];
        const type = (formData.get("type") as string) || "general";

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "No files provided" },
                { status: 400 }
            );
        }

        // Validate files
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    {
                        error: `File "${file.name}" exceeds maximum size of 5MB`,
                    },
                    { status: 400 }
                );
            }
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    {
                        error: `File "${file.name}" has unsupported type. Allowed: JPG, PNG, WebP, PDF`,
                    },
                    { status: 400 }
                );
            }
        }

        // Ensure upload directory exists
        const uploadDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            type
        );
        await mkdir(uploadDir, { recursive: true });

        const savedPaths: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            const ext = path.extname(file.name) || getExtFromType(file.type);
            const safeName = file.name
                .replace(ext, "")
                .replace(/[^a-zA-Z0-9-_]/g, "_")
                .substring(0, 50);
            const filename = `${timestamp}-${random}-${safeName}${ext}`;

            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            // Return the public URL path
            savedPaths.push(`/uploads/${type}/${filename}`);
        }

        return NextResponse.json({ paths: savedPaths });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload files" },
            { status: 500 }
        );
    }
}

function getExtFromType(mimeType: string): string {
    const map: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "application/pdf": ".pdf",
    };
    return map[mimeType] || "";
}
