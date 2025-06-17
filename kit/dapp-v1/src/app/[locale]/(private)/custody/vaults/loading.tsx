import { PageHeaderSkeleton } from "@/components/layout/page-header.skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      {/* No main content skeleton needed as the page content is minimal */}
    </>
  );
}
