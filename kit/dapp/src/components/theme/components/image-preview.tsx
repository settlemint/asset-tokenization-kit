import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

type ImagePreviewProps = {
  url?: string;
  fallback?: string;
  isUploading: boolean;
  backgroundClass: string;
  isBackground: boolean;
};

function SpinnerOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function IconOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <ImageIcon className="h-8 w-8 text-muted-foreground" />
    </div>
  );
}

export function ImagePreview({
  url,
  fallback,
  isUploading,
  backgroundClass,
  isBackground,
}: ImagePreviewProps) {
  const src = url ?? fallback;

  if (isBackground) {
    return (
      <div
        className={cn(
          "relative h-64 w-full rounded-lg overflow-hidden",
          backgroundClass
        )}
        style={{
          backgroundImage: src ? `url(${src})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {isUploading ? <SpinnerOverlay /> : null}
        {!isUploading && !src ? <IconOverlay /> : null}
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
        <SpinnerOverlay />
      ) : src ? (
        <img
          src={src}
          alt="Preview"
          className="max-h-full max-w-full object-contain p-2"
        />
      ) : (
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      )}
    </div>
  );
}
