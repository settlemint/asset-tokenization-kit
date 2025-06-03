"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/lib/orpc/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function Planets() {
  const { data } = useSuspenseQuery(
    orpc.planet.list.queryOptions({ input: {} as const })
  );

  if (data.length === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">No planets found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Planets</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((planet) => (
            <li
              key={planet.id}
              className="flex items-center rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <span className="text-sm font-medium">{planet.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
