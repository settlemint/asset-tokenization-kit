import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button type="submit">Sign in</Button>
    </form>
  );
}
