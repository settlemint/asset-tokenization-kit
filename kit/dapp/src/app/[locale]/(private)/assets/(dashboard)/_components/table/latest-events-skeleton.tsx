import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function LatestEventsSkeleton() {
  const t = useTranslations("admin.dashboard.table");

  return (
    <>
      <div className="rounded-md border">
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
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="bg-muted/50 h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="bg-muted/50 h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="bg-muted/50 h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="bg-muted/50 h-4 w-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="bg-muted/50 h-6 w-6" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Link
        href="/assets/activity/events"
        className="mt-4 text-muted-foreground text-sm hover:text-primary"
      >
        {t("latest-events.view-all")}
      </Link>
    </>
  );
}
