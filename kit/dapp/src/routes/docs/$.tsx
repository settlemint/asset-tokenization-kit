import { docs } from "@/.source";
import * as AccordionComponents from "@/components/docs/components/accordion";
import * as BannerComponents from "@/components/docs/components/banner";
import * as CodeBlockComponents from "@/components/docs/components/codeblock";
import * as FilesComponents from "@/components/docs/components/files";
import { Mermaid } from "@/components/docs/components/mermaid";
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
import { useBreadcrumb } from "fumadocs-core/breadcrumb";
import type * as PageTree from "fumadocs-core/page-tree";
import { createClientLoader } from "fumadocs-mdx/runtime/vite";
import defaultMdxComponents from "fumadocs-ui/mdx";
import DOMPurify from "isomorphic-dompurify";
import { Home } from "lucide-react";
import { Fragment, useMemo, type ReactNode } from "react";

const ICON_ALLOWED_TAGS = [
  "svg",
  "path",
  "g",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
];

const ICON_ALLOWED_ATTRS = [
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
];

type DocsLoaderData = {
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
  loader: async ({ params }): Promise<DocsLoaderData> => {
    const slugs = params._splat?.split("/").filter(Boolean) ?? [];
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    const data: DocsLoaderData = {
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
  head: ({ loaderData }) => {
    const data = loaderData;
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
    const data = Route.useLoaderData();
    const tree = useDocsTree();

    const pageTitle = data.title;
    const pageDescription = data.description;

    return (
      <DocsPage toc={toc}>
        <div className="space-y-2">
          <DocsBreadcrumb tree={tree} />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight wrap-break-words">
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
  const tree = useDocsTree();

  return (
    <DocsLayout tree={tree}>
      <Content />
    </DocsLayout>
  );
}

function useDocsTree(): PageTree.Root {
  // Hydrate nav titles and sanitize icons once to keep server loader serializable
  return useMemo(() => transformPageTree(getDocsPageTreeRoot()), []);
}

function getDocsPageTreeRoot(): PageTree.Root {
  const tree = source.pageTree;
  if (isPageTreeRoot(tree)) {
    return tree;
  }
  if (tree && typeof tree === "object") {
    const localeTrees = Object.values(tree as Record<string, unknown>);
    const root = localeTrees.find((candidate): candidate is PageTree.Root =>
      isPageTreeRoot(candidate)
    );
    if (root) {
      return root;
    }
  }
  throw new Error("Unable to resolve docs page tree root");
}

function transformPageTree(root: PageTree.Root): PageTree.Root {
  const transformNode = (node: PageTree.Node): PageTree.Node => {
    if (node.type === "folder") {
      return transformFolder(node);
    }
    if (node.type === "page") {
      return transformPageNode(node);
    }
    return transformSeparator(node);
  };

  return {
    ...root,
    children: root.children.map((child) => transformNode(child)),
    fallback: root.fallback ? transformPageTree(root.fallback) : undefined,
  };
}

function transformFolder(folder: PageTree.Folder): PageTree.Folder {
  return {
    ...folder,
    icon:
      typeof folder.icon === "string" ? renderIcon(folder.icon) : folder.icon,
    index: folder.index ? transformPageNode(folder.index) : undefined,
    children: folder.children.map((child) => {
      if (child.type === "folder") return transformFolder(child);
      if (child.type === "page") return transformPageNode(child);
      return transformSeparator(child);
    }),
  };
}

function transformPageNode(item: PageTree.Item): PageTree.Item {
  let transformed: PageTree.Item = {
    ...item,
    icon: typeof item.icon === "string" ? renderIcon(item.icon) : item.icon,
  };

  if (item.url) {
    const page = source.getPage(getPageSlugsFromUrl(item.url));
    if (page?.data?.navTitle) {
      transformed = {
        ...transformed,
        name: page.data.navTitle,
      };
    }
  }

  return transformed;
}

function transformSeparator(separator: PageTree.Separator): PageTree.Separator {
  return {
    ...separator,
    icon:
      typeof separator.icon === "string"
        ? renderIcon(separator.icon)
        : separator.icon,
  };
}

function renderIcon(icon: string): ReactNode {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(icon, {
          ALLOWED_TAGS: ICON_ALLOWED_TAGS,
          ALLOWED_ATTR: ICON_ALLOWED_ATTRS,
        }),
      }}
    />
  );
}

function getPageSlugsFromUrl(url: string): string[] {
  return url
    .replace(/^\/?docs\/?/, "")
    .split("/")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

function isPageTreeRoot(value: unknown): value is PageTree.Root {
  if (!value || typeof value !== "object") return false;
  if (!("children" in value)) return false;
  const children = (value as { children?: unknown }).children;
  return Array.isArray(children);
}
