"use client";

import { cn } from "@/lib/utils";
import type { AssetType } from "../types";
import { assetTypeDescriptions } from "../types";

interface AssetTypeSelectionProps {
  selectedType: AssetType;
  onSelect: (type: AssetType) => void;
}

// Asset type icons
const assetIcons = {
  bond: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 mb-4"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  cryptocurrency: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 mb-4"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8" />
      <path d="M10 14V5" />
    </svg>
  ),
  equity: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 mb-4"
    >
      <path d="M18 12H6a2 2 0 0 0-2 2v10" />
      <path d="M6 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
      <path d="M18 16h.01" />
    </svg>
  ),
  fund: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 mb-4"
    >
      <path d="M21 5H3" />
      <path d="M20 10H4" />
      <path d="M12 10v8.3a.7.7 0 0 1-.7.7H8.2a.7.7 0 0 1-.7-.7V10" />
      <path d="M16.5 10v8.3a.7.7 0 0 1-.7.7h-3.1a.7.7 0 0 1-.7-.7V10" />
      <path d="M14 15v-2" />
      <path d="M10 15v-2" />
      <path d="M3 6v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6" />
    </svg>
  ),
  stablecoin: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 mb-4"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h8" />
    </svg>
  ),
  deposit: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 mb-4"
    >
      <path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" />
      <path d="M2 13h10" />
      <path d="m9 16 3-3-3-3" />
    </svg>
  ),
};

export function AssetTypeSelection({
  selectedType,
  onSelect,
}: AssetTypeSelectionProps) {
  const assetTypes = Object.keys(
    assetTypeDescriptions
  ) as NonNullable<AssetType>[];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Choose Asset Type</h2>
      <p className="text-muted-foreground mb-8">
        Select the type of digital asset you want to create. Each asset type has
        different properties and requirements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assetTypes.map((type) => (
          <button
            key={type}
            className={cn(
              "flex flex-col items-center p-6 border rounded-xl transition-all",
              selectedType === type
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-accent hover:text-accent-foreground border-border"
            )}
            onClick={() => onSelect(type)}
          >
            {assetIcons[type]}
            <h3 className="font-medium text-lg capitalize mb-2">{type}</h3>
            <p
              className={cn(
                "text-sm text-center",
                selectedType === type
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              )}
            >
              {assetTypeDescriptions[type]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
