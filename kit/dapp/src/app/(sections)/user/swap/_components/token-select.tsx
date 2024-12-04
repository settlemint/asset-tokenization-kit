'use client';

import type { TokenInfo } from '@/app/(sections)/user/swap/_hooks/use-swap-tokens';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface TokenSelectProps {
  tokens: TokenInfo[];
  selectedToken?: string;
  onSelectAction: (tokenSymbol: string) => void;
  placeholder?: string;
}

export function TokenSelect({ tokens, selectedToken, onSelectAction, placeholder }: TokenSelectProps) {
  return (
    <Select value={selectedToken} onValueChange={onSelectAction}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder || 'Select token'} />
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem key={token.symbol} value={token.symbol}>
            {token.name} ({token.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
