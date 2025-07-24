import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTableSkeleton() {
  return (
    <>
      <div className="rounded-md border animate-in fade-in-0 duration-500">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">
                <Skeleton className="bg-muted/50 h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="bg-muted/50 h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="bg-muted/50 h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="bg-muted/50 h-4 w-20" />
              </TableHead>
              <TableHead className="w-[50px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow
                key={index}
                className={`animate-in fade-in-0 slide-in-from-left-1 delay-${String(index * 50)}`}
                style={{
                  animationFillMode: "both",
                }}
              >
                <TableCell>
                  <Skeleton className="bg-muted/50 h-4 w-full animate-pulse" />
                </TableCell>
                <TableCell>
                  <Skeleton
                    className="bg-muted/50 h-4 w-full animate-pulse"
                    style={{ animationDelay: "100ms" }}
                  />
                </TableCell>
                <TableCell>
                  <Skeleton
                    className="bg-muted/50 h-4 w-full animate-pulse"
                    style={{ animationDelay: "200ms" }}
                  />
                </TableCell>
                <TableCell>
                  <Skeleton
                    className="bg-muted/50 h-4 w-full animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton
                    className="bg-muted/50 h-6 w-6 animate-pulse"
                    style={{ animationDelay: "400ms" }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
