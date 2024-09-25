import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { providerMap, signIn } from "@/lib/auth";
import { Link } from "@/lib/i18n";
import { settlemint } from "@/lib/settlemint";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default function SignUp() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>Enter your information to create an account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <form
            action={async (formData) => {
              "use server";

              const wallet = await settlemint.hasura.gql.getWalletByEmail({
                email: formData.get("email") as string,
              });

              if (wallet.wallets_by_pk) {
                return redirect(`/auth/signin?email=${formData.get("email")}`);
              }

              const hasAdmin = await settlemint.hasura.gql.hasAtLeastOneAdmin();
              const role = [(hasAdmin.wallets_aggregate.aggregate?.count ?? 0) > 0 ? "user" : "admin"];

              // create wallet in portal

              await settlemint.hasura.gql.createNewWallet({
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                wallet: "",
                role,
              });

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
                Sign up with {provider.name}
              </Button>
            </form>
          ))}
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/signin" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
