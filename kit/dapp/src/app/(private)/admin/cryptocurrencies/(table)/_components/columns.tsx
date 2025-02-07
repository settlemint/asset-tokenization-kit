'use client';

import { createActionsColumn, createBaseColumns } from '@/components/blocks/asset-table/asset-table-columns';
import { assetConfig } from '@/lib/config/assets';
import { createColumnHelper } from '@tanstack/react-table';
import type { CryptoCurrencyAsset } from './data';

const columnHelper = createColumnHelper<CryptoCurrencyAsset>();

export const columns = [
  ...createBaseColumns(columnHelper),
  createActionsColumn(columnHelper, assetConfig.cryptocurrency),
];
