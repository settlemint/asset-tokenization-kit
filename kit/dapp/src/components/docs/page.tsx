"use client";

import { Button } from "@/components/ui/button";
import { Link, usePathname } from "fumadocs-core/framework";
import type * as PageTree from "fumadocs-core/page-tree";
import {
  AnchorProvider,
  type TOCItemType,
  useActiveAnchors,
} from "fumadocs-core/toc";
import { useTreeContext } from "fumadocs-ui/contexts/tree";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo } from "react";
import { cn } from "../../lib/cn";

export interface DocsPageProps {
  toc?: TOCItemType[];

  children: ReactNode;
}

export function DocsPage({ toc = [], ...props }: DocsPageProps) {
  return (
    <AnchorProvider toc={toc}>
      <div className="flex w-full min-w-0 flex-row h-full ">
        <main className="flex flex-1 min-w-0 flex-col overflow-y-auto">
          <article className="flex flex-1 flex-col w-full gap-6 px-4 py-8 md:px-6">
            {props.children}
            <Footer />
          </article>
        </main>
        {toc.length > 0 && (
          <aside className="sticky top-0 w-[286px] shrink-0 h-[calc(100vh-64px)] p-4 overflow-y-auto max-xl:hidden">
            <p className="text-sm text-fd-muted-foreground mb-2">
              On this page
            </p>
            <div className="flex flex-col">
              {toc.map((item) => (
                <TocItem key={item.url} item={item} />
              ))}
            </div>
          </aside>
        )}
      </div>
    </AnchorProvider>
  );
}

export function DocsBody(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("prose", props.className)}>
      {props.children}
    </div>
  );
}

function TocItem({ item }: { item: TOCItemType }) {
  const isActive = useActiveAnchors().includes(item.url.slice(1));

  return (
    <a
      href={item.url}
      className={cn(
        "text-sm text-fd-foreground/80 py-1",
        isActive && "text-fd-primary"
      )}
      style={{
        paddingLeft: Math.max(0, item.depth - 2) * 16,
      }}
    >
      {item.title}
    </a>
  );
}

function Footer() {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const flatten = useMemo(() => {
    const result: PageTree.Item[] = [];

    function scan(items: PageTree.Node[]) {
      for (const item of items) {
        if (item.type === "page") result.push(item);
        else if (item.type === "folder") {
          if (item.index) result.push(item.index);
          scan(item.children);
        }
      }
    }

    scan(root.children);
    return result;
  }, [root]);

  const { previous, next } = useMemo(() => {
    const idx = flatten.findIndex((item) => item.url === pathname);

    if (idx === -1) return {};
    return {
      previous: flatten[idx - 1],
      next: flatten[idx + 1],
    };
  }, [flatten, pathname]);

  return (
    <div className="flex flex-row justify-between gap-4 mt-8 pt-8 border-t">
      {previous ? (
        <Button
          variant="outline"
          size="lg"
          asChild
          className="flex-1 justify-start"
        >
          <Link href={previous.url}>
            <ChevronLeft className="size-4" />
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-medium">{previous.name}</span>
            </div>
          </Link>
        </Button>
      ) : (
        <div />
      )}
      {next ? (
        <Button
          variant="outline"
          size="lg"
          asChild
          className="flex-1 justify-end"
        >
          <Link href={next.url}>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-medium">{next.name}</span>
            </div>
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}
