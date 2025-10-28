import { getLLMText } from "@/components/docs/get-llm-text";
import { source } from "@/lib/source";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const scan = source.getPages().map((page) => getLLMText(page));
        const scanned = await Promise.all(scan);
        return new Response(scanned.join("\n\n"), {
          headers: {
            "Content-Type": "text/markdown",
          },
          status: 200,
        });
      },
    },
  },
});
