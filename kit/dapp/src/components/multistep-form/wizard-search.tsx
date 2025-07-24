import { DebouncedInput } from "@/components/data-table/filters/debounced-input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useCallback } from "react";

interface WizardSearchProps {
  onSearch: (query: string) => void;
  value: string;
  resultCount: number;
  hasQuery: boolean;
  placeholder?: string;
}

export function WizardSearch({
  onSearch,
  value,
  resultCount,
  hasQuery,
  placeholder = "Search",
}: WizardSearchProps) {
  const handleChange = useCallback(
    (val: string | number) => {
      onSearch(val.toString());
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    onSearch("");
  }, [onSearch]);

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative">
        <Search className="absolute left-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <DebouncedInput
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-7 pr-10 h-9 text-sm border-none shadow-none bg-transparent dark:bg-transparent focus-visible:ring-1 focus-visible:ring-ring"
          debounce={500}
        />
        {hasQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 p-0 -translate-y-1/2 hover:bg-muted"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      {hasQuery && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
