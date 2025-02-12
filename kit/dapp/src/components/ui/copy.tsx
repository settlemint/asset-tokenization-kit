'use client';

import { Check, Copy as CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface CopyProps {
  value: string;
  /**
   * Optional display text. If not provided, will display the value
   */
  displayText?: string;
  /**
   * Optional success message. Defaults to "Copied to clipboard!"
   */
  successMessage?: string;
  /**
   * Optional className for the container
   */
  className?: string;
}

export function CopyToClipboard({ value, displayText, successMessage = 'Copied to clipboard!', className }: CopyProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setHasCopied(true);
    toast.success(successMessage);

    // Reset copy icon after 2 seconds
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex-1 cursor-pointer overflow-x-auto whitespace-nowrap" onClick={handleCopy}>
        <span className="text-xs">{displayText ?? value}</span>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copy to clipboard">
        {hasCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <CopyIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
