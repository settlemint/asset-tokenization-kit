import { create, docs } from "@/.source";
import { loader } from "fumadocs-core/source";

export const source = loader({
  source: await create.sourceAsync(docs.doc, docs.meta),
  baseUrl: "/docs",
});
