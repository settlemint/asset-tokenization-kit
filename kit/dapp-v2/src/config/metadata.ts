export const metadata = {
  title: `Asset Tokenization Kit | SettleMint`,
  description: "SettleMint",
  twitter: "@settlemintcom",
  keywords: [
    "Asset Tokenization",
    "SettleMint",
    "Tokenization",
    "Asset Tokenization Kit",
    "Digital Assets",
    "SMART protocol",
    "ERC-3643",
    "Bonds",
    "Stablecoins",
    "Funds",
    "Deposits",
    "Equity",
  ],
  og: "/og.png",
};

export const seo = ({
  title,
  description,
  keywords,
  image,
}: {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
}) => {
  const resolvedTitle = title ? `${title} | ${metadata.title}` : metadata.title;
  const resolvedDescription = description ?? metadata.description;
  const resolvedImage = image ?? metadata.og;
  const resolvedKeywords = [...metadata.keywords, ...(keywords ?? [])].join(
    ", "
  );

  const tags = [
    { title: resolvedTitle },
    { name: "description", content: resolvedDescription },
    { name: "keywords", content: resolvedKeywords },
    { name: "twitter:title", content: resolvedTitle },
    { name: "twitter:description", content: resolvedDescription },
    { name: "twitter:creator", content: metadata.twitter },
    { name: "twitter:site", content: metadata.twitter },
    { name: "og:type", content: "website" },
    { name: "og:title", content: resolvedTitle },
    { name: "og:description", content: resolvedDescription },
    ...(image
      ? [
          { name: "twitter:image", content: resolvedImage },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "og:image", content: resolvedImage },
        ]
      : []),
  ];

  return tags;
};
