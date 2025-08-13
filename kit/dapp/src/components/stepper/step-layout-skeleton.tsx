import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface StepLayoutSkeletonProps {
  className?: string;
  groupCount?: number;
}

export function StepLayoutSkeleton({
  className,
  groupCount = 3,
}: StepLayoutSkeletonProps) {
  return (
    <div
      className={cn(
        "StepLayout h-full shadow-lg overflow-hidden flex",
        className
      )}
    >
      <SidebarProvider defaultOpen={true}>
        <Sidebar className="w-[360px] flex-shrink-0 transition-all duration-300 group-data-[side=left]:border-0 overflow-hidden">
          <div
            className="w-full overflow-y-auto h-full"
            style={{
              background: "var(--sm-wizard-sidebar-gradient)",
              backgroundSize: "cover",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
            }}
          >
            <SidebarHeader className="p-6 pb-0">
              {/* Title and Progress Skeleton */}
              <div className="mb-8">
                <Skeleton className="h-8 w-48 mb-2 bg-accent-foreground/20" />
                <Skeleton className="h-4 w-64 mb-4 bg-accent-foreground/20" />

                <div>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-3 w-12 bg-accent-foreground/20" />
                    <Skeleton className="h-3 w-8 bg-accent-foreground/20" />
                  </div>
                  <Skeleton className="h-2 w-full bg-accent-foreground/20" />
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-8 relative overflow-y-auto">
              <div className="step-layout flex gap-6">
                <div className="flex-shrink-0 w-80 space-y-2">
                  {/* Step Group Skeletons */}
                  <div className="space-y-4">
                    {Array.from({ length: groupCount }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="my-6 h-12 bg-accent-foreground/20 rounded-md"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SidebarContent>
          </div>
        </Sidebar>

        {/* Main content area skeleton */}
        <div
          className="StepLayout__main flex-1 flex flex-col transition-all duration-300 relative"
          style={{ backgroundColor: "var(--sm-background-lightest)" }}
        >
          <div className="p-8 h-full flex">
            <div className="w-full overflow-y-auto">
              {/* Title skeleton */}
              <div>
                <Skeleton className="h-8 w-2/3 bg-current/10 dark:bg-accent-foreground/20" />
                <Skeleton className="h-4 w-4/5 bg-current/10 dark:bg-accent-foreground/20 mt-4" />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
