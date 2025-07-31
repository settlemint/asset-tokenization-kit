import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";

export function useGoBack({ fallback = "/" }: { fallback?: string } = {}) {
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  const onBack = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      void navigate({ to: fallback });
    }
  };

  return { onBack };
}
