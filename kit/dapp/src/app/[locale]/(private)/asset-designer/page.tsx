"use client";

import { AssetDesignerDialog } from "@/components/blocks/asset-designer/asset-designer-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideCoins, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function AssetDesignerPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Asset Designer"
        subtitle="Create and customize digital assets using our step-by-step designer"
        button={
          <Button
            variant="default"
            onClick={() => setOpen(true)}
            className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Asset
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LucideCoins className="mr-2 h-5 w-5 text-primary" />
              Asset Designer
            </CardTitle>
            <CardDescription>
              Create your own custom digital assets with our intuitive designer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our asset designer provides a step-by-step process to create
              various digital assets including bonds, cryptocurrencies,
              equities, funds, stablecoins, and deposits.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                variant="default"
                onClick={() => setOpen(true)}
                className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Asset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AssetDesignerDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
