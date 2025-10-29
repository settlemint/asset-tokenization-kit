import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form/tanstack-form";
import type { ThemeConfig } from "../lib/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImageIcon, UploadCloud } from "lucide-react";
import type { ThemeFormApi, ThemeTranslateFn } from "../lib/types";
import type { ThemeLogoMode } from "@/orpc/routes/settings/routes/theme.upload-logo.schema";
import { Upload } from "@better-upload/react";
import { orpc } from "@/orpc/orpc-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

type LogoSettingsCardProps = {
  sectionId: string;
  form: ThemeFormApi;
  draft: ThemeConfig;
  baseTheme: ThemeConfig;
  t: ThemeTranslateFn;
};

export function LogoSettingsCard({
  sectionId,
  form,
  draft,
  baseTheme,
  t,
}: LogoSettingsCardProps) {
  const [uploadingMode, setUploadingMode] = useState<ThemeLogoMode | null>(null);

  const { mutateAsync: getUploadUrl } = useMutation({
    ...orpc.settings.theme.uploadLogo.mutationOptions(),
  });

  const resolveLogoField = (
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

  const handleFileUpload = async (mode: ThemeLogoMode, file: File) => {
    setUploadingMode(mode);
    const logoField = resolveLogoField(mode);
    const fieldPath = `logo.${logoField}` as const;

    try {
      // Step 1: Get presigned upload URL from backend
      const uploadInfo = await getUploadUrl({
        mode,
        fileName: file.name,
        contentType: file.type as "image/svg+xml" | "image/png" | "image/webp",
        fileSize: file.size,
      });

      // Step 2: Upload file to MinIO using presigned URL
      const uploadResponse = await fetch(uploadInfo.uploadUrl, {
        method: uploadInfo.method,
        headers: uploadInfo.headers ?? {},
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
        );
      }

      // Step 3: Update form with public URL
      form.setFieldValue(fieldPath, uploadInfo.publicUrl);
      const uploadedAt = new Date().toISOString();
      form.setFieldValue("logo.updatedAt", uploadedAt);

      const etag = uploadResponse.headers.get("etag") ?? uploadResponse.headers.get("ETag") ?? "";
      if (etag) {
        form.setFieldValue("logo.etag", etag);
      }

      toast.success(t("logoUploadSuccess"));
      return { url: uploadInfo.publicUrl };
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
      throw error;
    } finally {
      setUploadingMode(null);
    }
  };

  const logoModes: Array<{
    mode: ThemeLogoMode;
    title: string;
    description: string;
    backgroundClass: string;
    fallback: string;
  }> = [
    {
      mode: "light",
      title: t("logoLightLabel"),
      description: t("logoLightDescription"),
      backgroundClass: "bg-white border border-border",
      fallback: "/logos/settlemint-logo-h-lm.svg",
    },
    {
      mode: "dark",
      title: t("logoDarkLabel"),
      description: t("logoDarkDescription"),
      backgroundClass: "bg-zinc-900 border border-zinc-700",
      fallback: "/logos/settlemint-logo-h-dm.svg",
    },
    // Icon variants feed favicons and other compact surfaces.
    {
      mode: "lightIcon",
      title: t("logoLightIconLabel"),
      description: t("logoLightIconDescription"),
      backgroundClass: "bg-white border border-border",
      fallback: "/logos/settlemint-logo-i-lm.svg",
    },
    {
      mode: "darkIcon",
      title: t("logoDarkIconLabel"),
      description: t("logoDarkIconDescription"),
      backgroundClass: "bg-zinc-900 border border-zinc-700",
      fallback: "/logos/settlemint-logo-i-dm.svg",
    },
  ];

  return (
    <Card id={sectionId} className="scroll-mt-28">
      <CardHeader>
        <CardTitle>{t("logoSectionTitle")}</CardTitle>
        <CardDescription>{t("logoSectionDescription")}</CardDescription>
        <CardDescription>{t("logoPreviewHint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form.AppField
          name="logo.alt"
          validators={{
            onChange: ({ value }) => {
              if (typeof value === "string" && value.length > 200) {
                return t("logoAltError");
              }
              return undefined;
            },
          }}
        >
          {(field) => {
            const value =
              typeof field.state.value === "string" ? field.state.value : "";
            return (
              <FormItem>
                <FormLabel>{t("logoAltLabel")}</FormLabel>
                <FormControl>
                  <Input
                    value={value}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                    }}
                    placeholder={t("logoAltPlaceholder")}
                  />
                </FormControl>
                <FormDescription>{t("logoAltHelper")}</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        </form.AppField>

        <div className="space-y-6">
          {logoModes.map(
            ({ mode, title, description, backgroundClass, fallback }) => {
              const logoField = resolveLogoField(mode);
              const fieldName = `logo.${logoField}` as const;
              const isUploading = uploadingMode === mode;
              return (
                <form.Field key={mode} name={fieldName}>
                  {(field) => {
                    const currentUrl =
                      typeof field.state.value === "string"
                        ? field.state.value
                        : "";
                    const defaultUrl = baseTheme.logo[logoField] ?? "";
                    return (
                      <div className="space-y-3 rounded-lg border p-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <ImageIcon className="size-4" />
                            <span>{title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {description}
                          </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
                          <div className="space-y-3">
                            <Input
                              value={currentUrl}
                              onChange={(event) => {
                                field.handleChange(event.target.value);
                              }}
                              placeholder={t("logoUrlPlaceholder")}
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <Upload
                                onFileSelect={async (file) => {
                                  await handleFileUpload(mode, file);
                                }}
                                onError={(error) => {
                                  console.error("Upload error:", error);
                                  toast.error("Failed to upload file");
                                }}
                                accept="image/svg+xml,image/png,image/webp"
                                maxSize={5 * 1024 * 1024}
                              >
                                {({ openFilePicker }) => (
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={openFilePicker}
                                    disabled={isUploading}
                                  >
                                    <UploadCloud className="mr-2 size-4" />
                                    {isUploading ? "Uploading..." : t("logoUploadButton")}
                                  </Button>
                                )}
                              </Upload>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  field.handleChange(defaultUrl);
                                }}
                              >
                                {t("logoResetButton")}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div
                              className={cn(
                                "flex h-24 items-center justify-center rounded-md overflow-hidden py-2 px-4",
                                backgroundClass
                              )}
                            >
                              <img
                                src={
                                  currentUrl.length > 0
                                    ? currentUrl
                                    : defaultUrl.length > 0
                                      ? defaultUrl
                                      : fallback
                                }
                                alt={
                                  draft.logo.alt ?? baseTheme.logo.alt ?? "Logo"
                                }
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </form.Field>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
}
