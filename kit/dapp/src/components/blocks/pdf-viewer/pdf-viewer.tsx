"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Initialize PDF.js worker with multiple fallbacks
function initializePDFWorker() {
  const workerOptions = [
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
  ];

  // Try to set the worker source
  for (const workerSrc of workerOptions) {
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      console.log("PDF.js worker configured with:", workerSrc);
      break;
    } catch (error) {
      console.warn("Failed to configure worker with:", workerSrc, error);
    }
  }
}

// Initialize the worker
initializePDFWorker();

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export function PDFViewer({
  isOpen,
  onClose,
  fileUrl,
  fileName,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Debug PDF.js configuration
  useEffect(() => {
    console.log("PDF.js version:", pdfjs.version);
    console.log("PDF.js worker source:", pdfjs.GlobalWorkerOptions.workerSrc);
    console.log("File URL:", fileUrl);
    console.log("User Agent:", navigator.userAgent);

    // Test if worker can be loaded
    const testWorker = async () => {
      try {
        const response = await fetch(pdfjs.GlobalWorkerOptions.workerSrc);
        console.log(
          "Worker fetch response:",
          response.status,
          response.statusText
        );
        if (!response.ok) {
          console.error(
            "Worker fetch failed:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Worker fetch error:", error);
      }
    };

    testWorker();
  }, [fileUrl]);

  // Add a timeout for loading with shorter duration
  useEffect(() => {
    if (isLoading && isOpen && fileUrl) {
      console.log("Starting PDF load timer...");
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.log("PDF loading timed out");
          setError(
            "PDF loading timed out. This might be due to a large file, slow connection, or worker configuration issue."
          );
          setIsLoading(false);
        }
      }, 15000); // Reduced to 15 seconds

      return () => {
        console.log("Clearing PDF load timer");
        clearTimeout(timeout);
      };
    }
  }, [isLoading, isOpen, fileUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("PDF loaded successfully with", numPages, "pages");
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    setLoadingProgress(100);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    console.error("Error stack:", error.stack);

    let errorMessage = error.message;

    // Provide more user-friendly error messages
    if (errorMessage.includes("CORS")) {
      errorMessage =
        "Unable to load PDF due to security restrictions. The server may not allow cross-origin requests.";
    } else if (errorMessage.includes("fetch")) {
      errorMessage =
        "Failed to download PDF. Please check your internet connection and the file URL.";
    } else if (errorMessage.includes("InvalidPDFException")) {
      errorMessage = "This PDF file appears to be corrupted or invalid.";
    } else if (errorMessage.includes("MissingPDFException")) {
      errorMessage = "PDF file not found at the specified location.";
    } else if (errorMessage.includes("UnexpectedResponseException")) {
      errorMessage =
        "Unexpected response from server. The file may not be a valid PDF.";
    } else if (errorMessage.includes("Worker")) {
      errorMessage =
        "PDF worker failed to load. This might be due to browser security settings or network issues.";
    }

    setError(errorMessage);
    setIsLoading(false);
    setLoadingProgress(0);
  }

  function onDocumentLoadProgress({
    loaded,
    total,
  }: {
    loaded: number;
    total: number;
  }) {
    const progress = Math.round((loaded / total) * 100);
    setLoadingProgress(progress);
    console.log(`Loading progress: ${loaded}/${total} (${progress}%)`);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  }

  function handleDownload() {
    window.open(fileUrl, "_blank");
  }

  function handleRetry() {
    console.log("Retrying PDF load...");
    // Re-initialize worker on retry
    initializePDFWorker();
    setError(null);
    setIsLoading(true);
    setNumPages(0);
    setPageNumber(1);
    setLoadingProgress(0);
  }

  // Reset state when dialog opens/closes
  function handleOpenChange(open: boolean) {
    if (!open) {
      console.log("Closing PDF viewer");
      setPageNumber(1);
      setScale(1.0);
      setIsLoading(true);
      setError(null);
      setNumPages(0);
      setLoadingProgress(0);
      onClose();
    } else {
      console.log("Opening PDF viewer for:", fileName);
      // Reset loading state when opening
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
    }
  }

  // Enhanced document options for better compatibility
  const documentOptions = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    // Add more options for better compatibility
    isEvalSupported: false,
    disableAutoFetch: false,
    disableStream: false,
    disableRange: false,
    // Add timeout and retry options
    httpHeaders: {
      "Access-Control-Allow-Origin": "*",
    },
    withCredentials: false,
  };

  // Add file validation
  const isValidPDFUrl =
    fileUrl &&
    (fileUrl.toLowerCase().endsWith(".pdf") ||
      fileUrl.includes("content-type=application/pdf") ||
      fileUrl.includes(".pdf?"));

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between text-lg">
            <span className="truncate pr-4">{fileName}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={zoomOut}
                disabled={scale <= 0.5 || isLoading}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={zoomIn}
                disabled={scale >= 3.0 || isLoading}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden px-6">
          {/* PDF Content */}
          <div className="flex-1 overflow-auto border rounded-md bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[400px]">
            {isLoading && !error && (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <div className="text-center">
                  <p>Loading PDF...</p>
                  {loadingProgress > 0 && (
                    <p className="text-xs mt-1">Progress: {loadingProgress}%</p>
                  )}
                  <p className="text-xs mt-1">
                    This may take a few moments for large files
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground/70">
                    Check browser console for debugging info
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center text-red-500 max-w-md p-4">
                <p className="font-medium mb-2">Error loading PDF</p>
                <p className="text-sm text-red-400 mb-3">{error}</p>
                {!isValidPDFUrl && (
                  <p className="text-xs text-yellow-600 mb-3">
                    Warning: The file URL doesn&apos;t appear to be a PDF file
                  </p>
                )}
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    Download instead
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && !error && fileUrl && (
              <div className="pdf-container">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  onLoadProgress={onDocumentLoadProgress}
                  options={documentOptions}
                  loading={
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <div className="text-center">
                        <p>Loading PDF...</p>
                        {loadingProgress > 0 && (
                          <p className="text-xs mt-1">
                            Progress: {loadingProgress}%
                          </p>
                        )}
                        <p className="text-xs mt-1">Please wait...</p>
                      </div>
                    </div>
                  }
                  error={
                    <div className="text-center text-red-500 max-w-md p-4">
                      <p className="font-medium mb-2">Failed to load PDF</p>
                      <p className="text-sm text-red-400 mb-3">
                        This PDF file may be corrupted or incompatible.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        Download instead
                      </Button>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="pdf-page"
                    loading={
                      <div className="flex items-center justify-center h-96">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    }
                  />
                </Document>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {numPages > 0 && !isLoading && !error && (
            <div className="flex items-center justify-between p-4 border-t bg-background">
              <Button
                size="sm"
                variant="outline"
                onClick={previousPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Page {pageNumber} of {numPages}
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={nextPage}
                disabled={pageNumber >= numPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
