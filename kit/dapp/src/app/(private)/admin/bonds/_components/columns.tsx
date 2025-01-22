'use client';

import {
  createActionsColumn,
  createBaseColumns,
  createPausedColumn,
} from '@/components/blocks/asset-table/asset-table-columns';
import { createColumnHelper } from '@tanstack/react-table';
import { PauseCircle, PlayCircle } from 'lucide-react';
import type { BondAsset } from './data';

const columnHelper = createColumnHelper<BondAsset>();

export const columns = [
  ...createBaseColumns(columnHelper),
  createPausedColumn(columnHelper),
  createActionsColumn(columnHelper, 'bonds'),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
};
