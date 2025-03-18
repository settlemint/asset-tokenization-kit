import { AuthCard } from "@daveyplate/better-auth-ui";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ pathname: string }>;
}) {
  const { pathname } = await params;

  return (
    <div className="my-auto flex flex-col items-center">
      <AuthCard pathname={pathname} />
    </div>
  );
}
