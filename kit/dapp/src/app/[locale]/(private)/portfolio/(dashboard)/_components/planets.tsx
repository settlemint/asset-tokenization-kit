"use client";

import { orpc } from "@/lib/orpc/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function Planets() {
  const { data } = useSuspenseQuery(
    orpc.planet.list.queryOptions({ input: {} })
  );

  return (
    <>
      <div>Planets</div>
      <div>
        {data.map((planet) => (
          <div key={planet.id}>{planet.name}</div>
        ))}
      </div>
    </>
  );
}
