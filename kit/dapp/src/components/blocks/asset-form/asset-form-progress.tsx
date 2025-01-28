import { cn } from '@/lib/utils';

export function AssetFormProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="mb-8 flex gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-colors duration-200',
            index <= currentStep ? 'bg-primary' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}
