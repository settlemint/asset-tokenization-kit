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
import { seo } from "@atk/config/metadata";
import {
  createFileRoute,
  Link,
  notFound,
  useLocation,
} from "@tanstack/react-router";
import DOMPurify from "isomorphic-dompurify";
import { useBreadcrumb } from "fumadocs-core/breadcrumb";
import type * as PageTree from "fumadocs-core/page-tree";
import { createClientLoader } from "fumadocs-mdx/runtime/vite";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Home } from "lucide-react";
import { Fragment, useMemo } from "react";

type DocsLoaderData = {
  tree: object;
  path: string;
  slugs: string[];
  title: string;
  navTitle?: string;
  description?: string;
  keywords?: string[];
  image?: string;
};

export const Route = createFileRoute("/docs/$")({
  component: Page,
  head: ({ loaderData }) => {
    const data = loaderData as DocsLoaderData | undefined;
    if (data) {
      return {
        meta: seo({
          title: data.title,
          description: data.description,
          keywords: data.keywords,
          image: data.image,
        }),
      };
    }
    return {
      meta: seo({ title: "Documentation" }),
    };
  },
  // @ts-expect-error - TanStack Router has difficulty inferring deeply nested generic types with fumadocs
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    const data = {
      tree: source.pageTree,
      path: page.path,
      slugs,
      title: page.data.title,
      navTitle: page.data.navTitle,
      description: page.data.description,
      keywords: page.data.keywords,
      image: page.data.image,
    };

    await clientLoader.preload(data.path);
    return data;
  },
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
  component({ toc, default: MDX }) {
    const data = Route.useLoaderData() as DocsLoaderData;
    const tree = useMemo(
      () => transformPageTree(data.tree as PageTree.Folder),
      [data.tree]
    );

    // Use full title for page display
    const pageTitle = data.title;
    const pageDescription = data.description;

    return (
      <DocsPage toc={toc}>
        <div className="space-y-2">
          <DocsBreadcrumb tree={tree} />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight break-words">
                {pageTitle}
              </h1>
              {pageDescription && (
                <p className="text-sm text-fd-muted-foreground font-light tracking-normal mt-2 break-words">
                  {pageDescription}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
  const data = Route.useLoaderData() as DocsLoaderData;
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
  function transformItem<T extends PageTree.Item | PageTree.Separator>(
    item: T
  ): T {
    let transformed = { ...item };

    // Use navTitle for navigation if available (only for page items with URLs)
    if (item.type === "page" && "url" in item && item.url) {
      const slugs = item.url
        .replace("/docs/", "")
        .replace(/^\//, "")
        .split("/")
        .filter(Boolean);
      const page = source.getPage(slugs);
      if (page?.data?.navTitle) {
        transformed = {
          ...transformed,
          name: page.data.navTitle,
        };
      }
    }

    // Transform icon if it's a string
    if (typeof item.icon !== "string") return transformed;

    return {
      ...transformed,
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
    } as T;
  }

  function transformFolder(folder: PageTree.Folder): PageTree.Folder {
    return {
      ...folder,
      index: folder.index ? transformItem(folder.index) : undefined,
      children: folder.children.map((item) => {
        if (item.type === "folder") return transformFolder(item);
        if (item.type === "page") return transformItem(item);
        if (item.type === "separator") return transformItem(item);
        return item;
      }),
    };
  }

  return transformFolder(tree);
}
