import { docs } from "@/.source";
import * as AccordionComponents from "@/components/docs/components/accordion";
import * as BannerComponents from "@/components/docs/components/banner";
import * as CodeBlockComponents from "@/components/docs/components/codeblock";
import { DocsBreadcrumb } from "@/components/docs/components/docs-breadcumb";
import * as FilesComponents from "@/components/docs/components/files";
import { Mermaid } from "@/components/docs/components/mermaid";
import * as StepsComponents from "@/components/docs/components/steps";
import * as TabsComponents from "@/components/docs/components/tabs";
import { DocsLayout } from "@/components/docs/docs";
import { LLMCopyButton, ViewOptions } from "@/components/docs/open-in-dropdown";
import { DocsBody, DocsPage } from "@/components/docs/page";
import { source } from "@/lib/source";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type * as PageTree from "fumadocs-core/page-tree";
import { createClientLoader } from "fumadocs-mdx/runtime/vite";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { useMemo } from "react";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await loader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

const loader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      tree: source.pageTree as object,
      path: page.path,
      url: page.url,
    };
  });

const clientLoader = createClientLoader(docs.doc, {
  id: "docs",
  component({ toc, frontmatter, default: MDX }) {
    const data = Route.useLoaderData();
    return (
      <DocsPage toc={toc}>
        <div className="space-y-2">
          <DocsBreadcrumb includeRoot={{ url: "/docs" }} includeSeparator />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight wrap-break-words">
                {frontmatter.title}
              </h1>
              {frontmatter.description && (
                <p className="text-sm text-fd-muted-foreground font-light tracking-normal mt-2 wrap-break-words">
                  {frontmatter.description}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <LLMCopyButton markdownUrl={data.path} className="w-full" />
              <ViewOptions
                markdownUrl={`/docs/${data.path}`}
                githubUrl={`https://github.com/settlemint/asset-tokenization-kit/blob/main/kit/dapp/content/docs/${data.path}`}
                className="w-full"
              />
            </div>
          </div>
        </div>
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
              ...TabsComponents,
              ...AccordionComponents,
              ...BannerComponents,
              ...CodeBlockComponents,
              ...FilesComponents,
              ...StepsComponents,
              Mermaid,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = Route.useLoaderData();
  const Content = clientLoader.getComponent(data.path);
  const tree = useMemo(
    () => transformPageTree(data.tree as PageTree.Folder),
    [data.tree]
  );

  return (
    <DocsLayout tree={tree}>
      <Content />
    </DocsLayout>
  );
}

function transformPageTree(tree: PageTree.Folder): PageTree.Folder {
  console.log(tree);
  function transform<T extends PageTree.Item | PageTree.Separator>(item: T) {
    if (typeof item.icon !== "string") return item;

    return {
      ...item,
      icon: (
        <span
          dangerouslySetInnerHTML={{
            __html: item.icon,
          }}
        />
      ),
    };
  }

  return {
    ...tree,
    index: tree.index ? transform(tree.index) : undefined,
    children: tree.children.map((item) => {
      if (item.type === "folder") return transformPageTree(item);
      return transform(item);
    }),
  };
}
