'use client';

import { getMyAssets } from '@/app/(private)/portfolio/_components/my-assets/data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowUpFromLine } from 'lucide-react';

interface MyAssetsClientProps {
  queryKey: QueryKey;
}

export function MyAssetsClient({ queryKey }: MyAssetsClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getMyAssets,
  });

  const totalValue = data.reduce((acc, asset) => acc + Number(asset.value), 0);

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="mr-1 font-bold text-4xl">{totalValue}</span>
        <span>assets</span>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="w-1/6">
            <ArrowUpFromLine className="mr-2 h-4 w-4" />
            Transfer
          </Button>
        </SheetTrigger>
        <SheetContent className="min-w-[34rem]">
          <SheetHeader>
            <SheetTitle>Transfer Assets</SheetTitle>
            <SheetDescription>Transfer your assets to another wallet address.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
