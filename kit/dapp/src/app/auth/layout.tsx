import Image from 'next/image';
import type { PropsWithChildren } from 'react';
import AuthPlaceholder from './placeholder.jpg';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">{children}</div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src={AuthPlaceholder}
          alt="Auth"
          className="absolute inset-0 h-full w-full object-cover object-center dark:brightness-[0.5]"
        />
      </div>
    </div>
  );
}
