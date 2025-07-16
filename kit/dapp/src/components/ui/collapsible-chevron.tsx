import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

export interface CollapsibleChevronProps {
  children: (isExpanded: boolean) => React.ReactNode;
  trigger: (isExpanded: boolean) => React.ReactNode;
  open?: boolean;
  className?: string;
}

export function CollapsibleChevron({
  children,
  trigger,
  className,
  open = false,
}: CollapsibleChevronProps) {
  const [isExpanded, setIsExpanded] = useState(open);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-controls="expandable-content"
          className={cn(
            "flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200",
            "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
        >
          {trigger(isExpanded)}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsibleContent
          id="expandable-content"
          className="overflow-hidden transition-all duration-300 ease-in-out"
        >
          <div className="pb-2">{children(isExpanded)}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
