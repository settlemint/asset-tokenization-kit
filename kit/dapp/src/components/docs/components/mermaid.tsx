"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

type RenderResult = {
  svg: string;
  bindFunctions?: (container: HTMLElement) => void;
};

type MermaidLike = {
  initialize?: (config: Record<string, unknown>) => void;
  render?: (
    id: string,
    chart: string,
    container?: HTMLElement
  ) => Promise<RenderResult>;
  mermaidAPI?: {
    initialize: (config: Record<string, unknown>) => void;
    render: (
      id: string,
      chart: string,
      container?: HTMLElement
    ) => Promise<RenderResult>;
  };
};

export function Mermaid({ chart }: { chart: string }) {
  return <MermaidContent chart={chart} />;
}

let mermaidPromise: Promise<unknown> | null = null;
let mermaidInitialized = false;

function MermaidContent({ chart }: { chart: string }) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<string>("");
  const errorRef = useRef<string | null>(null);
  const chartIdRef = useRef<string>("");

  useEffect(() => {
    // Update refs when state changes
    svgRef.current = svg;
    errorRef.current = error;
  }, [svg, error]);

  useEffect(() => {
    // Skip rendering on server
    if (globalThis.window === undefined) {
      return;
    }

    // Generate a stable ID based on chart content
    const chartId = `mermaid-${chart.slice(0, 20).replaceAll(/[^a-z0-9]/gi, "-")}`;
    chartIdRef.current = chartId;

    const theme = resolvedTheme === "dark" ? "dark" : "default";

    let cancelled = false;

    async function loadAndRender() {
      try {
        // Only import mermaid once
        if (!mermaidPromise) {
          mermaidPromise = import("mermaid");
        }

        const baseModule = (await mermaidPromise) as { default?: unknown };
        let libCandidate: MermaidLike | undefined = baseModule?.default as
          | MermaidLike
          | undefined;

        // Fallback import path for some bundlers/environments
        if (
          !libCandidate ||
          (typeof libCandidate.render !== "function" &&
            !libCandidate.mermaidAPI)
        ) {
          const altPath = "mermaid/dist/mermaid.esm.mjs" as string;
          const altModule = (await import(/* @vite-ignore */ altPath)) as {
            default?: unknown;
          };
          libCandidate = altModule.default as MermaidLike | undefined;
        }

        if (cancelled || !libCandidate) return;

        const lib: MermaidLike = libCandidate.render
          ? libCandidate
          : (libCandidate.mermaidAPI ?? ({} as MermaidLike));
        if (!lib.render || !lib.initialize) {
          setError("Mermaid library did not expose a render API");
          return;
        }

        if (!mermaidInitialized) {
          lib.initialize({
            startOnLoad: false,
            securityLevel: "loose",
            fontFamily: "inherit",
            themeCSS: "margin: 1.5rem auto 0;",
            theme,
            flowchart: { htmlLabels: true },
          });
          mermaidInitialized = true;
        }

        // Use a temporary container attached to the DOM to ensure measurements work
        const tempContainer = globalThis.document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-99999px";
        tempContainer.style.top = "-99999px";
        globalThis.document.body.append(tempContainer);

        const chartText = chart.trim();
        const result = await lib.render(chartId, chartText, tempContainer);

        // Clean up temporary container
        tempContainer.remove();

        if (cancelled || !result) {
          if (!result) setError("Mermaid render returned no result");
          return;
        }
        setSvg(result.svg);
        if (containerRef.current && result.bindFunctions) {
          result.bindFunctions(containerRef.current);
        }
      } catch (error_) {
        if (cancelled) return;
        setError(error_ instanceof Error ? error_.message : String(error_));
      }
    }

    void loadAndRender();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!svgRef.current && !errorRef.current) {
        setError("Chart rendering timed out");
      }
    }, 10_000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [chart, resolvedTheme]);

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        Error rendering chart: {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="h-32 bg-gray-50 border border-gray-200 rounded p-4 text-center text-gray-400">
        Rendering chart...
      </div>
    );
  }

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: svg }} />;
}
