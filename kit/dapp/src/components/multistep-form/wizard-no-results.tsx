import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface WizardNoResultsProps {
  onClearSearch: () => void;
}

export function WizardNoResults({ onClearSearch }: WizardNoResultsProps) {
  return (
    <div className="py-8 text-center">
      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        No fields match your search
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Try adjusting your search terms or clear the search to see all fields.
      </p>
      <Button variant="outline" size="sm" onClick={onClearSearch}>
        Clear search
      </Button>
    </div>
  );
}
