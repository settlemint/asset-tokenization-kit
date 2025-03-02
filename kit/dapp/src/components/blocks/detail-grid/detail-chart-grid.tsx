import type { PropsWithChildren } from "react";

export function DetailChartGrid({ children }: PropsWithChildren) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {children}
    </div>
  );
}
