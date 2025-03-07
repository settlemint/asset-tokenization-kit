"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";

export function Greeting() {
  const session = authClient.useSession();
  const name = session.data?.user.name;

  return (
    <div>
      {getGreeting()},
      {name ? (
        <span className="ml-1 font-semibold">{name}</span>
      ) : (
        <Skeleton className="mx-1 inline-block h-6 w-24" />
      )}
      . You have
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}
