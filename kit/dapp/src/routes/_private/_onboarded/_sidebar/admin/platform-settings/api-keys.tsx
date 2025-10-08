import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/orpc/orpc-client";
import type { ApiKeySchema, ApiKeyWithSecretSchema } from "@/orpc/routes/system/api-keys/routes/api-key.schemas";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { z } from "zod";

const SPEC_QUERY_KEY = ["openapi-spec"] as const;

type ApiKey = z.infer<typeof ApiKeySchema>;
type CreatedApiKey = z.infer<typeof ApiKeyWithSecretSchema>;

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/platform-settings/api-keys"
)({
  component: ApiKeysPage,
  loader: () => {
    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/admin/platform-settings/api-keys",
        }),
        createI18nBreadcrumbMetadata("settings.apiKeys.title"),
      ],
    };
  },
});

function ApiKeysPage() {
  const { t } = useTranslation(["navigation", "system"]);
  const queryClient = useQueryClient();

  const { data: currentUser } = useSuspenseQuery(orpc.user.me.queryOptions());
  const apiKeysQuery = orpc.system.apiKeys.list.queryOptions();
  const { data: apiKeys } = useSuspenseQuery(apiKeysQuery);

  const {
    data: spec,
    isError: isSpecError,
    isLoading: isSpecLoading,
    refetch: refetchSpec,
    isFetching: isSpecFetching,
  } = useQuery({
    queryKey: SPEC_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/openapi.json", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch spec");
      }

      return (await response.json()) as Record<string, unknown>;
    },
    staleTime: 1000 * 60 * 5,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    description: "",
    expiresAt: "",
  });
  const [generatedKey, setGeneratedKey] = useState<CreatedApiKey | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const createApiKeyMutation = useMutation({
    mutationFn: async () => {
      const expiresAtValue = formState.expiresAt
        ? new Date(formState.expiresAt)
        : undefined;

      return await orpc.system.apiKeys.create.mutate({
        name: formState.name,
        description: formState.description || null,
        impersonateUserEmail: formState.email || undefined,
        expiresAt: expiresAtValue,
      });
    },
    onSuccess: async (data) => {
      setGeneratedKey(data);
      setFormState({ name: "", email: "", description: "", expiresAt: "" });
      await queryClient.invalidateQueries({
        queryKey: apiKeysQuery.queryKey,
      });
      toast.success(
        t("system:apiKeys.create.success", {
          name: data.name ?? data.id,
        })
      );
    },
    onError: (error: unknown) => {
      console.error(error);
      toast.error(t("system:apiKeys.create.error"));
    },
  });

  const revokeApiKeyMutation = useMutation({
    mutationFn: async (apiKeyId: string) => {
      setRevokingId(apiKeyId);
      return await orpc.system.apiKeys.revoke.mutate({ id: apiKeyId });
    },
    onSuccess: async (_, apiKeyId) => {
      await queryClient.invalidateQueries({
        queryKey: apiKeysQuery.queryKey,
      });
      toast.success(
        t("system:apiKeys.revoke.success", {
          id: apiKeyId,
        })
      );
    },
    onError: (error: unknown) => {
      console.error(error);
      toast.error(t("system:apiKeys.revoke.error"));
    },
    onSettled: () => {
      setRevokingId(null);
    },
  });

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createApiKeyMutation.mutateAsync();
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setGeneratedKey(null);
    }
  };

  const handleDownloadSpec = () => {
    if (!spec) {
      return;
    }

    const blob = new Blob([JSON.stringify(spec, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "asset-tokenization-kit-openapi.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <RouterBreadcrumb />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {t("navigation:settings.apiKeys.title")}
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          {t("system:apiKeys.description")}
        </p>
      </div>

      {!isAdmin && (
        <Alert variant="destructive">
          <AlertTitle>{t("system:apiKeys.adminRequired.title")}</AlertTitle>
          <AlertDescription>
            {t("system:apiKeys.adminRequired.description")}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>{t("system:apiKeys.table.title")}</CardTitle>
            <CardDescription>
              {t("system:apiKeys.table.description")}
            </CardDescription>
          </div>
          <Button onClick={() => handleDialogChange(true)} disabled={!isAdmin}>
            {t("system:apiKeys.create.openButton")}
          </Button>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("system:apiKeys.table.empty")}
            </p>
          ) : (
            <ScrollArea className="max-h-[480px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("system:apiKeys.table.columns.name")}</TableHead>
                    <TableHead>{t("system:apiKeys.table.columns.owner")}</TableHead>
                    <TableHead>
                      {t("system:apiKeys.table.columns.impersonation")}
                    </TableHead>
                    <TableHead>{t("system:apiKeys.table.columns.status")}</TableHead>
                    <TableHead>{t("system:apiKeys.table.columns.created")}</TableHead>
                    <TableHead>{t("system:apiKeys.lastUsed")}</TableHead>
                    <TableHead className="text-right">
                      {t("system:apiKeys.table.columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <div className="font-medium">{key.name ?? key.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatKeyPreview(key)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{key.owner?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {key.owner?.email ?? ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        {key.impersonation ? (
                          <div className="space-y-1">
                            <div>{key.impersonation.name ?? key.impersonation.email}</div>
                            <div className="text-xs text-muted-foreground">
                              {t("system:apiKeys.table.impersonates", {
                                email: key.impersonation.email,
                                role: key.impersonation.role,
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {t("system:apiKeys.table.noImpersonation")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.enabled ? "default" : "secondary"}>
                          {key.enabled
                            ? t("system:apiKeys.table.status.active")
                            : t("system:apiKeys.table.status.disabled")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDateTime(key.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {key.lastUsedAt
                            ? formatDateTime(key.lastUsedAt)
                            : t("system:apiKeys.never")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!key.enabled || !isAdmin || revokingId === key.id}
                            >
                              {t("system:apiKeys.revoke.label")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("system:apiKeys.revoke.confirmTitle")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("system:apiKeys.revoke.confirmDescription", {
                                  name: key.name ?? key.id,
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("system:apiKeys.revoke.cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  void revokeApiKeyMutation.mutateAsync(key.id);
                                }}
                                disabled={revokingId === key.id}
                              >
                                {t("system:apiKeys.revoke.confirm")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>{t("system:apiKeys.spec.title")}</CardTitle>
            <CardDescription>{t("system:apiKeys.spec.description")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetchSpec()}
              disabled={isSpecFetching}
            >
              {t("system:apiKeys.spec.refresh")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadSpec}
              disabled={!spec}
            >
              {t("system:apiKeys.spec.download")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isSpecLoading ? (
            <p className="text-muted-foreground text-sm">
              {t("system:apiKeys.spec.loading")}
            </p>
          ) : isSpecError ? (
            <Alert variant="destructive">
              <AlertTitle>{t("system:apiKeys.spec.errorTitle")}</AlertTitle>
              <AlertDescription>
                {t("system:apiKeys.spec.loadError")}
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="max-h-[480px] rounded-lg border bg-muted/30 p-4 text-xs">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(spec, null, 2)}
              </pre>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          {generatedKey ? (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{t("system:apiKeys.create.secretTitle")}</DialogTitle>
                <DialogDescription>
                  {t("system:apiKeys.create.secretDescription")}
                </DialogDescription>
              </DialogHeader>
              <Alert>
                <AlertTitle>{t("system:apiKeys.create.secretLabel")}</AlertTitle>
                <AlertDescription className="space-y-3">
                  <CopyToClipboard
                    value={generatedKey.secret}
                    className="flex w-full justify-between"
                    onCopy={() =>
                      toast.success(t("system:apiKeys.create.copySuccess"))
                    }
                  >
                    <span className="font-mono text-sm break-all">
                      {generatedKey.secret}
                    </span>
                  </CopyToClipboard>
                  <p className="text-xs text-muted-foreground">
                    {t("system:apiKeys.create.secretWarning")}
                  </p>
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button onClick={() => handleDialogChange(false)}>
                  {t("system:apiKeys.create.done")}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>{t("system:apiKeys.create.title")}</DialogTitle>
                <DialogDescription>
                  {t("system:apiKeys.create.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key-name">
                    {t("system:apiKeys.create.nameLabel")}
                  </Label>
                  <Input
                    id="api-key-name"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((state) => ({
                        ...state,
                        name: event.target.value,
                      }))
                    }
                    placeholder={t("system:apiKeys.create.namePlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key-email">
                    {t("system:apiKeys.create.impersonateLabel")}
                  </Label>
                  <Input
                    id="api-key-email"
                    type="email"
                    value={formState.email}
                    onChange={(event) =>
                      setFormState((state) => ({
                        ...state,
                        email: event.target.value,
                      }))
                    }
                    placeholder={t(
                      "system:apiKeys.create.impersonatePlaceholder"
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("system:apiKeys.create.impersonateDescription")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key-expires">
                    {t("system:apiKeys.create.expiresAtLabel")}
                  </Label>
                  <Input
                    id="api-key-expires"
                    type="date"
                    value={formState.expiresAt}
                    onChange={(event) =>
                      setFormState((state) => ({
                        ...state,
                        expiresAt: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key-description">
                    {t("system:apiKeys.create.descriptionLabel")}
                  </Label>
                  <Textarea
                    id="api-key-description"
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((state) => ({
                        ...state,
                        description: event.target.value,
                      }))
                    }
                    placeholder={t("system:apiKeys.create.descriptionPlaceholder")}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createApiKeyMutation.isPending || !isAdmin}
                >
                  {t("system:apiKeys.create.submit")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatKeyPreview(key: ApiKey) {
  const prefix = key.prefix ?? "";
  const start = key.start ?? "";
  if (!prefix && !start) {
    return "";
  }
  return `${prefix}${start}…`;
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
