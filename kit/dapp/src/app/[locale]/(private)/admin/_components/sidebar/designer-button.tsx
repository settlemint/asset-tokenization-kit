'use client';

// import { CreateBondForm } from "@/app/(private)/admin/bonds/_components/create-form/form";
// import { CreateCryptocurrencyForm } from "@/app/(private)/admin/cryptocurrencies/_components/create-form/form";
// import { CreateEquityForm } from "@/app/(private)/admin/equities/_components/create-form/form";
// import { CreateFundForm } from "@/app/(private)/admin/funds/_components/create-form/form";

import {
  FrameIcon,
  type FrameIconHandle,
} from '@/components/ui/animated-icons/frame';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarGroup, useSidebar } from '@/components/ui/sidebar';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { CreateStablecoinForm } from '../../stablecoins/_components/create-form/form';

export function DesignerButton() {
  const t = useTranslations('admin.sidebar');
  const { state, isMobile } = useSidebar();
  const [tokenType, setTokenType] = useState<
    'bond' | 'cryptocurrency' | 'equity' | 'fund' | 'stablecoin' | null
  >(null);
  const frameIconRef = useRef<FrameIconHandle>(null);

  return (
    <SidebarGroup className="-mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {state === 'expanded' ? (
            <Button
              className="mb-4 flex w-full items-center gap-2"
              onMouseEnter={() => frameIconRef.current?.startAnimation()}
              onMouseLeave={() => frameIconRef.current?.stopAnimation()}
            >
              <FrameIcon ref={frameIconRef} className="size-4" />
              {state === 'expanded' && <span>{t('asset-designer')}</span>}
            </Button>
          ) : (
            <button
              type="button"
              className="mt-2 h-10 w-10 rounded-xl pl-3"
              onMouseEnter={() => frameIconRef.current?.startAnimation()}
              onMouseLeave={() => frameIconRef.current?.stopAnimation()}
            >
              <FrameIcon ref={frameIconRef} className="size-4" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="-translate-y-2 ml-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded shadow-dropdown"
          align="start"
          side={isMobile ? 'bottom' : 'right'}
          sideOffset={4}
        >
          <DropdownMenuItem onSelect={() => setTokenType('bond')}>
            {t('asset-types.bond')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTokenType('cryptocurrency')}>
            {t('asset-types.cryptocurrency')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTokenType('equity')}>
            {t('asset-types.equity')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTokenType('fund')}>
            {t('asset-types.fund')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTokenType('stablecoin')}>
            {t('asset-types.stablecoin')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Placeholder for Bond form - to be implemented */}
      {tokenType === 'bond' && (
        <div className="hidden">
          {/* <CreateBondForm open={true} onCloseAction={() => setTokenType(null)} /> */}
        </div>
      )}

      {/* Placeholder for Cryptocurrency form - to be implemented */}
      {tokenType === 'cryptocurrency' && (
        <div className="hidden">
          {/* <CreateCryptocurrencyForm open={true} onCloseAction={() => setTokenType(null)} /> */}
        </div>
      )}

      {/* Placeholder for Equity form - to be implemented */}
      {tokenType === 'equity' && (
        <div className="hidden">
          {/* <CreateEquityForm open={true} onCloseAction={() => setTokenType(null)} /> */}
        </div>
      )}

      {/* Placeholder for Fund form - to be implemented */}
      {tokenType === 'fund' && (
        <div className="hidden">
          {/* <CreateFundForm open={true} onCloseAction={() => setTokenType(null)} /> */}
        </div>
      )}

      <CreateStablecoinForm
        open={tokenType === 'stablecoin'}
        onCloseAction={() => setTokenType(null)}
      />
    </SidebarGroup>
  );
}
