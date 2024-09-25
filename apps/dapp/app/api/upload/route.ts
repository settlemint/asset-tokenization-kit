import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path, { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

interface UploadResult {
  // Define the structure of your upload result here
  url: string;
  // Add other properties as needed
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = request.nextUrl.searchParams.get("name") || "file";
    const uploadDir = request.nextUrl.searchParams.get("uploadDir") || "uploads";
    const id = request.nextUrl.searchParams.get("id");
    const file = formData.get(name) as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const filePromises: Promise<UploadResult>[] = [];
    formData.forEach(async (value, key) => {
      if (value instanceof File) {
        const file = value;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadPath = join(process.cwd(), uploadDir);
        const fileNameWithId = id ? `${path.parse(file.name).name}_${id}${path.parse(file.name).ext}` : file.name;
        const filePath = join(uploadPath, fileNameWithId);
        filePromises.push(
          writeFile(filePath, buffer).then(() => ({
            fileName: fileNameWithId,
            path: filePath,
            url: `/${uploadDir}/${fileNameWithId}`,
          })),
        );
      }
    });

    await Promise.all(filePromises);

    return NextResponse.json({ message: "File uploaded successfully", id }, { status: 200 });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json({ error: "Error processing upload" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "uploads");

    // Ensure the directory exists
    await mkdir(uploadDir, { recursive: true });

    // Read the contents of the directory
    const files = await readdir(uploadDir);
    if (files.length === 0) {
      return NextResponse.json({ message: "No files found" }, { status: 404 });
    }

    // Map the file names to objects with more information
    const fileList = await Promise.all(
      files.map(async (fileName: string) => {
        const filePath = path.join(uploadDir, fileName);
        try {
          const stats = await stat(filePath);
          const [name, id] = fileName.split("_");
          return {
            id: id || undefined,
            name: name,
            size: stats.size,
            lastModified: stats.mtime,
            url: `/uploads/${fileName}`,
          };
        } catch (error) {
          console.error("Error getting file stats:", error);
          throw new Error("Failed to retrieve file information");
        }
      }),
    );

    return NextResponse.json({ files: fileList });
  } catch (error) {
    console.error("Error retrieving file list:", error);
    return NextResponse.json({ error: "Failed to retrieve file list" }, { status: 500 });
  }
}
