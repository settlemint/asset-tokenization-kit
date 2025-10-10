"use client";

import { ColorField } from "@/components/branding/color-field";
import { ImageUpload } from "@/components/branding/image-upload";
import { SizeControl } from "@/components/branding/size-control";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/orpc/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Moon, Save, Sun } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * Branding Form Component
 *
 * Comprehensive form for managing platform branding with separate light/dark mode configurations:
 * - General: Application title
 * - Light Mode: Logos, backgrounds, and color scheme for light mode
 * - Dark Mode: Logos, backgrounds, and color scheme for dark mode
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
    logoSize: null as string | null,
    titleSize: null as string | null,
    // Light mode assets
    logoMainLight: null as string | null,
    logoSidebarLight: null as string | null,
    logoFaviconLight: null as string | null,
    backgroundLight: null as string | null,
    // Dark mode assets
    logoMainDark: null as string | null,
    logoSidebarDark: null as string | null,
    logoFaviconDark: null as string | null,
    backgroundDark: null as string | null,
    // Light mode colors
    colorPrimaryLight: null as string | null,
    colorPrimaryHoverLight: null as string | null,
    colorSecondaryLight: null as string | null,
    colorAccentLight: null as string | null,
    colorBackgroundDarkestLight: null as string | null,
    colorBackgroundLightestLight: null as string | null,
    colorBackgroundGradientStartLight: null as string | null,
    colorBackgroundGradientEndLight: null as string | null,
    colorStateSuccessLight: null as string | null,
    colorStateSuccessBackgroundLight: null as string | null,
    colorStateWarningLight: null as string | null,
    colorStateWarningBackgroundLight: null as string | null,
    colorStateErrorLight: null as string | null,
    colorStateErrorBackgroundLight: null as string | null,
    colorGraphicsPrimaryLight: null as string | null,
    colorGraphicsSecondaryLight: null as string | null,
    colorGraphicsTertiaryLight: null as string | null,
    colorGraphicsQuaternaryLight: null as string | null,
    colorTextLight: null as string | null,
    colorTextContrastLight: null as string | null,
    colorBorderLight: null as string | null,
    colorMutedLight: null as string | null,
    colorSidebarLight: null as string | null,
    colorSidebarForegroundLight: null as string | null,
    colorSidebarPrimaryLight: null as string | null,
    colorSidebarPrimaryForegroundLight: null as string | null,
    colorSidebarAccentLight: null as string | null,
    colorSidebarAccentForegroundLight: null as string | null,
    colorSidebarBorderLight: null as string | null,
    colorSidebarRingLight: null as string | null,
    // Dark mode colors
    colorPrimaryDark: null as string | null,
    colorPrimaryHoverDark: null as string | null,
    colorSecondaryDark: null as string | null,
    colorAccentDark: null as string | null,
    colorBackgroundDarkestDark: null as string | null,
    colorBackgroundLightestDark: null as string | null,
    colorBackgroundGradientStartDark: null as string | null,
    colorBackgroundGradientEndDark: null as string | null,
    colorStateSuccessDark: null as string | null,
    colorStateSuccessBackgroundDark: null as string | null,
    colorStateWarningDark: null as string | null,
    colorStateWarningBackgroundDark: null as string | null,
    colorStateErrorDark: null as string | null,
    colorStateErrorBackgroundDark: null as string | null,
    colorGraphicsPrimaryDark: null as string | null,
    colorGraphicsSecondaryDark: null as string | null,
    colorGraphicsTertiaryDark: null as string | null,
    colorGraphicsQuaternaryDark: null as string | null,
    colorTextDark: null as string | null,
    colorTextContrastDark: null as string | null,
    colorBorderDark: null as string | null,
    colorMutedDark: null as string | null,
    colorSidebarDark: null as string | null,
    colorSidebarForegroundDark: null as string | null,
    colorSidebarPrimaryDark: null as string | null,
    colorSidebarPrimaryForegroundDark: null as string | null,
    colorSidebarAccentDark: null as string | null,
    colorSidebarAccentForegroundDark: null as string | null,
    colorSidebarBorderDark: null as string | null,
    colorSidebarRingDark: null as string | null,
  });

  // Update form when branding data loads
  React.useEffect(() => {
    if (branding) {
      setFormData({
        applicationTitle: branding.applicationTitle || "",
        logoSize: branding.logoSize,
        titleSize: branding.titleSize,
        // Light mode assets
        logoMainLight: branding.logoMainLight,
        logoSidebarLight: branding.logoSidebarLight,
        logoFaviconLight: branding.logoFaviconLight,
        backgroundLight: branding.backgroundLight,
        // Dark mode assets
        logoMainDark: branding.logoMainDark,
        logoSidebarDark: branding.logoSidebarDark,
        logoFaviconDark: branding.logoFaviconDark,
        backgroundDark: branding.backgroundDark,
        // Light mode colors
        colorPrimaryLight: branding.colorPrimaryLight,
        colorPrimaryHoverLight: branding.colorPrimaryHoverLight,
        colorSecondaryLight: branding.colorSecondaryLight,
        colorAccentLight: branding.colorAccentLight,
        colorBackgroundDarkestLight: branding.colorBackgroundDarkestLight,
        colorBackgroundLightestLight: branding.colorBackgroundLightestLight,
        colorBackgroundGradientStartLight:
          branding.colorBackgroundGradientStartLight,
        colorBackgroundGradientEndLight:
          branding.colorBackgroundGradientEndLight,
        colorStateSuccessLight: branding.colorStateSuccessLight,
        colorStateSuccessBackgroundLight:
          branding.colorStateSuccessBackgroundLight,
        colorStateWarningLight: branding.colorStateWarningLight,
        colorStateWarningBackgroundLight:
          branding.colorStateWarningBackgroundLight,
        colorStateErrorLight: branding.colorStateErrorLight,
        colorStateErrorBackgroundLight: branding.colorStateErrorBackgroundLight,
        colorGraphicsPrimaryLight: branding.colorGraphicsPrimaryLight,
        colorGraphicsSecondaryLight: branding.colorGraphicsSecondaryLight,
        colorGraphicsTertiaryLight: branding.colorGraphicsTertiaryLight,
        colorGraphicsQuaternaryLight: branding.colorGraphicsQuaternaryLight,
        colorTextLight: branding.colorTextLight,
        colorTextContrastLight: branding.colorTextContrastLight,
        colorBorderLight: branding.colorBorderLight,
        colorMutedLight: branding.colorMutedLight,
        colorSidebarLight: branding.colorSidebarLight,
        colorSidebarForegroundLight: branding.colorSidebarForegroundLight,
        colorSidebarPrimaryLight: branding.colorSidebarPrimaryLight,
        colorSidebarPrimaryForegroundLight:
          branding.colorSidebarPrimaryForegroundLight,
        colorSidebarAccentLight: branding.colorSidebarAccentLight,
        colorSidebarAccentForegroundLight:
          branding.colorSidebarAccentForegroundLight,
        colorSidebarBorderLight: branding.colorSidebarBorderLight,
        colorSidebarRingLight: branding.colorSidebarRingLight,
        // Dark mode colors
        colorPrimaryDark: branding.colorPrimaryDark,
        colorPrimaryHoverDark: branding.colorPrimaryHoverDark,
        colorSecondaryDark: branding.colorSecondaryDark,
        colorAccentDark: branding.colorAccentDark,
        colorBackgroundDarkestDark: branding.colorBackgroundDarkestDark,
        colorBackgroundLightestDark: branding.colorBackgroundLightestDark,
        colorBackgroundGradientStartDark:
          branding.colorBackgroundGradientStartDark,
        colorBackgroundGradientEndDark: branding.colorBackgroundGradientEndDark,
        colorStateSuccessDark: branding.colorStateSuccessDark,
        colorStateSuccessBackgroundDark:
          branding.colorStateSuccessBackgroundDark,
        colorStateWarningDark: branding.colorStateWarningDark,
        colorStateWarningBackgroundDark:
          branding.colorStateWarningBackgroundDark,
        colorStateErrorDark: branding.colorStateErrorDark,
        colorStateErrorBackgroundDark: branding.colorStateErrorBackgroundDark,
        colorGraphicsPrimaryDark: branding.colorGraphicsPrimaryDark,
        colorGraphicsSecondaryDark: branding.colorGraphicsSecondaryDark,
        colorGraphicsTertiaryDark: branding.colorGraphicsTertiaryDark,
        colorGraphicsQuaternaryDark: branding.colorGraphicsQuaternaryDark,
        colorTextDark: branding.colorTextDark,
        colorTextContrastDark: branding.colorTextContrastDark,
        colorBorderDark: branding.colorBorderDark,
        colorMutedDark: branding.colorMutedDark,
        colorSidebarDark: branding.colorSidebarDark,
        colorSidebarForegroundDark: branding.colorSidebarForegroundDark,
        colorSidebarPrimaryDark: branding.colorSidebarPrimaryDark,
        colorSidebarPrimaryForegroundDark:
          branding.colorSidebarPrimaryForegroundDark,
        colorSidebarAccentDark: branding.colorSidebarAccentDark,
        colorSidebarAccentForegroundDark:
          branding.colorSidebarAccentForegroundDark,
        colorSidebarBorderDark: branding.colorSidebarBorderDark,
        colorSidebarRingDark: branding.colorSidebarRingDark,
      });
    }
  }, [branding]);

  // Save mutation
  const saveMutation = useMutation(
    orpc.branding.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.branding.read.queryKey(),
        });
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

  const handleAutoSave = (newUrl: string, imageType: string) => {
    const updatedFormData = { ...formData };

    switch (imageType) {
      // Light mode assets
      case "logo_main_light":
        updatedFormData.logoMainLight = newUrl;
        break;
      case "logo_sidebar_light":
        updatedFormData.logoSidebarLight = newUrl;
        break;
      case "logo_favicon_light":
        updatedFormData.logoFaviconLight = newUrl;
        break;
      case "background_light":
        updatedFormData.backgroundLight = newUrl;
        break;
      // Dark mode assets
      case "logo_main_dark":
        updatedFormData.logoMainDark = newUrl;
        break;
      case "logo_sidebar_dark":
        updatedFormData.logoSidebarDark = newUrl;
        break;
      case "logo_favicon_dark":
        updatedFormData.logoFaviconDark = newUrl;
        break;
      case "background_dark":
        updatedFormData.backgroundDark = newUrl;
        break;
    }

    saveMutation.mutate(updatedFormData);
  };

  const handleResetLightMode = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all light mode branding to defaults? This will remove all light mode customizations."
      )
    ) {
      const resetData = {
        // Light mode assets
        logoMainLight: null,
        logoSidebarLight: null,
        logoFaviconLight: null,
        backgroundLight: null,
        // Light mode colors
        colorPrimaryLight: null,
        colorPrimaryHoverLight: null,
        colorSecondaryLight: null,
        colorAccentLight: null,
        colorBackgroundDarkestLight: null,
        colorBackgroundLightestLight: null,
        colorBackgroundGradientStartLight: null,
        colorBackgroundGradientEndLight: null,
        colorStateSuccessLight: null,
        colorStateSuccessBackgroundLight: null,
        colorStateWarningLight: null,
        colorStateWarningBackgroundLight: null,
        colorStateErrorLight: null,
        colorStateErrorBackgroundLight: null,
        colorGraphicsPrimaryLight: null,
        colorGraphicsSecondaryLight: null,
        colorGraphicsTertiaryLight: null,
        colorGraphicsQuaternaryLight: null,
        colorTextLight: null,
        colorTextContrastLight: null,
        colorBorderLight: null,
        colorMutedLight: null,
        colorSidebarLight: null,
        colorSidebarForegroundLight: null,
        colorSidebarPrimaryLight: null,
        colorSidebarPrimaryForegroundLight: null,
        colorSidebarAccentLight: null,
        colorSidebarAccentForegroundLight: null,
        colorSidebarBorderLight: null,
        colorSidebarRingLight: null,
      };

      setFormData((prev) => ({ ...prev, ...resetData }));
      saveMutation.mutate({ ...formData, ...resetData });
      toast.success("Light mode branding reset to defaults");
    }
  };

  const handleResetDarkMode = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all dark mode branding to defaults? This will remove all dark mode customizations."
      )
    ) {
      const resetData = {
        // Dark mode assets
        logoMainDark: null,
        logoSidebarDark: null,
        logoFaviconDark: null,
        backgroundDark: null,
        // Dark mode colors
        colorPrimaryDark: null,
        colorPrimaryHoverDark: null,
        colorSecondaryDark: null,
        colorAccentDark: null,
        colorBackgroundDarkestDark: null,
        colorBackgroundLightestDark: null,
        colorBackgroundGradientStartDark: null,
        colorBackgroundGradientEndDark: null,
        colorStateSuccessDark: null,
        colorStateSuccessBackgroundDark: null,
        colorStateWarningDark: null,
        colorStateWarningBackgroundDark: null,
        colorStateErrorDark: null,
        colorStateErrorBackgroundDark: null,
        colorGraphicsPrimaryDark: null,
        colorGraphicsSecondaryDark: null,
        colorGraphicsTertiaryDark: null,
        colorGraphicsQuaternaryDark: null,
        colorTextDark: null,
        colorTextContrastDark: null,
        colorBorderDark: null,
        colorMutedDark: null,
        colorSidebarDark: null,
        colorSidebarForegroundDark: null,
        colorSidebarPrimaryDark: null,
        colorSidebarPrimaryForegroundDark: null,
        colorSidebarAccentDark: null,
        colorSidebarAccentForegroundDark: null,
        colorSidebarBorderDark: null,
        colorSidebarRingDark: null,
      };

      setFormData((prev) => ({ ...prev, ...resetData }));
      saveMutation.mutate({ ...formData, ...resetData });
      toast.success("Dark mode branding reset to defaults");
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="light">
            <Sun className="h-4 w-4 mr-2" />
            Light Mode
          </TabsTrigger>
          <TabsTrigger value="dark">
            <Moon className="h-4 w-4 mr-2" />
            Dark Mode
          </TabsTrigger>
        </TabsList>

        {/* ========== GENERAL TAB ========== */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure the general application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="applicationTitle">Application Name</Label>
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
                  This name appears in the browser tab and application header.
                  It is shared across both light and dark modes.
                </p>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <SizeControl
                  label="Logo Size"
                  description="Controls the size of all logos throughout the application"
                  value={formData.logoSize}
                  onChange={(size) =>
                    setFormData({ ...formData, logoSize: size })
                  }
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  defaultSize={1.0}
                />

                <SizeControl
                  label="Title Text Size"
                  description="Controls the size of application title text"
                  value={formData.titleSize}
                  onChange={(size) =>
                    setFormData({ ...formData, titleSize: size })
                  }
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  defaultSize={1.0}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== LIGHT MODE TAB ========== */}
        <TabsContent value="light" className="space-y-6 mt-6">
          {/* Light Mode Logos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Light Mode Logos & Images
              </CardTitle>
              <CardDescription>
                Upload logos and images specifically for light mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                label="Main Logo (Light Mode)"
                description="Primary logo displayed in the header for light mode (recommended: horizontal format, transparent background)"
                value={formData.logoMainLight}
                onChange={(url) =>
                  setFormData({ ...formData, logoMainLight: url })
                }
                onAutoSave={(newUrl) =>
                  handleAutoSave(newUrl, "logo_main_light")
                }
                imageType="logo_main_light"
                accept="image/png,image/svg+xml"
              />
              <Separator />
              <ImageUpload
                label="Sidebar Logo (Light Mode)"
                description="Logo for collapsed sidebar in light mode (recommended: square format, icon-style)"
                value={formData.logoSidebarLight}
                onChange={(url) =>
                  setFormData({ ...formData, logoSidebarLight: url })
                }
                onAutoSave={(newUrl) =>
                  handleAutoSave(newUrl, "logo_sidebar_light")
                }
                imageType="logo_sidebar_light"
                accept="image/png,image/svg+xml"
              />
              <Separator />
              <ImageUpload
                label="Favicon (Light Mode)"
                description="Browser tab icon for light mode (recommended: 32x32 or 64x64 pixels)"
                value={formData.logoFaviconLight}
                onChange={(url) =>
                  setFormData({ ...formData, logoFaviconLight: url })
                }
                onAutoSave={(newUrl) =>
                  handleAutoSave(newUrl, "logo_favicon_light")
                }
                imageType="logo_favicon_light"
                accept="image/png,image/x-icon"
                maxSizeMB={1}
              />
              <Separator />
              <ImageUpload
                label="Background Image (Light Mode)"
                description="Background image for authentication and onboarding screens in light mode"
                value={formData.backgroundLight}
                onChange={(url) =>
                  setFormData({ ...formData, backgroundLight: url })
                }
                onAutoSave={(newUrl) =>
                  handleAutoSave(newUrl, "background_light")
                }
                imageType="background_light"
                accept="image/png,image/jpeg,image/svg+xml"
                maxSizeMB={10}
              />
            </CardContent>
          </Card>

          {/* Light Mode Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Colors (Light Mode)</CardTitle>
              <CardDescription>
                Main brand colors used throughout the application in light mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Primary Color"
                description="Used for primary buttons, links, and key UI elements"
                value={formData.colorPrimaryLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorPrimaryLight: color })
                }
                placeholder="oklch(0.5745 0.2028 263.15)"
                cssVariable="--sm-accent"
              />
              <ColorField
                label="Primary Hover"
                description="Darker shade when hovering over primary elements"
                value={formData.colorPrimaryHoverLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorPrimaryHoverLight: color })
                }
                placeholder="oklch(0.5 0.2028 263.15)"
                cssVariable="--sm-accent-hover"
              />
              <ColorField
                label="Secondary Color"
                description="Used for secondary actions and supporting elements"
                value={formData.colorSecondaryLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorSecondaryLight: color })
                }
                placeholder="oklch(0.7675 0.0982 182.83)"
                cssVariable="--sm-graphics-primary"
              />
              <ColorField
                label="Accent Color"
                description="Used for highlights and emphasis"
                value={formData.colorAccentLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorAccentLight: color })
                }
                placeholder="oklch(0.5745 0.2028 263.15)"
                cssVariable="--sm-accent"
              />
            </CardContent>
          </Card>

          {/* Light Mode Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Background Colors (Light Mode)</CardTitle>
              <CardDescription>
                Colors for backgrounds and surfaces in light mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Background Darkest"
                description="Deepest background color, used for cards and elevated surfaces"
                value={formData.colorBackgroundDarkestLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundDarkestLight: color,
                  })
                }
                cssVariable="--sm-background-darkest"
              />
              <ColorField
                label="Background Lightest"
                description="Lightest background color, used for main page background"
                value={formData.colorBackgroundLightestLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundLightestLight: color,
                  })
                }
                cssVariable="--sm-background-lightest"
              />
              <ColorField
                label="Gradient Start"
                description="Starting color for gradient backgrounds on cards and panels"
                value={formData.colorBackgroundGradientStartLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundGradientStartLight: color,
                  })
                }
                cssVariable="--sm-background-gradient-start"
              />
              <ColorField
                label="Gradient End"
                description="Ending color for gradient backgrounds"
                value={formData.colorBackgroundGradientEndLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundGradientEndLight: color,
                  })
                }
                cssVariable="--sm-background-gradient-end"
              />
            </CardContent>
          </Card>

          {/* Light Mode State Colors */}
          <Card>
            <CardHeader>
              <CardTitle>State Colors (Light Mode)</CardTitle>
              <CardDescription>
                Colors for success, warning, and error states in light mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Success Color"
                description="Used for positive feedback, confirmations, and success messages"
                value={formData.colorStateSuccessLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateSuccessLight: color })
                }
                cssVariable="--sm-state-success"
              />
              <ColorField
                label="Success Background"
                description="Background color for success messages and alerts"
                value={formData.colorStateSuccessBackgroundLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorStateSuccessBackgroundLight: color,
                  })
                }
                cssVariable="--sm-state-success-background"
              />
              <ColorField
                label="Warning Color"
                description="Used for caution messages and warnings"
                value={formData.colorStateWarningLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateWarningLight: color })
                }
                cssVariable="--sm-state-warning"
              />
              <ColorField
                label="Warning Background"
                description="Background color for warning messages"
                value={formData.colorStateWarningBackgroundLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorStateWarningBackgroundLight: color,
                  })
                }
                cssVariable="--sm-state-warning-background"
              />
              <ColorField
                label="Error Color"
                description="Used for error messages and validation failures"
                value={formData.colorStateErrorLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateErrorLight: color })
                }
                cssVariable="--sm-state-error"
              />
              <ColorField
                label="Error Background"
                description="Background color for error messages and alerts"
                value={formData.colorStateErrorBackgroundLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorStateErrorBackgroundLight: color,
                  })
                }
                cssVariable="--sm-state-error-background"
              />
            </CardContent>
          </Card>

          {/* Light Mode Graphics Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Graphics Colors (Light Mode)</CardTitle>
              <CardDescription>
                Colors used for charts, graphs, and data visualization in light
                mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Graphics Primary"
                description="Primary color for charts and graphs"
                value={formData.colorGraphicsPrimaryLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorGraphicsPrimaryLight: color })
                }
                cssVariable="--sm-graphics-primary"
              />
              <ColorField
                label="Graphics Secondary"
                description="Secondary color for charts and graphs"
                value={formData.colorGraphicsSecondaryLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorGraphicsSecondaryLight: color,
                  })
                }
                cssVariable="--sm-graphics-secondary"
              />
              <ColorField
                label="Graphics Tertiary"
                description="Third color option for data visualization"
                value={formData.colorGraphicsTertiaryLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorGraphicsTertiaryLight: color,
                  })
                }
                cssVariable="--sm-graphics-tertiary"
              />
              <ColorField
                label="Graphics Quaternary"
                description="Fourth color option for complex charts"
                value={formData.colorGraphicsQuaternaryLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorGraphicsQuaternaryLight: color,
                  })
                }
                cssVariable="--sm-graphics-quaternary"
              />
            </CardContent>
          </Card>

          {/* Light Mode Text & Border Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Text & Border Colors (Light Mode)</CardTitle>
              <CardDescription>
                Colors for text, borders, and muted elements in light mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Text Color"
                description="Main text color used throughout the application"
                value={formData.colorTextLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorTextLight: color })
                }
                cssVariable="--sm-text"
              />
              <ColorField
                label="Text Contrast"
                description="Text color for use on colored backgrounds"
                value={formData.colorTextContrastLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorTextContrastLight: color })
                }
                cssVariable="--sm-text-contrast"
              />
              <ColorField
                label="Border Color"
                description="Used for borders, dividers, and outlines"
                value={formData.colorBorderLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorBorderLight: color })
                }
                cssVariable="--sm-border"
              />
              <ColorField
                label="Muted Color"
                description="Used for less important text and disabled states"
                value={formData.colorMutedLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorMutedLight: color })
                }
                cssVariable="--sm-muted"
              />
            </CardContent>
          </Card>

          {/* Light Mode Sidebar Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Sidebar Colors (Light Mode)</CardTitle>
              <CardDescription>
                Customize the navigation sidebar colors in light mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Sidebar Background"
                description="Background color of the navigation sidebar"
                value={formData.colorSidebarLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarLight: color })
                }
                cssVariable="--sidebar"
              />
              <ColorField
                label="Sidebar Text"
                description="Text color in the sidebar"
                value={formData.colorSidebarForegroundLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorSidebarForegroundLight: color,
                  })
                }
                cssVariable="--sidebar-foreground"
              />
              <ColorField
                label="Sidebar Primary"
                description="Highlighted items in sidebar"
                value={formData.colorSidebarPrimaryLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarPrimaryLight: color })
                }
                cssVariable="--sidebar-primary"
              />
              <ColorField
                label="Sidebar Primary Text"
                description="Text on highlighted sidebar items"
                value={formData.colorSidebarPrimaryForegroundLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorSidebarPrimaryForegroundLight: color,
                  })
                }
                cssVariable="--sidebar-primary-foreground"
              />
              <ColorField
                label="Sidebar Accent"
                description="Accent elements in sidebar"
                value={formData.colorSidebarAccentLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarAccentLight: color })
                }
                cssVariable="--sidebar-accent"
              />
              <ColorField
                label="Sidebar Accent Text"
                description="Text on accent sidebar elements"
                value={formData.colorSidebarAccentForegroundLight}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorSidebarAccentForegroundLight: color,
                  })
                }
                cssVariable="--sidebar-accent-foreground"
              />
              <ColorField
                label="Sidebar Border"
                description="Border color in sidebar"
                value={formData.colorSidebarBorderLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarBorderLight: color })
                }
                cssVariable="--sidebar-border"
              />
              <ColorField
                label="Sidebar Focus Ring"
                description="Focus indicator color in sidebar"
                value={formData.colorSidebarRingLight}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarRingLight: color })
                }
                cssVariable="--sidebar-ring"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== DARK MODE TAB ========== */}
        <TabsContent value="dark" className="space-y-6 mt-6">
          {/* Dark Mode Logos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Dark Mode Logos & Images
              </CardTitle>
              <CardDescription>
                Upload logos and images specifically for dark mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                label="Main Logo (Dark Mode)"
                description="Primary logo displayed in the header for dark mode (recommended: horizontal format, transparent background)"
                value={formData.logoMainDark}
                onChange={(url) =>
                  setFormData({ ...formData, logoMainDark: url })
                }
                onAutoSave={(newUrl) =>
                  handleAutoSave(newUrl, "logo_main_dark")
                }
                imageType="logo_main_dark"
                accept="image/png,image/svg+xml"
              />
              <Separator />
              <ImageUpload
                label="Sidebar Logo (Dark Mode)"
                description="Logo for collapsed sidebar in dark mode (recommended: square format, icon-style)"
                value={formData.logoSidebarDark}
                onChange={(url) =>
                  setFormData({ ...formData, logoSidebarDark: url })
                }
                onAutoSave={(newUrl) =>
                  handleAutoSave(newUrl, "logo_sidebar_dark")
                }
                imageType="logo_sidebar_dark"
                accept="image/png,image/svg+xml"
              />
              <Separator />
              <ImageUpload
                label="Favicon (Dark Mode)"
                description="Browser tab icon for dark mode (recommended: 32x32 or 64x64 pixels)"
                value={formData.logoFaviconDark}
                onChange={(url) =>
                  setFormData({ ...formData, logoFaviconDark: url })
                }
                onAutoSave={(newUrl) =>
                  handleAutoSave(newUrl, "logo_favicon_dark")
                }
                imageType="logo_favicon_dark"
                accept="image/png,image/x-icon"
                maxSizeMB={1}
              />
              <Separator />
              <ImageUpload
                label="Background Image (Dark Mode)"
                description="Background image for authentication and onboarding screens in dark mode"
                value={formData.backgroundDark}
                onChange={(url) =>
                  setFormData({ ...formData, backgroundDark: url })
                }
                onAutoSave={(newUrl) =>
                  handleAutoSave(newUrl, "background_dark")
                }
                imageType="background_dark"
                accept="image/png,image/jpeg,image/svg+xml"
                maxSizeMB={10}
              />
            </CardContent>
          </Card>

          {/* Dark Mode Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Colors (Dark Mode)</CardTitle>
              <CardDescription>
                Main brand colors used throughout the application in dark mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Primary Color"
                description="Used for primary buttons, links, and key UI elements"
                value={formData.colorPrimaryDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorPrimaryDark: color })
                }
                placeholder="oklch(0.6 0.2028 263.15)"
              />
              <ColorField
                label="Primary Hover"
                description="Lighter shade when hovering over primary elements"
                value={formData.colorPrimaryHoverDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorPrimaryHoverDark: color })
                }
                placeholder="oklch(0.65 0.2028 263.15)"
              />
              <ColorField
                label="Secondary Color"
                description="Used for secondary actions and supporting elements"
                value={formData.colorSecondaryDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorSecondaryDark: color })
                }
                placeholder="oklch(0.7 0.0982 182.83)"
              />
              <ColorField
                label="Accent Color"
                description="Used for highlights and emphasis"
                value={formData.colorAccentDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorAccentDark: color })
                }
                placeholder="oklch(0.6 0.2028 263.15)"
              />
            </CardContent>
          </Card>

          {/* Dark Mode Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Background Colors (Dark Mode)</CardTitle>
              <CardDescription>
                Colors for backgrounds and surfaces in dark mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Background Darkest"
                description="Deepest background color, used for main page background"
                value={formData.colorBackgroundDarkestDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundDarkestDark: color,
                  })
                }
              />
              <ColorField
                label="Background Lightest"
                description="Lightest background color, used for cards and elevated surfaces"
                value={formData.colorBackgroundLightestDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundLightestDark: color,
                  })
                }
              />
              <ColorField
                label="Gradient Start"
                description="Starting color for gradient backgrounds on cards and panels"
                value={formData.colorBackgroundGradientStartDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundGradientStartDark: color,
                  })
                }
              />
              <ColorField
                label="Gradient End"
                description="Ending color for gradient backgrounds"
                value={formData.colorBackgroundGradientEndDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorBackgroundGradientEndDark: color,
                  })
                }
              />
            </CardContent>
          </Card>

          {/* Dark Mode State Colors */}
          <Card>
            <CardHeader>
              <CardTitle>State Colors (Dark Mode)</CardTitle>
              <CardDescription>
                Colors for success, warning, and error states in dark mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Success Color"
                description="Used for positive feedback, confirmations, and success messages"
                value={formData.colorStateSuccessDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateSuccessDark: color })
                }
              />
              <ColorField
                label="Success Background"
                description="Background color for success messages and alerts"
                value={formData.colorStateSuccessBackgroundDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorStateSuccessBackgroundDark: color,
                  })
                }
              />
              <ColorField
                label="Warning Color"
                description="Used for caution messages and warnings"
                value={formData.colorStateWarningDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateWarningDark: color })
                }
              />
              <ColorField
                label="Warning Background"
                description="Background color for warning messages"
                value={formData.colorStateWarningBackgroundDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorStateWarningBackgroundDark: color,
                  })
                }
              />
              <ColorField
                label="Error Color"
                description="Used for error messages and validation failures"
                value={formData.colorStateErrorDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorStateErrorDark: color })
                }
              />
              <ColorField
                label="Error Background"
                description="Background color for error messages and alerts"
                value={formData.colorStateErrorBackgroundDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorStateErrorBackgroundDark: color,
                  })
                }
              />
            </CardContent>
          </Card>

          {/* Dark Mode Graphics Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Graphics Colors (Dark Mode)</CardTitle>
              <CardDescription>
                Colors used for charts, graphs, and data visualization in dark
                mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Graphics Primary"
                description="Primary color for charts and graphs"
                value={formData.colorGraphicsPrimaryDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorGraphicsPrimaryDark: color })
                }
              />
              <ColorField
                label="Graphics Secondary"
                description="Secondary color for charts and graphs"
                value={formData.colorGraphicsSecondaryDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorGraphicsSecondaryDark: color,
                  })
                }
              />
              <ColorField
                label="Graphics Tertiary"
                description="Third color option for data visualization"
                value={formData.colorGraphicsTertiaryDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorGraphicsTertiaryDark: color,
                  })
                }
              />
              <ColorField
                label="Graphics Quaternary"
                description="Fourth color option for complex charts"
                value={formData.colorGraphicsQuaternaryDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorGraphicsQuaternaryDark: color,
                  })
                }
              />
            </CardContent>
          </Card>

          {/* Dark Mode Text & Border Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Text & Border Colors (Dark Mode)</CardTitle>
              <CardDescription>
                Colors for text, borders, and muted elements in dark mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Text Color"
                description="Main text color used throughout the application"
                value={formData.colorTextDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorTextDark: color })
                }
              />
              <ColorField
                label="Text Contrast"
                description="Text color for use on colored backgrounds"
                value={formData.colorTextContrastDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorTextContrastDark: color })
                }
              />
              <ColorField
                label="Border Color"
                description="Used for borders, dividers, and outlines"
                value={formData.colorBorderDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorBorderDark: color })
                }
              />
              <ColorField
                label="Muted Color"
                description="Used for less important text and disabled states"
                value={formData.colorMutedDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorMutedDark: color })
                }
              />
            </CardContent>
          </Card>

          {/* Dark Mode Sidebar Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Sidebar Colors (Dark Mode)</CardTitle>
              <CardDescription>
                Customize the navigation sidebar colors in dark mode
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorField
                label="Sidebar Background"
                description="Background color of the navigation sidebar"
                value={formData.colorSidebarDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarDark: color })
                }
                cssVariable="--sidebar"
              />
              <ColorField
                label="Sidebar Text"
                description="Text color in the sidebar"
                value={formData.colorSidebarForegroundDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorSidebarForegroundDark: color,
                  })
                }
                cssVariable="--sidebar-foreground"
              />
              <ColorField
                label="Sidebar Primary"
                description="Highlighted items in sidebar"
                value={formData.colorSidebarPrimaryDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarPrimaryDark: color })
                }
                cssVariable="--sidebar-primary"
              />
              <ColorField
                label="Sidebar Primary Text"
                description="Text on highlighted sidebar items"
                value={formData.colorSidebarPrimaryForegroundDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorSidebarPrimaryForegroundDark: color,
                  })
                }
                cssVariable="--sidebar-primary-foreground"
              />
              <ColorField
                label="Sidebar Accent"
                description="Accent elements in sidebar"
                value={formData.colorSidebarAccentDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarAccentDark: color })
                }
                cssVariable="--sidebar-accent"
              />
              <ColorField
                label="Sidebar Accent Text"
                description="Text on accent sidebar elements"
                value={formData.colorSidebarAccentForegroundDark}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colorSidebarAccentForegroundDark: color,
                  })
                }
                cssVariable="--sidebar-accent-foreground"
              />
              <ColorField
                label="Sidebar Border"
                description="Border color in sidebar"
                value={formData.colorSidebarBorderDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarBorderDark: color })
                }
                cssVariable="--sidebar-border"
              />
              <ColorField
                label="Sidebar Focus Ring"
                description="Focus indicator color in sidebar"
                value={formData.colorSidebarRingDark}
                onChange={(color) =>
                  setFormData({ ...formData, colorSidebarRingDark: color })
                }
                cssVariable="--sidebar-ring"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetLightMode}
            disabled={saveMutation.isPending}
            size="lg"
          >
            <Sun className="h-4 w-4 mr-2" />
            Reset Light Mode
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResetDarkMode}
            disabled={saveMutation.isPending}
            size="lg"
          >
            <Moon className="h-4 w-4 mr-2" />
            Reset Dark Mode
          </Button>
        </div>
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
