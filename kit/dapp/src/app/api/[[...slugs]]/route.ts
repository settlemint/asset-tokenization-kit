import { api } from "@/lib/api";

// This is required to enable streaming
export const dynamic = "force-dynamic";

export const GET = api.handle;
export const POST = api.handle;
export const PUT = api.handle;
export const PATCH = api.handle;
export const DELETE = api.handle;
export const HEAD = api.handle;
export const OPTIONS = api.handle;
