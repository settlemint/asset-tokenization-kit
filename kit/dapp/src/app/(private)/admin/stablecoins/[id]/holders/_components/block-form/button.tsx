'use client';

import type { Address } from 'viem';

interface BlockHolderButtonProps {
  holder: Address;
  blocked: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export function BlockHolderButton({ blocked, onClick }: BlockHolderButtonProps) {
  const action = blocked ? 'Unblock' : 'Block';

  return (
    <button type="button" className="w-full text-left text-sm" onClick={onClick} data-ui-unstyled>
      {action} holder
    </button>
  );
}
