import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("credentials", { redirectTo: "/wallet" });
      }}
    >
      <Button type="submit">Sign in</Button>
    </form>
  );
}
