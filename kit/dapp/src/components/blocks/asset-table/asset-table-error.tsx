import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AssetTableErrorProps {
  error: unknown;
}

export function AssetTableError({ error }: AssetTableErrorProps) {
  const errorMessage = error instanceof Error ? error.message : 'An error occurred while loading the table';

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
}
