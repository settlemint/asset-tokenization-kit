import { CreateMultipartUploadCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request): Promise<NextResponse<ActionResponse>> {
  try {
    const { fileName, fileType } = await request.json();

    const command = new CreateMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });
    console.log("command", command);
    const { UploadId } = await s3Client.send(command);
    console.log("UploadId", UploadId);
    // Construct the tus upload URL
    const encodedFileName = encodeURIComponent(fileName);
    const uploadUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedFileName}?uploadId=${UploadId}`;
    console.log("UPLOADURL", uploadUrl);
    return NextResponse.json({ success: true, data: { uploadUrl } });
  } catch (error) {
    console.error("Error generating tus upload URL:", error);
    return NextResponse.json({ success: false, error: "Failed to generate upload URL" }, { status: 500 });
  }
}
