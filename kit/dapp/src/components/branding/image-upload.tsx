"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/orpc-client";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

/**
 * Image Upload Component for Branding
 *
 * Handles image uploads to MinIO S3 storage for branding purposes.
 * Supports logos, backgrounds, and other branding images.
 */

export interface ImageUploadProps {
  /** Label for the upload field */
  label: string;
  /** Description/help text */
  description?: string;
  /** Current image URL */
  value?: string | null;
  /** Callback when image URL changes */
  onChange: (url: string | null) => void;
  /** Callback to auto-save the form when image is uploaded */
  onAutoSave?: (newUrl: string) => void;
  /** Type of image being uploaded */
  imageType:
    | "logo_main"
    | "logo_sidebar"
    | "logo_favicon"
    | "background_light"
    | "background_dark";
  /** Accepted image formats */
  accept?: string;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

export function ImageUpload({
  label,
  description,
  value,
  onChange,
  onAutoSave,
  imageType,
  accept = "image/png,image/jpeg,image/svg+xml",
  maxSizeMB = 5,
  disabled = false,
  className,
}: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation(
    orpc.branding.uploadImage.mutationOptions({
      onSuccess: (data) => {
        onChange(data.url);
        toast.success("Image uploaded successfully");
        // Auto-save the form to persist the image URL
        if (onAutoSave) {
          onAutoSave(data.url);
        }
      },
      onError: (error) => {
        toast.error(`Failed to upload image: ${error.message}`);
      },
    })
  );

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        await uploadMutation.mutateAsync({
          imageData: base64Data,
          fileName: file.name,
          mimeType: file.type,
          imageType,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to read file");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null);
    toast.success("Image removed");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {value ? (
          <div className="relative group">
            <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-center min-h-32">
              <img
                src={value}
                alt={label}
                className="max-h-24 max-w-full object-contain"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 flex flex-col items-center justify-center gap-2 min-h-32">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No image uploaded</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploadMutation.isPending}
            className="flex-1"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4 mr-2" />
                {value ? "Replace Image" : "Upload Image"}
              </>
            )}
          </Button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              disabled={disabled}
            >
              Remove
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Accepted formats:{" "}
          {accept
            .split(",")
            .map((a) => a.split("/")[1])
            .join(", ")
            .toUpperCase()}
          . Max size: {maxSizeMB}MB
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
