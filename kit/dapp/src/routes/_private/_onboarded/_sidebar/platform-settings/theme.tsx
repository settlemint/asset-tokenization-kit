import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { FontSettingsCard } from "@/components/theme/components/font-settings-card";
import { LogoSettingsCard } from "@/components/theme/components/logo-settings-card";
import { PaletteCard } from "@/components/theme/components/palette-card";
import { StatusBanner } from "@/components/theme/components/status-banner";
import { ThemePreviewPanel } from "@/components/theme/components/theme-preview-panel";
import {
  compileThemeCSS,
  resolveFontVariables,
} from "@/components/theme/lib/compile-css";
import { PALETTE_TOKENS } from "@/components/theme/lib/constants";
import {
  prepareThemePayload,
  sanitizeLogoUrlForPayload,
} from "@/components/theme/lib/payload";
import { DEFAULT_THEME, type ThemeConfig } from "@/components/theme/lib/schema";
import { queueThemeDomUpdates } from "@/components/theme/lib/theme-dom-updater";
import type { IdleHandle } from "@/components/theme/lib/theme-editor-helpers";
import {
  applyPreviewFontLinks,
  cancelIdleCallbackCompat,
  cloneThemeConfig,
  countChangedTokens,
  fallbackCompileTheme,
  isReferenceValue,
  removePreviewFontLinks,
  restoreThemeOverridesCss,
  scheduleIdleCallbackCompat,
  setThemeOverridesCss,
  THEME_COMPILE_THRESHOLD,
} from "@/components/theme/lib/theme-editor-helpers";
import type { ThemeFormApi } from "@/components/theme/lib/types";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm } from "@/hooks/use-app-form";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import {
  formatValidationError,
  getFieldErrors,
  isValidationError,
} from "@/lib/utils/format-validation-error";
import { localStorageService } from "@/lib/utils/local-storage";
import { orpc } from "@/orpc/orpc-client";
import type {
  ThemeLogoMode,
  ThemeLogoUploadInput,
  ThemeLogoUploadOutput,
} from "@/orpc/routes/settings/routes/theme.upload-logo.schema";
import { useStore } from "@tanstack/react-form";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type ThemeDraftStorage = {
  version: number;
  draft: ThemeConfig;
  updatedAt: string;
};

type ThemeMutationContext = {
  previousTheme?: ThemeConfig;
  previousStyle: ReturnType<typeof setThemeOverridesCss>;
};

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/platform-settings/theme"
)({
  loader: async ({ context: { queryClient, orpc: orpcClient } }) => {
    const user = await queryClient.ensureQueryData(
      orpcClient.user.me.queryOptions()
    );
    const isAdmin = user.role === "admin";

    if (isAdmin) {
      await queryClient.ensureQueryData(
        orpcClient.settings.theme.get.queryOptions({ input: {} })
      );
    }

    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/platform-settings/theme",
        }),
        createI18nBreadcrumbMetadata("settings.theme.title"),
      ],
      isAdmin,
      userId: user.id,
    };
  },
  component: ThemeSettingsPage,
});

function ThemeSettingsPage() {
  const { t } = useTranslation(["navigation", "settings"]);
  const { t: tTheme } = useTranslation("settings", { keyPrefix: "theme" });
  const { isAdmin, userId } = Route.useLoaderData();

  const normalizeFieldPath = (path: string): string =>
    path.replaceAll(/\[(\w+)\]/g, "." + "$1").replace(/^[.]+/, "");

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <RouterBreadcrumb />
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>
            {t("settings.theme.notAuthorized", { ns: "navigation" })}
          </AlertTitle>
        </Alert>
      </div>
    );
  }

  const { data: baseTheme } = useSuspenseQuery(
    orpc.settings.theme.get.queryOptions({ input: {} })
  );
  const queryClient = useQueryClient();
  const themeQueryKey = orpc.settings.theme.get.queryKey({ input: {} });
  const { mutateAsync: mutateTheme, isPending: isThemeMutationPending } =
    useMutation({
      ...orpc.settings.theme.update.mutationOptions(),
      onMutate: async (payload: ThemeConfig): Promise<ThemeMutationContext> => {
        await queryClient.cancelQueries({ queryKey: themeQueryKey });
        const previousTheme =
          queryClient.getQueryData<ThemeConfig>(themeQueryKey);
        const previousStyle = setThemeOverridesCss(compileThemeCSS(payload), {
          state: "pending",
          origin: "optimistic",
        });
        queryClient.setQueryData(themeQueryKey, payload);
        return {
          previousTheme,
          previousStyle,
        };
      },
      onError: (_error, _payload, context) => {
        if (context?.previousTheme) {
          queryClient.setQueryData(themeQueryKey, context.previousTheme);
        }
        restoreThemeOverridesCss(context?.previousStyle);
      },
    });
  const { mutateAsync: uploadLogoMutation } = useMutation({
    ...orpc.settings.theme.uploadLogo.mutationOptions(),
  });
  const storageKey = `theme-editor:${userId}`;

  const form = useAppForm({
    defaultValues: cloneThemeConfig(baseTheme),
  }) as ThemeFormApi;
  const [validationSummary, setValidationSummary] = useState<string | null>(
    null
  );
  const [logoUploadStatus, setLogoUploadStatus] = useState<
    Record<ThemeLogoMode, boolean>
  >({
    light: false,
    dark: false,
    lightIcon: false,
    darkIcon: false,
  });

  const logoObjectUrls = useRef<Partial<Record<ThemeLogoMode, string>>>({});
  const lightLogoInputRef = useRef<HTMLInputElement | null>(null);
  const darkLogoInputRef = useRef<HTMLInputElement | null>(null);
  const lightIconLogoInputRef = useRef<HTMLInputElement | null>(null);
  const darkIconLogoInputRef = useRef<HTMLInputElement | null>(null);
  const lastSavedDraftRef = useRef<string | null>(null);
  const previewStyleElementRef = useRef<HTMLStyleElement | null>(null);

  const clearValidationErrors = () => {
    form.setErrorMap({ onSubmit: undefined });
    setValidationSummary(null);
  };

  const applyValidationErrors = (error: unknown) => {
    const summaryMessage = formatValidationError(error);
    setValidationSummary(summaryMessage);

    if (isValidationError(error)) {
      const fieldErrors = getFieldErrors(error);
      const normalizedFieldErrors = Object.entries(fieldErrors).reduce<
        Record<string, string>
      >((acc, [path, message]) => {
        const normalized = normalizeFieldPath(path);
        if (!normalized) {
          return acc;
        }
        acc[normalized] = message;
        return acc;
      }, {});

      form.setErrorMap({
        onSubmit: {
          form: summaryMessage,
          fields: normalizedFieldErrors as never,
        },
      });
      return;
    }

    form.setErrorMap({
      onSubmit: {
        form: summaryMessage,
        fields: {} as never,
      },
    });
  };

  useEffect(() => {
    const storedDraft = localStorageService.get<ThemeDraftStorage | null>(
      storageKey,
      null
    );

    if (storedDraft && storedDraft.version === baseTheme.metadata.version) {
      applyDraftTheme(storedDraft.draft);
      lastSavedDraftRef.current = JSON.stringify(storedDraft.draft);
      return;
    }

    applyDraftTheme(baseTheme);
    lastSavedDraftRef.current = JSON.stringify(baseTheme);

    if (storedDraft) {
      localStorageService.getLocalStorage()?.removeItem(storageKey);
    }
    // oxlint-disable-next-line exhaustive-deps
  }, [baseTheme, form, storageKey]);

  const draft = useStore(
    form.store,
    (state) => (state as { values: ThemeConfig }).values
  );
  const [previewDraft, setPreviewDraft] = useState<ThemeConfig>(draft);
  const [compiledCss, setCompiledCss] = useState<string>(() =>
    compileThemeCSS(draft)
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const updatePreviewDraft = useDebouncedCallback((nextDraft: ThemeConfig) => {
    setPreviewDraft(nextDraft);
  }, 200);
  const latestDraftRef = useRef(previewDraft);
  const workerRef = useRef<Worker | null>(null);
  const idleCallbackRef = useRef<IdleHandle | null>(null);
  const compileRequestIdRef = useRef(0);

  const clearLogoObjectUrls = () => {
    Object.values(logoObjectUrls.current).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    logoObjectUrls.current = {};
  };

  const getDraftSnapshot = () =>
    cloneThemeConfig(form.state.values as ThemeConfig);

  const applyDraftTheme = (theme: ThemeConfig, precompiledCss?: string) => {
    const cloned = cloneThemeConfig(theme);
    form.reset(cloned);
    setPreviewDraft(cloned);
    setCompiledCss(precompiledCss ?? compileThemeCSS(cloned));
    setIsCompiling(false);
    setLogoUploadStatus({
      light: false,
      dark: false,
      lightIcon: false,
      darkIcon: false,
    });
    clearLogoObjectUrls();
  };

  const handlePostUpdate = (theme: ThemeConfig) => {
    clearValidationErrors();
    const compiledCss = compileThemeCSS(theme);
    applyDraftTheme(theme, compiledCss);
    setThemeOverridesCss(compiledCss, { state: "ready", origin: "persisted" });
    queryClient.setQueryData(themeQueryKey, theme);
    localStorageService.getLocalStorage()?.removeItem(storageKey);
    lastSavedDraftRef.current = JSON.stringify(theme);
  };

  const createPayloadFromTheme = (theme: ThemeConfig): ThemeConfig => {
    const payload = cloneThemeConfig(theme);
    payload.metadata = {
      ...payload.metadata,
      version: baseTheme.metadata.version,
      updatedBy:
        payload.metadata.updatedBy ?? baseTheme.metadata.updatedBy ?? "system",
      updatedAt:
        payload.metadata.updatedAt ??
        baseTheme.metadata.updatedAt ??
        new Date().toISOString(),
    };
    return payload;
  };

  const runThemeMutation = async (
    payload: ThemeConfig,
    messages: {
      loading: string;
      success: string;
      error: (error: Error) => string;
    }
  ) => {
    clearValidationErrors();
    const mutationPromise = mutateTheme(payload).then((result) => {
      handlePostUpdate(result.theme);
      return result;
    });

    toast.promise(mutationPromise, {
      loading: messages.loading,
      success: () => messages.success,
      error: (error: Error) => messages.error(error),
    });

    try {
      await mutationPromise;
    } catch (error) {
      applyValidationErrors(error);
    }
  };

  const handleApplyTheme = (
    payload: ThemeConfig,
    messages: {
      loading: string;
      success: string;
      error: (error: Error) => string;
    }
  ) => runThemeMutation(payload, messages);

  const handleResetToDefaults = async () => {
    clearValidationErrors();
    const defaultDraft = createPayloadFromTheme(DEFAULT_THEME);
    const sanitizedUpdatedBy =
      typeof baseTheme.metadata.updatedBy === "string" &&
      baseTheme.metadata.updatedBy.trim().length > 0
        ? baseTheme.metadata.updatedBy
        : defaultDraft.metadata.updatedBy;

    defaultDraft.metadata = {
      ...defaultDraft.metadata,
      version: baseTheme.metadata.version,
      updatedBy: sanitizedUpdatedBy,
      updatedAt:
        baseTheme.metadata.updatedAt ?? defaultDraft.metadata.updatedAt,
    };
    applyDraftTheme(defaultDraft);
    await handleApplyTheme(prepareThemePayload(defaultDraft), {
      loading: tTheme("resetDefaultsLoading"),
      success: tTheme("resetDefaultsSuccess"),
      error: (error: Error) =>
        tTheme("resetDefaultsError", {
          message: error.message,
        }),
    });
  };

  const handleSaveTheme = async () => {
    await runThemeMutation(prepareThemePayload(createPayloadFromTheme(draft)), {
      loading: tTheme("saveLoading"),
      success: tTheme("saveSuccess"),
      error: (error) =>
        tTheme("saveError", {
          message: error.message,
        }),
    });
  };

  useEffect(() => {
    updatePreviewDraft(draft);
  }, [draft, updatePreviewDraft]);

  useEffect(() => {
    latestDraftRef.current = previewDraft;
  }, [previewDraft]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const existingElement = document.querySelector("#theme-preview");
    let styleElement: HTMLStyleElement;
    let restoreContent: string | null = null;
    let restoreMode: string | undefined;
    let restoreSource: string | undefined;
    const createdElement = !(existingElement instanceof HTMLStyleElement);

    if (createdElement) {
      styleElement = document.createElement("style");
      styleElement.id = "theme-preview";
      document.head.append(styleElement);
    } else {
      styleElement = existingElement;
      restoreContent = styleElement.textContent ?? "";
      restoreMode = styleElement.dataset.mode;
      restoreSource = styleElement.dataset.source;
    }

    styleElement.dataset.mode = "draft";
    styleElement.dataset.source = "theme-editor";
    previewStyleElementRef.current = styleElement;

    return () => {
      const target = previewStyleElementRef.current;
      if (!target) {
        return;
      }
      if (createdElement) {
        target.remove();
      } else {
        target.textContent = restoreContent ?? "";
        if (restoreMode) {
          target.dataset.mode = restoreMode;
        } else {
          delete target.dataset.mode;
        }
        if (restoreSource) {
          target.dataset.source = restoreSource;
        } else {
          delete target.dataset.source;
        }
        delete target.dataset.state;
      }
      previewStyleElementRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!previewStyleElementRef.current) {
      return;
    }
    previewStyleElementRef.current.dataset.state = isCompiling
      ? "pending"
      : "ready";
    if (isCompiling) {
      return;
    }
    previewStyleElementRef.current.textContent = compiledCss;
  }, [compiledCss, isCompiling]);

  const draftSerialized = useMemo(() => JSON.stringify(draft), [draft]);
  const baseSerialized = useMemo(() => JSON.stringify(baseTheme), [baseTheme]);
  const hasUnsavedChanges = draftSerialized !== baseSerialized;
  const hasPendingLogoUpload = Object.values(logoUploadStatus).some(Boolean);

  const resolveLogoFieldKey = (
    mode: ThemeLogoMode
  ): "lightUrl" | "darkUrl" | "lightIconUrl" | "darkIconUrl" => {
    switch (mode) {
      case "light":
        return "lightUrl";
      case "dark":
        return "darkUrl";
      case "lightIcon":
        return "lightIconUrl";
      case "darkIcon":
        return "darkIconUrl";
    }
  };

  const resolveFallbackLogo = (mode: ThemeLogoMode): string => {
    switch (mode) {
      case "light":
        return "/logos/settlemint-logo-h-lm.svg";
      case "dark":
        return "/logos/settlemint-logo-h-dm.svg";
      case "lightIcon":
        return "/logos/settlemint-logo-i-lm.svg";
      case "darkIcon":
        return "/logos/settlemint-logo-i-dm.svg";
    }
  };

  const handleLogoFile = (mode: ThemeLogoMode, file: File | null) => {
    if (!file) {
      return;
    }

    const fieldKey = resolveLogoFieldKey(mode);
    const fieldPath = `logo.${fieldKey}` as const;
    const currentValues = form.state.values as ThemeConfig;
    const previousValue = currentValues.logo[fieldKey];

    const previousObjectUrl = logoObjectUrls.current[mode];
    if (previousObjectUrl) {
      URL.revokeObjectURL(previousObjectUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    logoObjectUrls.current[mode] = objectUrl;
    form.setFieldValue(fieldPath, objectUrl);

    const optimisticDraft = cloneThemeConfig(draft);
    optimisticDraft.logo[fieldKey] = objectUrl;
    updatePreviewDraft(optimisticDraft);

    setLogoUploadStatus((state) => ({ ...state, [mode]: true }));

    const previousSanitized = sanitizeLogoUrlForPayload(
      typeof previousValue === "string" ? previousValue : undefined
    );

    const fallbackUrl =
      (typeof previousValue === "string" && previousValue.length > 0
        ? previousValue
        : (() => {
            const baseUrl = baseTheme.logo[fieldKey] ?? "";
            if (baseUrl.length > 0) {
              return baseUrl;
            }
            return resolveFallbackLogo(mode);
          })()) ?? resolveFallbackLogo(mode);

    const contentType = file.type as ThemeLogoUploadInput["contentType"];

    const uploadPromise = uploadLogoMutation({
      mode,
      fileName: file.name,
      contentType,
      fileSize: file.size,
      previousUrl: previousSanitized,
    }).then(async (result: ThemeLogoUploadOutput) => {
      const headers = new Headers(result.headers ?? {});
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", contentType);
      }

      const response = await fetch(result.uploadUrl, {
        method: result.method,
        headers,
        // oxlint-disable-next-line no-invalid-fetch-options
        body: file,
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed with status ${response.status} ${response.statusText}`
        );
      }

      const etag =
        response.headers.get("etag") ?? response.headers.get("ETag") ?? "";
      const uploadedAt = new Date().toISOString();

      return { result, etag, uploadedAt };
    });

    uploadPromise
      .then(({ result, etag, uploadedAt }) => {
        const nextDraft = getDraftSnapshot();
        nextDraft.logo[fieldKey] = result.publicUrl;
        nextDraft.logo.etag = etag.length > 0 ? etag : nextDraft.logo.etag;
        nextDraft.logo.updatedAt = uploadedAt;
        updatePreviewDraft(nextDraft);
        form.setFieldValue(fieldPath, result.publicUrl);
        if (etag.length > 0) {
          form.setFieldValue("logo.etag", etag);
        }
        form.setFieldValue("logo.updatedAt", uploadedAt);
        toast.success(tTheme("logoUploadSuccess"));
      })
      .catch((error: unknown) => {
        const fallbackDraft = getDraftSnapshot();
        fallbackDraft.logo[fieldKey] = fallbackUrl;
        updatePreviewDraft(fallbackDraft);
        form.setFieldValue(fieldPath, fallbackUrl);
        toast.error(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        setLogoUploadStatus((state) => ({ ...state, [mode]: false }));
        URL.revokeObjectURL(objectUrl);
        logoObjectUrls.current[mode] = undefined;
      });
  };

  const openLogoFileDialog = (mode: ThemeLogoMode) => {
    const target = (() => {
      switch (mode) {
        case "light":
          return lightLogoInputRef.current;
        case "dark":
          return darkLogoInputRef.current;
        case "lightIcon":
          return lightIconLogoInputRef.current;
        case "darkIcon":
          return darkIconLogoInputRef.current;
      }
    })();
    target?.click();
  };

  useEffect(() => {
    return () => {
      clearLogoObjectUrls();
    };
  }, []);

  const draftFontsSignature = useMemo(() => {
    return JSON.stringify(previewDraft.fonts);
  }, [previewDraft]);

  const baseFontsSignature = useMemo(() => {
    return JSON.stringify(baseTheme.fonts);
  }, [baseTheme]);

  const draftFontVariables = useMemo(() => {
    return resolveFontVariables(previewDraft.fonts);
  }, [previewDraft]);

  const baseFontVariables = useMemo(() => {
    return resolveFontVariables(baseTheme.fonts);
  }, [baseTheme]);

  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    if (!hasUnsavedChanges) {
      if (lastSavedDraftRef.current !== null) {
        localStorageService.getLocalStorage()?.removeItem(storageKey);
        lastSavedDraftRef.current = null;
      }
      return;
    }

    if (lastSavedDraftRef.current === draftSerialized) {
      return;
    }

    localStorageService.set(storageKey, {
      version: baseTheme.metadata.version,
      draft,
      updatedAt: new Date().toISOString(),
    });
    lastSavedDraftRef.current = draftSerialized;
  }, [
    baseTheme.metadata.version,
    draft,
    draftSerialized,
    hasUnsavedChanges,
    storageKey,
  ]);

  useEffect(() => {
    if (draftFontsSignature === baseFontsSignature) {
      removePreviewFontLinks();
      queueThemeDomUpdates(baseFontVariables);
      return () => {
        queueThemeDomUpdates(baseFontVariables);
      };
    }

    removePreviewFontLinks();
    applyPreviewFontLinks(previewDraft.fonts);
    queueThemeDomUpdates(draftFontVariables);

    return () => {
      removePreviewFontLinks();
      queueThemeDomUpdates(baseFontVariables);
    };
  }, [
    baseFontVariables,
    baseFontsSignature,
    draftFontVariables,
    draftFontsSignature,
    previewDraft,
  ]);

  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    const nextRequestId = compileRequestIdRef.current + 1;
    compileRequestIdRef.current = nextRequestId;

    if (idleCallbackRef.current !== null) {
      cancelIdleCallbackCompat(idleCallbackRef.current);
      idleCallbackRef.current = null;
    }

    const totalTokenChanges = countChangedTokens(baseTheme, previewDraft);

    if (totalTokenChanges > THEME_COMPILE_THRESHOLD) {
      setIsCompiling(true);

      if (
        globalThis.window !== undefined &&
        typeof globalThis.Worker === "function"
      ) {
        if (workerRef.current === null) {
          const worker = new globalThis.Worker(
            /* @vite-ignore */ new URL(
              "@/components/theme/lib/theme-css.worker.ts",
              import.meta.url
            ),
            { type: "module" }
          );
          worker.addEventListener(
            "message",
            (event: MessageEvent<ThemeCompileWorkerResponse>) => {
              const { id, css } = event.data;
              if (id !== compileRequestIdRef.current) {
                return;
              }
              if (typeof css === "string") {
                setCompiledCss(css);
                setIsCompiling(false);
                return;
              }
              fallbackCompileTheme(
                () => latestDraftRef.current,
                setCompiledCss,
                setIsCompiling
              );
            }
          );
          worker.addEventListener("error", () => {
            fallbackCompileTheme(
              () => latestDraftRef.current,
              setCompiledCss,
              setIsCompiling
            );
          });
          workerRef.current = worker;
        }

        workerRef.current.postMessage({
          id: nextRequestId,
          theme: previewDraft,
        } satisfies ThemeCompileWorkerRequest);

        return () => {
          // Worker responses are ignored via requestId guard; nothing to cancel.
        };
      }

      idleCallbackRef.current = scheduleIdleCallbackCompat(() => {
        fallbackCompileTheme(
          () => latestDraftRef.current,
          setCompiledCss,
          setIsCompiling
        );
      });

      return () => {
        if (idleCallbackRef.current !== null) {
          cancelIdleCallbackCompat(idleCallbackRef.current);
          idleCallbackRef.current = null;
        }
      };
    }

    const css = compileThemeCSS(previewDraft);
    setCompiledCss(css);
    setIsCompiling(false);

    return () => {
      if (idleCallbackRef.current !== null) {
        cancelIdleCallbackCompat(idleCallbackRef.current);
        idleCallbackRef.current = null;
      }
    };
  }, [baseTheme, previewDraft]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (idleCallbackRef.current !== null) {
        cancelIdleCallbackCompat(idleCallbackRef.current);
        idleCallbackRef.current = null;
      }
    };
  }, []);

  const lightTokens = useMemo(
    () =>
      PALETTE_TOKENS.filter(
        (token) => !isReferenceValue(baseTheme.cssVars.light[token])
      ),
    [baseTheme]
  );

  const darkTokens = useMemo(
    () =>
      PALETTE_TOKENS.filter(
        (token) => !isReferenceValue(baseTheme.cssVars.dark[token])
      ),
    [baseTheme]
  );

  const editorTabs = useMemo(() => {
    const tabs: Array<{ value: string; label: string; description: string }> = [
      {
        value: "logos",
        label: tTheme("logoSectionTitle"),
        description: tTheme("logoSectionDescription"),
      },
      {
        value: "fonts",
        label: tTheme("fontsTitle"),
        description: tTheme("fontsDescription"),
      },
    ];

    if (lightTokens.length > 0) {
      tabs.push({
        value: "palette-light",
        label: tTheme("lightPaletteTitle"),
        description: tTheme("lightPaletteDescription"),
      });
    }

    if (darkTokens.length > 0) {
      tabs.push({
        value: "palette-dark",
        label: tTheme("darkPaletteTitle"),
        description: tTheme("darkPaletteDescription"),
      });
    }

    return tabs;
    // oxlint-disable-next-line exhaustive-deps
  }, [t, lightTokens.length, darkTokens.length]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <RouterBreadcrumb />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">
              {t("navigation:settings.theme.title")}
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">{tTheme("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void handleResetToDefaults();
            }}
            disabled={isThemeMutationPending}
          >
            {tTheme("resetDefaultsButton")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="ml-auto"
            onClick={() => {
              void handleSaveTheme();
            }}
            disabled={
              isThemeMutationPending ||
              !hasUnsavedChanges ||
              hasPendingLogoUpload
            }
          >
            {isThemeMutationPending
              ? tTheme("savingButton")
              : tTheme("saveButton")}
          </Button>
        </div>
      </div>
      <StatusBanner
        hasUnsavedChanges={hasUnsavedChanges}
        validationSummary={validationSummary}
        t={tTheme}
      />
      <form.AppForm>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:gap-6">
          <div className="space-y-6">
            <Tabs
              defaultValue={editorTabs[0]?.value ?? "logos"}
              className="space-y-6"
            >
              <div className="overflow-x-auto">
                <TabsList className="flex w-full justify-start gap-2 bg-muted/30 p-1">
                  {editorTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      title={tab.description}
                    >
                      <span className="text-sm font-medium">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="logos" className="space-y-4">
                <LogoSettingsCard
                  sectionId="theme-logo"
                  form={form}
                  draft={draft}
                  baseTheme={baseTheme}
                  onPickFile={openLogoFileDialog}
                  onFileSelected={handleLogoFile}
                  lightInputRef={lightLogoInputRef}
                  darkInputRef={darkLogoInputRef}
                  lightIconInputRef={lightIconLogoInputRef}
                  darkIconInputRef={darkIconLogoInputRef}
                  uploadStatus={logoUploadStatus}
                  t={tTheme}
                />
              </TabsContent>

              <TabsContent value="fonts" className="space-y-4">
                <FontSettingsCard
                  sectionId="theme-fonts"
                  form={form}
                  draft={draft}
                  t={tTheme}
                />
              </TabsContent>

              {lightTokens.length > 0 ? (
                <TabsContent value="palette-light" className="space-y-4">
                  <PaletteCard
                    sectionId="theme-palette-light"
                    form={form}
                    baseTheme={baseTheme}
                    mode="light"
                    tokens={lightTokens}
                    t={tTheme}
                  />
                </TabsContent>
              ) : null}

              {darkTokens.length > 0 ? (
                <TabsContent value="palette-dark" className="space-y-4">
                  <PaletteCard
                    sectionId="theme-palette-dark"
                    form={form}
                    baseTheme={baseTheme}
                    mode="dark"
                    tokens={darkTokens}
                    t={tTheme}
                  />
                </TabsContent>
              ) : null}
            </Tabs>
          </div>
          <ThemePreviewPanel draft={previewDraft} t={tTheme} />
        </div>
      </form.AppForm>
    </div>
  );
}

type ThemeCompileWorkerRequest = {
  id: number;
  theme: ThemeConfig;
};

type ThemeCompileWorkerResponse = {
  id: number;
  css?: string;
  error?: string;
};
