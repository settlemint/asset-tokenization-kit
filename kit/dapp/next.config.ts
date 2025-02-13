import createMDX from '@next/mdx';
import { withSettleMint } from '@settlemint/sdk-next/config/with-settlemint';
import type { NextConfig } from 'next';
import rehypeMermaid from 'rehype-mermaid';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    unoptimized: false,
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    inlineCss: true,
    reactCompiler: true,
  },
  output: 'standalone',
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkFrontmatter, [remarkMdxFrontmatter, { name: 'metadata' }]],
    rehypePlugins: [
      [rehypeMermaid, { strategy: 'img-svg', dark: true }],
      [
        rehypePrettyCode,
        {
          theme: {
            dark: 'catppuccin-macchiato',
            light: 'catppuccin-latte',
          },
          keepBackground: false,
        },
      ],
    ],
  },
});

export default withSettleMint(withMDX(nextConfig));
