'use client';

import { type ButtonProps, Button as UIButton } from '@/components/ui/button';
import './button.css';
import { cn } from '@/lib/utils';

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <UIButton {...props} className={cn('Button', className)}>
      <span className="Button__text">{children}</span>
    </UIButton>
  );
}
