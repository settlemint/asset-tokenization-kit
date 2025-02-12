import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => <h3 className="scroll-m-20 font-semibold text-2xl tracking-tight first:mt-0">{children}</h3>,
    h4: ({ children }) => <h4 className="scroll-m-20 font-semibold text-xl tracking-tight first:mt-0">{children}</h4>,
    p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-4">{children}</p>,
    blockquote: ({ children }) => <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>,
    table: ({ children }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">{children}</table>
      </div>
    ),
    tr: ({ children }) => <tr className="m-0 border-t p-0 even:bg-muted">{children}</tr>,
    th: ({ children }) => (
      <td className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    ),
    td: ({ children }) => (
      <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    ),
    ul: ({ children }) => <ul className="ml-6 list-disc [&>li]:mt-2">{children}</ul>,
    ol: ({ children }) => <ol className="ml-6 list-decimal [&>li]:mt-2">{children}</ol>,
    li: ({ children }) => <li className="mt-2">{children}</li>,
    lead: ({ children }) => <p className="text-muted-foreground text-xl">{children}</p>,
    large: ({ children }) => <p className="font-semibold text-lg">{children}</p>,
    small: ({ children }) => <small className="font-medium text-sm leading-none">{children}</small>,
    muted: ({ children }) => <p className="text-muted-foreground text-sm">{children}</p>,
    img: ({ src, alt }) => <Image src={src} alt={alt} width={1000} height={1000} className="mx-auto max-w-full" />,
    figure: ({ children }) => <figure className="w-full rounded-lg border bg-muted p-4">{children}</figure>,
    a: ({ children, href }) => (
      <Link href={href} className="font-semibold underline">
        {children}
      </Link>
    ),
    ...components,
  };
}
