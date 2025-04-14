import { StorageDemo } from "./_components/storage-demo";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  // In Next.js metadata functions, we need to await the params object
  const resolvedParams = await params;

  return {
    title: "Storage Demo",
    description: "A demonstration of the Minio storage integration",
  };
}

export default function StorageDemoPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Storage Demo</h1>
          <p className="text-muted-foreground">
            A demonstration of the Minio storage integration
          </p>
        </div>
        <StorageDemo />
      </div>
    </div>
  );
}
