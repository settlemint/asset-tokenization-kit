import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import * as m from "@/paraglide/messages";

const filePath = "count.txt";

async function readCount() {
  const countFile = Bun.file(filePath);
  return parseInt(await countFile.text().catch(() => "0"));
}

const getCount = createServerFn({
  method: "GET",
}).handler(() => {
  return readCount();
});

const updateCount = createServerFn({ method: "POST" })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount();
    const countFile = Bun.file(filePath);
    await countFile.write(`${count + data}`);
  });

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  return (
    <Button
      onClick={() => {
        void updateCount({ data: 1 }).then(() => {
          void router.invalidate();
        });
      }}
    >
      <p>{m.counter({ state })}</p>
    </Button>
  );
}
