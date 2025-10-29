// oxlint-disable no-namespace
// oxlint-disable jsx-pascal-case
import { docs } from "@/.source";
import * as AccordionComponents from "@/components/docs/components/accordion";
import * as BannerComponents from "@/components/docs/components/banner";
import * as CodeBlockComponents from "@/components/docs/components/codeblock";
import { DocsBreadcrumb } from "@/components/docs/components/docs-breadcrumb";
import * as FilesComponents from "@/components/docs/components/files";
import * as StepsComponents from "@/components/docs/components/steps";
import * as TabsComponents from "@/components/docs/components/tabs";
import { DocsLayout } from "@/components/docs/docs";
import { DocsBody, DocsPage } from "@/components/docs/page";
import { source } from "@/lib/source";
import { seo } from "@atk/config/metadata";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type * as PageTree from "fumadocs-core/page-tree";
import { createClientLoader } from "fumadocs-mdx/runtime/vite";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { lazy, Suspense, useMemo } from "react";

const Mermaid = lazy(() =>
  import("@/components/docs/components/mermaid").then((mod) => ({
    default: mod.Mermaid,
  }))
);

function MermaidWithSuspense(props: { chart: string }) {
  return (
    <Suspense
      fallback={
        <div className="h-32 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-4 text-center text-gray-400">
          Loading diagram...
        </div>
      }
    >
      <Mermaid {...props} />
    </Suspense>
  );
}

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await loader({ data: slugs });
    const {
      frontmatter: { title, description, keywords },
    } = await clientLoader.preload(data.path);
    return {
      frontmatter: { title, description, keywords, splat: params._splat },
      data,
    };
  },
  head: ({ loaderData }) => {
    const { title, description, keywords, splat } = loaderData?.frontmatter ?? {
      title: undefined,
      description: undefined,
      keywords: undefined,
    };
    return {
      meta: [
        ...seo({
          title: title ?? "Documentation",
          description,
          keywords,
        }),
      ],
      links: [
        {
          rel: "alternate",
          type: "text/markdown",
          title: "View in Markdown",
          href: `/docs/${splat}.mdx`,
        },
      ],
    };
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
    };
  });

const clientLoader = createClientLoader(docs.doc, {
  id: "docs",
  component({ toc, frontmatter, default: MDX }) {
    const { data } = Route.useLoaderData();
    return (
      <DocsPage toc={toc} path={data.path}>
        <div className="space-y-2">
          <DocsBreadcrumb includeRoot={{ url: "/docs" }} includeSeparator />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight wrap-break-words">
                {frontmatter.pageTitle ?? frontmatter.title}
              </h1>
            </div>
          </div>
        </div>
        <div>
          <p className="italic mt-2 wrap-break-words">
            {frontmatter.description}
          </p>
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
              Mermaid: MermaidWithSuspense,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const { data } = Route.useLoaderData();
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
