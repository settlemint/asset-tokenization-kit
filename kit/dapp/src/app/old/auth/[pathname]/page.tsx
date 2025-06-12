import { AuthView } from "./view";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ pathname: string }>;
}) {
  const { pathname } = await params;

  return <AuthView pathname={pathname} />;
}
