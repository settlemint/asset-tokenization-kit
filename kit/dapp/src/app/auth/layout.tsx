import type { PropsWithChildren } from "react";
import { AuthPlaceholder } from "./placeholder";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">{children}</div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <AuthPlaceholder className="absolute inset-0 w-full h-full object-cover object-center dark:brightness-[0.2] dark:grayscale" />
      </div>
    </div>
  );
}
