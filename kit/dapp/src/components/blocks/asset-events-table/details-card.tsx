import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import React from 'react';

interface DetailItem {
  key: string;
  label: string;
  value: ReactNode;
}

interface DetailsCardProps {
  details: DetailItem[];
}

export function DetailsCard({ details }: DetailsCardProps) {
  const t = useTranslations('components.asset-events-table.details');

  return (
    <Card>
      <CardHeader>{t('details-header')}</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          {details.map((item) => (
            <React.Fragment key={item.key}>
              <dt className="text-muted-foreground text-sm">{item.label}</dt>
              <dd className="text-sm">{item.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
