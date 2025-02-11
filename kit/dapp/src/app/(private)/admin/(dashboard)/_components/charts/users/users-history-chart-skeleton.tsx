import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type VariantProps, cva } from 'class-variance-authority';

const containerVariants = cva('', {
  variants: {
    variant: {
      loading: '',
      noData: 'flex h-full items-center justify-center gap-4 text-muted-foreground text-sm',
    },
  },
  defaultVariants: {
    variant: 'loading',
  },
});
type UsersHistorySkeletonProps = VariantProps<typeof containerVariants>;

export function UsersHistorySkeleton({ variant = 'loading' }: UsersHistorySkeletonProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className={containerVariants({ variant })}>
          {variant === 'loading' ? (
            <></>
          ) : (
            <div className="text-center">
              <p>No users yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
