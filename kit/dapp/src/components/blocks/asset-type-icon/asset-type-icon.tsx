import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { assetConfig } from '@/lib/config/assets';

interface AssetTypeIconProps {
  type: keyof typeof assetConfig;
  size?: 'sm' | 'md';
}

function getAssetInitials(type: keyof typeof assetConfig): string {
  switch (type) {
    // case "bond":
    //   return "BN";
    // case "cryptocurrency":
    //   return "CC";
    // case "equity":
    //   return "EQ";
    // case "fund":
    //   return "FN";
    case 'stablecoin':
      return 'SC';
    default:
      return 'NA';
  }
}

export function AssetTypeIcon({ type, size = 'sm' }: AssetTypeIconProps) {
  const sizeClass = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';

  return (
    <Avatar className={`${sizeClass} border border-foreground-muted`}>
      <AvatarFallback className="text-[7px]">
        {getAssetInitials(type)}
      </AvatarFallback>
    </Avatar>
  );
}
