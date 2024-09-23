import { getUploadProgress } from "@/actions/upload.action";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  console.log("params", params);

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      let progress = 0;
      const interval = setInterval(async () => {
        progress = await getUploadProgress(id);
        const data = encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`);
        controller.enqueue(data);

        if (progress >= 100) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      // Clean up on abort
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
