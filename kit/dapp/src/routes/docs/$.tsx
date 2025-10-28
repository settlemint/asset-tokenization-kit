import { docs } from "@/.source";
import * as AccordionComponents from "@/components/docs/components/accordion";
import * as BannerComponents from "@/components/docs/components/banner";
import * as CodeBlockComponents from "@/components/docs/components/codeblock";
import * as FilesComponents from "@/components/docs/components/files";
import * as StepsComponents from "@/components/docs/components/steps";
import * as TabsComponents from "@/components/docs/components/tabs";
import { DocsLayout } from "@/components/docs/docs";
import { LLMCopyButton, ViewOptions } from "@/components/docs/open-in-dropdown";
import { DocsBody, DocsPage } from "@/components/docs/page";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { source } from "@/lib/source";
import {
  createFileRoute,
  Link,
  notFound,
  useLocation,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useBreadcrumb } from "fumadocs-core/breadcrumb";
import type * as PageTree from "fumadocs-core/page-tree";
import { createClientLoader } from "fumadocs-mdx/runtime/vite";
import defaultMdxComponents from "fumadocs-ui/mdx";
import DOMPurify from "isomorphic-dompurify";
import { Home } from "lucide-react";
import { Fragment, useMemo } from "react";

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
      slugs,
    };
  });

function DocsBreadcrumb({ tree }: { tree: PageTree.Root }) {
  const location = useLocation();
  const docsItems = useBreadcrumb(location.pathname, tree);

  const items = useMemo(() => {
    const breadcrumbs = [
      { name: "home", url: "/" },
      { name: "Documentation", url: "/docs" },
      ...docsItems,
    ];
    return breadcrumbs;
  }, [docsItems]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={index}>
              <BreadcrumbItem className="text-xs">
                {isLast ? (
                  <BreadcrumbPage>
                    {item.name === "home" ? (
                      <Home className="h-3 w-3" />
                    ) : (
                      item.name
                    )}
                  </BreadcrumbPage>
                ) : item.url ? (
                  <BreadcrumbLink asChild className="text-xs">
                    <Link
                      to={item.url}
                      aria-label={item.name === "home" ? "Home" : undefined}
                    >
                      {item.name === "home" ? (
                        <Home className="h-3 w-3" />
                      ) : (
                        item.name
                      )}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    {item.name === "home" ? (
                      <Home className="h-3 w-3" />
                    ) : (
                      item.name
                    )}
                  </span>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const clientLoader = createClientLoader(docs.doc, {
  id: "docs",
  component({ toc, frontmatter, default: MDX }) {
    const data = Route.useLoaderData();
    const tree = useMemo(
      () => transformPageTree(data.tree as PageTree.Folder),
      [data.tree]
    );

    return (
      <DocsPage toc={toc}>
        <div className="space-y-2">
          <DocsBreadcrumb tree={tree} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight">
                {frontmatter.title}
                {frontmatter.description && (
                  <div className="text-sm text-fd-muted-foreground font-light tracking-normal">
                    {frontmatter.description}
                  </div>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <LLMCopyButton markdownUrl={data.path} />
              <ViewOptions
                markdownUrl={`/docs/${data.path}`}
                githubUrl={`https://github.com/settlemint/asset-tokenization-kit/blob/main/kit/dapp/content/docs/${data.path}`}
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
  function transform<T extends PageTree.Item | PageTree.Separator>(item: T) {
    if (typeof item.icon !== "string") return item;

    return {
      ...item,
      icon: (
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(item.icon, {
              ALLOWED_TAGS: [
                "svg",
                "path",
                "g",
                "circle",
                "rect",
                "line",
                "polyline",
                "polygon",
              ],
              ALLOWED_ATTR: [
                "viewBox",
                "fill",
                "stroke",
                "stroke-width",
                "d",
                "cx",
                "cy",
                "r",
                "x",
                "y",
                "width",
                "height",
                "points",
                "x1",
                "y1",
                "x2",
                "y2",
                "class",
              ],
            }),
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
