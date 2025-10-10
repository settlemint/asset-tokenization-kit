"use client";

import { ImageUpload } from "@/components/branding/image-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_BRANDING } from "@/lib/db/schema";
import { orpc } from "@/orpc/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, Save } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * Branding Form Component
 *
 * Comprehensive form for managing platform branding:
 * - Application title
 * - Logos (main, sidebar, favicon)
 * - Backgrounds (light/dark mode)
 * - Color scheme (primary, secondary, state colors, etc.)
 */

export function BrandingForm() {
  const { t } = useTranslation("branding");
  const queryClient = useQueryClient();

  // Fetch current branding
  const { data: branding, isLoading } = useQuery(
    orpc.branding.read.queryOptions()
  );

  // Form state
  const [formData, setFormData] = React.useState({
    applicationTitle: "",
    logoMain: null as string | null,
    logoSidebar: null as string | null,
    logoFavicon: null as string | null,
    backgroundLight: null as string | null,
    backgroundDark: null as string | null,
    colorPrimary: null as string | null,
    colorPrimaryHover: null as string | null,
    colorSecondary: null as string | null,
    colorAccent: null as string | null,
    colorBackgroundDarkest: null as string | null,
    colorBackgroundLightest: null as string | null,
    colorBackgroundGradientStart: null as string | null,
    colorBackgroundGradientEnd: null as string | null,
    colorStateSuccess: null as string | null,
    colorStateSuccessBackground: null as string | null,
    colorStateWarning: null as string | null,
    colorStateWarningBackground: null as string | null,
    colorStateError: null as string | null,
    colorStateErrorBackground: null as string | null,
    colorGraphicsPrimary: null as string | null,
    colorGraphicsSecondary: null as string | null,
    colorGraphicsTertiary: null as string | null,
    colorGraphicsQuaternary: null as string | null,
    colorText: null as string | null,
    colorTextContrast: null as string | null,
    colorBorder: null as string | null,
    colorMuted: null as string | null,
    colorSidebar: null as string | null,
    colorSidebarForeground: null as string | null,
    colorSidebarPrimary: null as string | null,
    colorSidebarPrimaryForeground: null as string | null,
    colorSidebarAccent: null as string | null,
    colorSidebarAccentForeground: null as string | null,
    colorSidebarBorder: null as string | null,
    colorSidebarRing: null as string | null,
  });

  // Update form when branding data loads
  React.useEffect(() => {
    if (branding) {
      setFormData({
        applicationTitle: branding.applicationTitle || "",
        logoMain: branding.logoMain,
        logoSidebar: branding.logoSidebar,
        logoFavicon: branding.logoFavicon,
        backgroundLight: branding.backgroundLight,
        backgroundDark: branding.backgroundDark,
        colorPrimary: branding.colorPrimary,
        colorPrimaryHover: branding.colorPrimaryHover,
        colorSecondary: branding.colorSecondary,
        colorAccent: branding.colorAccent,
        colorBackgroundDarkest: branding.colorBackgroundDarkest,
        colorBackgroundLightest: branding.colorBackgroundLightest,
        colorBackgroundGradientStart: branding.colorBackgroundGradientStart,
        colorBackgroundGradientEnd: branding.colorBackgroundGradientEnd,
        colorStateSuccess: branding.colorStateSuccess,
        colorStateSuccessBackground: branding.colorStateSuccessBackground,
        colorStateWarning: branding.colorStateWarning,
        colorStateWarningBackground: branding.colorStateWarningBackground,
        colorStateError: branding.colorStateError,
        colorStateErrorBackground: branding.colorStateErrorBackground,
        colorGraphicsPrimary: branding.colorGraphicsPrimary,
        colorGraphicsSecondary: branding.colorGraphicsSecondary,
        colorGraphicsTertiary: branding.colorGraphicsTertiary,
        colorGraphicsQuaternary: branding.colorGraphicsQuaternary,
        colorText: branding.colorText,
        colorTextContrast: branding.colorTextContrast,
        colorBorder: branding.colorBorder,
        colorMuted: branding.colorMuted,
        colorSidebar: branding.colorSidebar,
        colorSidebarForeground: branding.colorSidebarForeground,
        colorSidebarPrimary: branding.colorSidebarPrimary,
        colorSidebarPrimaryForeground: branding.colorSidebarPrimaryForeground,
        colorSidebarAccent: branding.colorSidebarAccent,
        colorSidebarAccentForeground: branding.colorSidebarAccentForeground,
        colorSidebarBorder: branding.colorSidebarBorder,
        colorSidebarRing: branding.colorSidebarRing,
      });
    }
  }, [branding]);

  // Save mutation
  const saveMutation = useMutation(
    orpc.branding.upsert.mutationOptions({
      onSuccess: () => {
        // Force refetch to update the UI immediately
        queryClient.invalidateQueries({
          queryKey: orpc.branding.read.queryKey(),
        });
        // Also invalidate the branding provider query
        queryClient.refetchQueries({
          queryKey: orpc.branding.read.queryKey(),
        });
        toast.success(
          "Branding settings saved successfully. Refresh the page to see all changes."
        );
      },
      onError: (error) => {
        toast.error(`Failed to save branding: ${error.message}`);
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all branding to defaults? This will remove all customizations."
      )
    ) {
      setFormData({
        applicationTitle: DEFAULT_BRANDING.applicationTitle,
        logoMain: null,
        logoSidebar: null,
        logoFavicon: null,
        backgroundLight: null,
        backgroundDark: null,
        colorPrimary: null,
        colorPrimaryHover: null,
        colorSecondary: null,
        colorAccent: null,
        colorBackgroundDarkest: null,
        colorBackgroundLightest: null,
        colorBackgroundGradientStart: null,
        colorBackgroundGradientEnd: null,
        colorStateSuccess: null,
        colorStateSuccessBackground: null,
        colorStateWarning: null,
        colorStateWarningBackground: null,
        colorStateError: null,
        colorStateErrorBackground: null,
        colorGraphicsPrimary: null,
        colorGraphicsSecondary: null,
        colorGraphicsTertiary: null,
        colorGraphicsQuaternary: null,
        colorText: null,
        colorTextContrast: null,
        colorBorder: null,
        colorMuted: null,
        colorSidebar: null,
        colorSidebarForeground: null,
        colorSidebarPrimary: null,
        colorSidebarPrimaryForeground: null,
        colorSidebarAccent: null,
        colorSidebarAccentForeground: null,
        colorSidebarBorder: null,
        colorSidebarRing: null,
      });
      // Immediately save the defaults
      saveMutation.mutate({
        applicationTitle: DEFAULT_BRANDING.applicationTitle,
        logoMain: null,
        logoSidebar: null,
        logoFavicon: null,
        backgroundLight: null,
        backgroundDark: null,
        colorPrimary: null,
        colorPrimaryHover: null,
        colorSecondary: null,
        colorAccent: null,
        colorBackgroundDarkest: null,
        colorBackgroundLightest: null,
        colorBackgroundGradientStart: null,
        colorBackgroundGradientEnd: null,
        colorStateSuccess: null,
        colorStateSuccessBackground: null,
        colorStateWarning: null,
        colorStateWarningBackground: null,
        colorStateError: null,
        colorStateErrorBackground: null,
        colorGraphicsPrimary: null,
        colorGraphicsSecondary: null,
        colorGraphicsTertiary: null,
        colorGraphicsQuaternary: null,
        colorText: null,
        colorTextContrast: null,
        colorBorder: null,
        colorMuted: null,
        colorSidebar: null,
        colorSidebarForeground: null,
        colorSidebarPrimary: null,
        colorSidebarPrimaryForeground: null,
        colorSidebarAccent: null,
        colorSidebarAccentForeground: null,
        colorSidebarBorder: null,
        colorSidebarRing: null,
      });
      toast.success("Branding reset to defaults");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="logos">Logos</TabsTrigger>
          <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure the general application settings and title
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="applicationTitle">Application Title</Label>
                <Input
                  id="applicationTitle"
                  value={formData.applicationTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicationTitle: e.target.value,
                    })
                  }
                  placeholder="Asset Tokenization Kit"
                />
                <p className="text-sm text-muted-foreground">
                  This title appears in the browser tab and application header
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logos Tab */}
        <TabsContent value="logos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo Assets</CardTitle>
              <CardDescription>
                Upload logos for different parts of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                label="Main Logo"
                description="Primary logo displayed in the header (recommended: horizontal format, transparent background)"
                value={formData.logoMain}
                onChange={(url) => setFormData({ ...formData, logoMain: url })}
                imageType="logo_main"
                accept="image/png,image/svg+xml"
              />
              <Separator />
              <ImageUpload
                label="Sidebar Logo"
                description="Logo for collapsed sidebar (recommended: square format, icon-style)"
                value={formData.logoSidebar}
                onChange={(url) =>
                  setFormData({ ...formData, logoSidebar: url })
                }
                imageType="logo_sidebar"
                accept="image/png,image/svg+xml"
              />
              <Separator />
              <ImageUpload
                label="Favicon"
                description="Browser tab icon (recommended: 32x32 or 64x64 pixels)"
                value={formData.logoFavicon}
                onChange={(url) =>
                  setFormData({ ...formData, logoFavicon: url })
                }
                imageType="logo_favicon"
                accept="image/png,image/x-icon"
                maxSizeMB={1}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backgrounds Tab */}
        <TabsContent value="backgrounds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Background Images</CardTitle>
              <CardDescription>
                Upload background images for authentication and onboarding
                screens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                label="Light Mode Background"
                description="Background image for light mode (recommended: landscape, high resolution)"
                value={formData.backgroundLight}
                onChange={(url) =>
                  setFormData({ ...formData, backgroundLight: url })
                }
                imageType="background_light"
                accept="image/png,image/jpeg,image/svg+xml"
                maxSizeMB={10}
              />
              <Separator />
              <ImageUpload
                label="Dark Mode Background"
                description="Background image for dark mode (recommended: landscape, high resolution)"
                value={formData.backgroundDark}
                onChange={(url) =>
                  setFormData({ ...formData, backgroundDark: url })
                }
                imageType="background_dark"
                accept="image/png,image/jpeg,image/svg+xml"
                maxSizeMB={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          {/* Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Colors</CardTitle>
              <CardDescription>
                Main brand colors used throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ColorPicker
                label="Primary Color"
                value={formData.colorPrimary}
                onChange={(color) =>
                  setFormData({ ...formData, colorPrimary: color })
                }
                placeholder="oklch(0.5745 0.2028 263.15)"
              />
              <ColorPicker
                label="Primary Hover"
                value={formData.colorPrimaryHover}
                onChange={(color) =>
                  setFormData({ ...formData, colorPrimaryHover: color })
                }
                placeholder="oklch(0.5745 0.2028 263.15 / 0.2)"
              />
              <ColorPicker
                label="Secondary Color"
                value={formData.colorSecondary}
                onChange={(color) =>
                  setFormData({ ...formData, colorSecondary: color })
                }
                placeholder="oklch(0.7675 0.0982 182.83)"
              />
              <ColorPicker
                label="Accent Color"
                value={formData.colorAccent}
                onChange={(color) =>
                  setFormData({ ...formData, colorAccent: color })
                }
                placeholder="oklch(0.5745 0.2028 263.15)"
              />
            </CardContent>
          </Card>

          {/* Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Background Colors</CardTitle>
              <CardDescription>
                Colors for backgrounds and surfaces
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ColorPicker
                label="Background Darkest"
                value={formData.colorBackgroundDarkest}
                onChange={(color) =>
                  setFormData({ ...formData, colorBackgroundDarkest: color })
                }
              />
              <ColorPicker
                label="Background Lightest"
                value={formData.colorBackgroundLightest}
                onChange={(color) =>
                  setFormData({ ...formData, colorBackgroundLightest: color })
                }
              />
              <ColorPicker
                label="Gradient Start"
                value={formData.colorBackgroundGradientStart}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundGradientStart: color,
                  })
                }
              />
              <ColorPicker
                label="Gradient End"
                value={formData.colorBackgroundGradientEnd}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundGradientEnd: color,
                  })
                }
              />
            </CardContent>
          </Card>

          {/* State Colors */}
          <Card>
            <CardHeader>
              <CardTitle>State Colors</CardTitle>
              <CardDescription>
                Colors for success, warning, and error states
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ColorPicker
                label="Success Color"
                value={formData.colorStateSuccess}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateSuccess: color })
                }
              />
              <ColorPicker
                label="Success Background"
                value={formData.colorStateSuccessBackground}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorStateSuccessBackground: color,
                  })
                }
              />
              <ColorPicker
                label="Warning Color"
                value={formData.colorStateWarning}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateWarning: color })
                }
              />
              <ColorPicker
                label="Warning Background"
                value={formData.colorStateWarningBackground}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorStateWarningBackground: color,
                  })
                }
              />
              <ColorPicker
                label="Error Color"
                value={formData.colorStateError}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateError: color })
                }
              />
              <ColorPicker
                label="Error Background"
                value={formData.colorStateErrorBackground}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateErrorBackground: color })
                }
              />
            </CardContent>
          </Card>

          {/* Graphics Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Graphics Colors</CardTitle>
              <CardDescription>
                Colors used for charts and visual elements
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ColorPicker
                label="Graphics Primary"
                value={formData.colorGraphicsPrimary}
                onChange={(color) =>
                  setFormData({ ...formData, colorGraphicsPrimary: color })
                }
              />
              <ColorPicker
                label="Graphics Secondary"
                value={formData.colorGraphicsSecondary}
                onChange={(color) =>
                  setFormData({ ...formData, colorGraphicsSecondary: color })
                }
              />
              <ColorPicker
                label="Graphics Tertiary"
                value={formData.colorGraphicsTertiary}
                onChange={(color) =>
                  setFormData({ ...formData, colorGraphicsTertiary: color })
                }
              />
              <ColorPicker
                label="Graphics Quaternary"
                value={formData.colorGraphicsQuaternary}
                onChange={(color) =>
                  setFormData({ ...formData, colorGraphicsQuaternary: color })
                }
              />
            </CardContent>
          </Card>

          {/* Text Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Text & Border Colors</CardTitle>
              <CardDescription>
                Colors for text, borders, and muted elements
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ColorPicker
                label="Text Color"
                value={formData.colorText}
                onChange={(color) =>
                  setFormData({ ...formData, colorText: color })
                }
              />
              <ColorPicker
                label="Text Contrast"
                value={formData.colorTextContrast}
                onChange={(color) =>
                  setFormData({ ...formData, colorTextContrast: color })
                }
              />
              <ColorPicker
                label="Border Color"
                value={formData.colorBorder}
                onChange={(color) =>
                  setFormData({ ...formData, colorBorder: color })
                }
              />
              <ColorPicker
                label="Muted Color"
                value={formData.colorMuted}
                onChange={(color) =>
                  setFormData({ ...formData, colorMuted: color })
                }
              />
            </CardContent>
          </Card>

          {/* Sidebar Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Sidebar Colors</CardTitle>
              <CardDescription>
                Customize the sidebar navigation colors (background, text,
                borders, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ColorPicker
                label="Sidebar Background"
                value={formData.colorSidebar}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebar: color })
                }
                placeholder="oklch(0.2809 0 0)"
              />
              <ColorPicker
                label="Sidebar Text"
                value={formData.colorSidebarForeground}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarForeground: color })
                }
                placeholder="oklch(1 0 87)"
              />
              <ColorPicker
                label="Sidebar Primary"
                value={formData.colorSidebarPrimary}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarPrimary: color })
                }
              />
              <ColorPicker
                label="Sidebar Primary Text"
                value={formData.colorSidebarPrimaryForeground}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorSidebarPrimaryForeground: color,
                  })
                }
              />
              <ColorPicker
                label="Sidebar Accent"
                value={formData.colorSidebarAccent}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarAccent: color })
                }
              />
              <ColorPicker
                label="Sidebar Accent Text"
                value={formData.colorSidebarAccentForeground}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorSidebarAccentForeground: color,
                  })
                }
              />
              <ColorPicker
                label="Sidebar Border"
                value={formData.colorSidebarBorder}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarBorder: color })
                }
              />
              <ColorPicker
                label="Sidebar Focus Ring"
                value={formData.colorSidebarRing}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarRing: color })
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={saveMutation.isPending}
          size="lg"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button type="submit" disabled={saveMutation.isPending} size="lg">
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Branding
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
