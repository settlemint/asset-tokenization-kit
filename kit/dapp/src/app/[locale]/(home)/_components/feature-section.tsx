"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Banknote,
  BarChart3,
  Building,
  Coins,
  FileText,
  Lock,
  Shield,
  Wallet,
} from "lucide-react";
import * as React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const FeatureCard = ({
  title,
  description,
  icon,
  className,
}: FeatureCardProps) => {
  return (
    <Card className={cn("h-full transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FeatureSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

const FeatureSection = React.forwardRef<HTMLDivElement, FeatureSectionProps>(
  ({ className, ...props }, ref) => {
    const assetFeatures = [
      {
        title: "StableCoins",
        description:
          "Fully collateralized digital currencies backed by real-world assets for stable value maintenance and secure transactions.",
        icon: <Coins className="h-6 w-6" />,
      },
      {
        title: "Bonds",
        description:
          "Digital representation of traditional fixed-income securities with maturity dates, yield distribution, and redemption mechanisms.",
        icon: <FileText className="h-6 w-6" />,
      },
      {
        title: "Equity Tokens",
        description:
          "Digital shares with voting rights and governance capabilities, supporting different equity classes and categories.",
        icon: <Building className="h-6 w-6" />,
      },
      {
        title: "Investment Funds",
        description:
          "Digital fund shares with automated fee management, supporting various fund types for simplified administration.",
        icon: <BarChart3 className="h-6 w-6" />,
      },
    ];

    const platformFeatures = [
      {
        title: "Intuitive Dashboard",
        description:
          "Comprehensive overview of all tokenized assets, transactions, and platform activities.",
        icon: <Wallet className="h-6 w-6" />,
      },
      {
        title: "Asset Management",
        description:
          "Create, issue, transfer, and manage digital assets through a user-friendly interface.",
        icon: <Banknote className="h-6 w-6" />,
      },
      {
        title: "Security & Compliance",
        description:
          "Role-based access control, compliance tools, and custodial support for institutional-grade security.",
        icon: <Shield className="h-6 w-6" />,
      },
      {
        title: "Smart Contract Templates",
        description:
          "Pre-built, audited contract templates for various asset types with multi-chain compatibility.",
        icon: <Lock className="h-6 w-6" />,
      },
    ];

    return (
      <section
        ref={ref}
        className={cn(
          "relative z-10 mx-auto max-w-7xl px-4 py-24 md:px-8",
          className
        )}
        {...props}
      >
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Complete Feature Set
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            The SettleMint Asset Tokenization Kit is a full-stack solution
            designed to accelerate the development of digital asset platforms.
          </p>
        </div>

        <div className="mb-16">
          <h3 className="mb-8 text-2xl font-semibold">Supported Asset Types</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {assetFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
          <div className="mt-4 text-center">
            <a
              href="https://github.com/settlemint/asset-tokenization-kit"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              View all supported asset types
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-8 text-2xl font-semibold">Platform Features</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
          <div className="mt-4 text-center">
            <a
              href="https://github.com/settlemint/asset-tokenization-kit"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Explore all platform features
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    );
  }
);

FeatureSection.displayName = "FeatureSection";

export { FeatureSection };
