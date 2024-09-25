import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = request.nextUrl.searchParams.get("name") || "file";
    const uploadDir = request.nextUrl.searchParams.get("uploadDir") || "uploads";
    const id = request.nextUrl.searchParams.get("id");
    const file = formData.get(name) as File | null;

    console.log("FILE", file);
    console.log("NAME", name);
    console.log("UPLOADDIR", uploadDir);
    console.log("ID", id);

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadPath = join(process.cwd(), uploadDir);
    await mkdir(uploadPath, { recursive: true });

    const fileName = file.name;
    const filePath = join(uploadPath, fileName);

    await writeFile(filePath, buffer);
    console.log(`File saved to ${filePath}`);
    return NextResponse.json({ message: "File uploaded successfully", id }, { status: 200 });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json({ error: "Error processing upload" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Upload API is working" });
}
