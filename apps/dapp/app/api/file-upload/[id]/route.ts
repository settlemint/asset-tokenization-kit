import { listenToUploadProgress } from "@/actions/upload.action";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      const removeListener = await listenToUploadProgress(id, (progress) => {
        const data = encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`);
        controller.enqueue(data);

        if (progress >= 100) {
          removeListener();
          controller.close();
        }
      });

      // Cleanup function
      return () => {
        removeListener();
      };
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
