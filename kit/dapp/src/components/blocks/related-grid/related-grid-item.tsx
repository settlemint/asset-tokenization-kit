import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PropsWithChildren } from "react";

interface RelatedGridItemProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function RelatedGridItem({
  title,
  description,
  children,
}: RelatedGridItemProps) {
  return (
    <Card className="linear-gradient-related flex h-full flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-sm">{description}</CardContent>
      <CardFooter>{children}</CardFooter>
    </Card>
  );
}
