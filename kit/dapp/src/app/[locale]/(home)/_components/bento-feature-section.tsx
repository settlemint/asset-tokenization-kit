"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Banknote, BarChart3, Building, Coins, FileText, Lock, Shield, Wallet } from "lucide-react";
import * as React from "react";

interface BentoFeatureProps extends React.HTMLAttributes<HTMLDivElement> {}

const BentoFeatureSection = React.forwardRef<HTMLDivElement, BentoFeatureProps>(
  ({ className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn("relative z-10 mx-auto max-w-7xl px-4 py-24 md:px-8", className)}
        {...props}
      >
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Complete Feature Set
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            The SettleMint Asset Tokenization Kit is a full-stack solution designed to accelerate the development of digital asset platforms.
          </p>
        </div>

        {/* Bento Grid for Asset Types */}
        <div className="mb-16">
          <h3 className="mb-8 text-2xl font-semibold">Supported Asset Types</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {/* StableCoins - Large Card */}
            <Card className="md:col-span-2 md:row-span-2 transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Coins className="h-6 w-6" />
                  </div>
                  <CardTitle>StableCoins</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  Fully collateralized digital currencies backed by real-world assets.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>Designed for stable value maintenance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>Secure transactions with compliance features</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>Ideal for cross-border settlements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>Treasury management capabilities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Bonds */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle>Bonds</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Digital representation of traditional fixed-income securities with maturity dates and yield distribution.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Equity Tokens */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Building className="h-6 w-6" />
                  </div>
                  <CardTitle>Equity Tokens</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Digital shares with voting rights and governance capabilities for streamlined shareholder management.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Investment Funds */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <CardTitle>Investment Funds</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Digital fund shares with automated fee management, supporting various fund types.
                </CardDescription>
              </CardContent>
            </Card>
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

        {/* Bento Grid for Platform Features */}
        <div>
          <h3 className="mb-8 text-2xl font-semibold">Platform Features</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {/* Security & Compliance - Large Card */}
            <Card className="md:col-span-2 md:row-span-2 transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>Security & Compliance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  Institutional-grade security with comprehensive compliance tools.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>Role-Based Access Control with granular permissions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>Blocklist/Allowlist functionality for user restrictions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>Pause mechanisms for emergency controls</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>KYC/AML integration capabilities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Intuitive Dashboard */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <CardTitle>Intuitive Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Comprehensive overview of all tokenized assets, transactions, and platform activities.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Asset Management */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Banknote className="h-6 w-6" />
                  </div>
                  <CardTitle>Asset Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Create, issue, transfer, and manage digital assets through a user-friendly interface.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Smart Contract Templates */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Lock className="h-6 w-6" />
                  </div>
                  <CardTitle>Smart Contract Templates</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Pre-built, audited contract templates for various asset types with multi-chain compatibility.
                </CardDescription>
              </CardContent>
            </Card>
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

BentoFeatureSection.displayName = "BentoFeatureSection";

export { BentoFeatureSection };