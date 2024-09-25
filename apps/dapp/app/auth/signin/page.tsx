import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { providerMap, signIn } from "@/lib/auth";
import { Link } from "@/lib/i18n";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default function SignIn() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>Enter your information to sign into your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <form
            action={async (formData) => {
              "use server";
              try {
                await signIn("credentials", formData);
              } catch (error) {
                if (error instanceof AuthError) {
                  return redirect(`/auth/error?error=${error.type}`);
                }
                throw error;
              }
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </form>
          {Object.values(providerMap).map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                "use server";
                try {
                  await signIn(provider.id, {
                    redirectTo: "/wallet",
                  });
                } catch (error) {
                  // Signin can fail for a number of reasons, such as the user
                  // not existing, or the user not having the correct role.
                  // In some cases, you may want to redirect to a custom error
                  if (error instanceof AuthError) {
                    return redirect(`/auth/error?error=${error.type}`);
                  }

                  // Otherwise if a redirects happens Next.js can handle it
                  // so you can just re-thrown the error and let Next.js handle it.
                  // Docs:
                  // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                  throw error;
                }
              }}
            >
              <Button variant="outline" className="w-full">
                Sign in with {provider.name}
              </Button>
            </form>
          ))}
        </div>
        <div className="mt-4 text-center text-sm">
          Don't have an account yet?{" "}
          <Link href="/auth/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
