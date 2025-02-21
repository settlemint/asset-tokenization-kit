import { Lock } from 'lucide-react';
import type { PropsWithChildren } from 'react';

export function AssetFormSummarySecurityConfirmation({ children }: PropsWithChildren) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-3 w-3 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Security Confirmation</h3>
          <p className="text-muted-foreground text-xs">Enter your pin code to confirm and sign the transaction.</p>
        </div>
      </div>
      {children}
    </div>
  );
}
