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
import type { RefObject } from "react";
import type { ThemeFormApi, ThemeTranslateFn } from "../lib/types";
import type { ThemeLogoMode } from "@/orpc/routes/settings/routes/theme.upload-logo.schema";

type UnifiedImagesCardProps = {
  sectionId: string;
  form: ThemeFormApi;
  draft: ThemeConfig;
  baseTheme: ThemeConfig;
  onPickFile: (mode: ThemeLogoMode) => void;
  onFileSelected: (mode: ThemeLogoMode, file: File | null) => void;
  // Logo refs
  lightInputRef: RefObject<HTMLInputElement | null>;
  darkInputRef: RefObject<HTMLInputElement | null>;
  lightIconInputRef: RefObject<HTMLInputElement | null>;
  darkIconInputRef: RefObject<HTMLInputElement | null>;
  // Platform image refs
  authLightInputRef: RefObject<HTMLInputElement | null>;
  authDarkInputRef: RefObject<HTMLInputElement | null>;
  backgroundLightInputRef: RefObject<HTMLInputElement | null>;
  backgroundDarkInputRef: RefObject<HTMLInputElement | null>;
  faviconInputRef: RefObject<HTMLInputElement | null>;
  appleTouchIconInputRef: RefObject<HTMLInputElement | null>;
  favicon96InputRef: RefObject<HTMLInputElement | null>;
  faviconSvgInputRef: RefObject<HTMLInputElement | null>;
  uploadStatus: Record<ThemeLogoMode, boolean>;
  t: ThemeTranslateFn;
};

type ImagePair = {
  category: string;
  lightMode: ThemeLogoMode;
  darkMode: ThemeLogoMode;
  lightTitle: string;
  darkTitle: string;
  description: string;
  lightInputRef: RefObject<HTMLInputElement | null>;
  darkInputRef: RefObject<HTMLInputElement | null>;
  lightFallback?: string;
  darkFallback?: string;
};

type SingleImage = {
  category: string;
  mode: ThemeLogoMode;
  title: string;
  description: string;
  inputRef: RefObject<HTMLInputElement | null>;
  backgroundClass: string;
  fallback?: string;
};

export function UnifiedImagesCard({
  sectionId,
  draft,
  onPickFile,
  onFileSelected,
  lightInputRef,
  darkInputRef,
  lightIconInputRef,
  darkIconInputRef,
  authLightInputRef,
  authDarkInputRef,
  backgroundLightInputRef,
  backgroundDarkInputRef,
  faviconInputRef,
  appleTouchIconInputRef,
  favicon96InputRef,
  faviconSvgInputRef,
  uploadStatus,
  t,
}: UnifiedImagesCardProps) {
  const imagePairs: ImagePair[] = [
    {
      category: "Application Logo",
      lightMode: "light",
      darkMode: "dark",
      lightTitle: "Light",
      darkTitle: "Dark",
      description: t("logoLightDescription"),
      lightInputRef,
      darkInputRef,
      lightFallback: "/logos/settlemint-logo-h-lm.svg",
      darkFallback: "/logos/settlemint-logo-h-dm.svg",
    },
    {
      category: "Logo Icon",
      lightMode: "lightIcon",
      darkMode: "darkIcon",
      lightTitle: "Light",
      darkTitle: "Dark",
      description: t("logoLightIconDescription"),
      lightInputRef: lightIconInputRef,
      darkInputRef: darkIconInputRef,
      lightFallback: "/logos/settlemint-logo-i-lm.svg",
      darkFallback: "/logos/settlemint-logo-i-dm.svg",
    },
    {
      category: "Authentication Logo",
      lightMode: "authLight",
      darkMode: "authDark",
      lightTitle: "Light",
      darkTitle: "Dark",
      description: t("authLightDescription"),
      lightInputRef: authLightInputRef,
      darkInputRef: authDarkInputRef,
      // Default to application logo if not set
      lightFallback: draft.logo.lightUrl ?? "/logos/settlemint-logo-h-lm.svg",
      darkFallback: draft.logo.darkUrl ?? "/logos/settlemint-logo-h-dm.svg",
    },
    {
      category: "Background Image",
      lightMode: "backgroundLight",
      darkMode: "backgroundDark",
      lightTitle: "Light",
      darkTitle: "Dark",
      description: t("backgroundLightDescription"),
      lightInputRef: backgroundLightInputRef,
      darkInputRef: backgroundDarkInputRef,
    },
  ];

  const singleImages: SingleImage[] = [
    {
      category: t("faviconLabel"),
      mode: "favicon",
      title: t("faviconLabel"),
      description: t("faviconDescription"),
      inputRef: faviconInputRef,
      backgroundClass: "bg-white border border-border",
    },
    {
      category: "Apple Touch Icon",
      mode: "appleTouchIcon",
      title: "Apple Touch Icon",
      description: "180x180px icon for iOS home screen (apple-touch-icon)",
      inputRef: appleTouchIconInputRef,
      backgroundClass: "bg-white border border-border",
      fallback: "/apple-touch-icon.png",
    },
    {
      category: "Favicon 96x96",
      mode: "favicon96",
      title: "Favicon 96x96",
      description: "96x96px PNG favicon for modern browsers",
      inputRef: favicon96InputRef,
      backgroundClass: "bg-white border border-border",
      fallback: "/favicon-96x96.png",
    },
    {
      category: "Favicon SVG",
      mode: "faviconSvg",
      title: "Favicon SVG",
      description: "Scalable SVG favicon for modern browsers",
      inputRef: faviconSvgInputRef,
      backgroundClass: "bg-white border border-border",
      fallback: "/favicon.svg",
    },
  ];

  const resolveField = (mode: ThemeLogoMode): string => {
    switch (mode) {
      case "light":
        return "logo.lightUrl";
      case "dark":
        return "logo.darkUrl";
      case "lightIcon":
        return "logo.lightIconUrl";
      case "darkIcon":
        return "logo.darkIconUrl";
      case "authLight":
        return "images.authLightUrl";
      case "authDark":
        return "images.authDarkUrl";
      case "backgroundLight":
        return "images.backgroundLightUrl";
      case "backgroundDark":
        return "images.backgroundDarkUrl";
      case "favicon":
        return "images.faviconUrl";
      case "appleTouchIcon":
        return "images.appleTouchIconUrl";
      case "favicon96":
        return "images.favicon96Url";
      case "faviconSvg":
        return "images.faviconSvgUrl";
    }
  };

  const getImageUrl = (mode: ThemeLogoMode): string | undefined => {
    const field = resolveField(mode);
    const [section, key] = field.split(".");
    if (section === "logo") {
      return draft.logo[key as keyof typeof draft.logo] as string | undefined;
    }
    return draft.images[key as keyof typeof draft.images];
  };

  const renderImagePreview = (
    mode: ThemeLogoMode,
    backgroundClass: string,
    fallback?: string
  ) => {
    const url = getImageUrl(mode) ?? fallback;
    const isUploading = uploadStatus[mode];
    const isBackgroundImage =
      mode === "backgroundLight" || mode === "backgroundDark";

    // For background images, show as cover; for logos/icons, show contained
    if (isBackgroundImage) {
      return (
        <div
          className={cn(
            "relative h-64 w-full rounded-lg overflow-hidden",
            backgroundClass
          )}
          style={{
            backgroundImage: url ? `url(${url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : url ? null : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "relative flex h-32 w-full items-center justify-center rounded-lg overflow-hidden",
          backgroundClass
        )}
      >
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : url ? (
          <img
            src={url}
            alt="Preview"
            className="max-h-full max-w-full object-contain p-2"
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
    );
  };

  return (
    <div id={sectionId} className="space-y-6">
      {/* Image Pairs - Light and Dark side by side in individual cards */}
      {imagePairs.map((pair) => (
        <Card key={pair.category}>
          <CardHeader>
            <CardTitle className="text-base">{pair.category}</CardTitle>
            <CardDescription>{pair.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Light Mode */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{pair.lightTitle}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onPickFile(pair.lightMode);
                    }}
                    disabled={uploadStatus[pair.lightMode]}
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    {t("logoUploadButton")}
                  </Button>
                </div>
                {renderImagePreview(
                  pair.lightMode,
                  "bg-white border border-border",
                  pair.lightFallback
                )}
                <Input
                  ref={pair.lightInputRef}
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    onFileSelected(pair.lightMode, file);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Dark Mode */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{pair.darkTitle}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onPickFile(pair.darkMode);
                    }}
                    disabled={uploadStatus[pair.darkMode]}
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    {t("logoUploadButton")}
                  </Button>
                </div>
                {renderImagePreview(
                  pair.darkMode,
                  "bg-zinc-900 border border-zinc-700",
                  pair.darkFallback
                )}
                <Input
                  ref={pair.darkInputRef}
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    onFileSelected(pair.darkMode, file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Metadata Images - All single images in one card, two-column grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata Images</CardTitle>
          <CardDescription>
            Browser icons and social media preview images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {singleImages.map((single) => (
              <div key={single.mode} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{single.title}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onPickFile(single.mode);
                    }}
                    disabled={uploadStatus[single.mode]}
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    {t("logoUploadButton")}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {single.description}
                </div>
                {renderImagePreview(
                  single.mode,
                  single.backgroundClass,
                  single.fallback
                )}
                <Input
                  ref={single.inputRef}
                  type="file"
                  accept="image/x-icon,image/png,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    onFileSelected(single.mode, file);
                    e.target.value = "";
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
