import { signInAction } from "@/app/auth/signin/actions/sign-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { providerMap } from "@/lib/auth";
import { Link } from "@/lib/i18n";

export default function SignIn() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>Enter your information to sign into your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <form action={async (formData) => signInAction("credentials", formData)}>
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
            <form key={provider.id} action={async (formData) => signInAction(provider.id, formData)}>
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
