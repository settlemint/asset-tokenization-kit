import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatDate } from '@/lib/date';
import type { Address } from 'viem';
import type { ContactsListItem } from './contacts-table-data';

export function ContactDetailSheet({ id, wallet, name, created_at, updated_at }: ContactsListItem) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Details
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[40rem]">
        <SheetHeader>
          <SheetTitle>Contact details</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[1fr_2fr] gap-4 [&>dd]:flex [&>dd]:items-center [&>dt]:flex [&>dt]:items-center">
                <dt className="text-muted-foreground text-sm">Name:</dt>
                <dd className="text-sm">{name}</dd>
                <dt className="text-muted-foreground text-sm">Wallet:</dt>
                <dd className="text-sm">
                  <EvmAddress address={wallet as Address} />
                </dd>
                <dt className="text-muted-foreground text-sm">Created At:</dt>
                <dd className="text-sm">{created_at ? formatDate(created_at as Date) : 'N/A'}</dd>
                <dt className="text-muted-foreground text-sm">Updated At:</dt>
                <dd className="text-sm">{updated_at ? formatDate(updated_at as Date) : 'N/A'}</dd>
              </dl>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
