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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Define PDF Document type manually since it's not exported
type PDFDocument = {
  numPages: number;
  destroy: () => void;
  getPage: (pageNumber: number) => Promise<any>;
};

// Initialize PDF.js worker with local fallback
function initializePDFWorker() {
  // Try local worker first, then CDN fallbacks
  const workerOptions = [
    `/pdf-worker/pdf.worker.min.js`, // Local worker in public directory
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`,
  ];

  // Try to set the worker source with async testing
  const setWorkerAsync = async () => {
    for (const workerSrc of workerOptions) {
      try {
        // Test if worker is accessible
        try {
          await fetch(workerSrc, { method: "HEAD", mode: "no-cors" });
        } catch (fetchError) {
          console.warn("Worker not accessible:", workerSrc, fetchError);
          continue;
        }

        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        console.log("PDF.js worker configured with:", workerSrc);
        return true;
      } catch (error) {
        console.warn("Failed to configure worker with:", workerSrc, error);
      }
    }
    console.error("All worker sources failed");
    return false;
  };

  // Run async worker setup
  setWorkerAsync();
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
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [retryAttempt, setRetryAttempt] = useState<number>(0);

  // Add document reference to prevent premature cleanup
  const pdfDocumentRef = useRef<PDFDocument | null>(null);
  const [documentReady, setDocumentReady] = useState<boolean>(false);

  // Create the proxied URL for external files to avoid CORS issues
  const getPDFUrl = (originalUrl: string) => {
    // Check if the URL is external (not localhost or relative)
    if (originalUrl.startsWith("http") && !originalUrl.includes("localhost")) {
      // Use our proxy endpoint to avoid CORS issues
      const encodedUrl = encodeURIComponent(originalUrl);
      return `/api/pdf-proxy?url=${encodedUrl}`;
    }
    return originalUrl;
  };

  const pdfUrl = getPDFUrl(fileUrl);

  // Memoize document options to prevent unnecessary reloads
  const documentOptions = useMemo(() => {
    const baseOptions = {
      httpHeaders: {
        "Cache-Control": "no-cache",
        Accept: "application/pdf,*/*",
      },
      withCredentials: false,
      enableXfa: true,
      verbosity: retryAttempt > 0 ? 5 : 1, // Increase verbosity on retry
    };

    return baseOptions;
  }, [retryAttempt]);

  // Validate document and transport are still valid
  const isDocumentValid = useCallback(() => {
    if (!pdfDocumentRef.current) return false;

    try {
      // Try to access the document's numPages property to ensure it's still valid
      const pages = pdfDocumentRef.current.numPages;
      return pages > 0;
    } catch (error) {
      console.warn("Document validation failed:", error);
      return false;
    }
  }, []);

  // Debug PDF.js configuration
  useEffect(() => {
    if (isOpen && fileUrl) {
      // Test worker accessibility
      const testWorker = async () => {
        try {
          await fetch(pdfjs.GlobalWorkerOptions.workerSrc, {
            method: "HEAD",
            mode: "no-cors",
          });
        } catch (error) {
          console.error("Worker test failed:", error);
        }
      };

      // Test PDF URL accessibility
      const testPDFUrl = async () => {
        try {
          const response = await fetch(pdfUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
          });

          // If we get a 403, immediately set the error state instead of trying to load
          if (response.status === 403) {
            setError(
              "Access to the PDF file was denied. The secure file link has expired (usually after 1 hour). Please try downloading the document instead."
            );
            setIsLoading(false);
            return; // Don't proceed with PDF loading
          }

          if (!response.ok) {
            console.warn("PDF URL not accessible:", response.status);
          }
        } catch (error) {
          console.warn("PDF URL test failed:", error);
          // If it's a 403-related error, set the expired URL error immediately
          if (
            error instanceof Error &&
            (error.message.includes("403") ||
              error.message.includes("Forbidden"))
          ) {
            setError(
              "Access to the PDF file was denied. The secure file link has expired (usually after 1 hour). Please try downloading the document instead."
            );
            setIsLoading(false);
            return;
          }
        }
      };

      // Reset states when dialog opens first
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
      setNumPages(0);
      setPageNumber(1);
      setRetryAttempt(0);
      setDocumentReady(false);
      pdfDocumentRef.current = null;

      // Then run tests (which may override the error state if needed)
      testWorker();
      testPDFUrl();
    }
  }, [isOpen, fileUrl]);

  // Add a timeout for loading with shorter duration
  useEffect(() => {
    if (isLoading && isOpen && fileUrl) {
      // Clear any existing timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }

      const timeout = setTimeout(() => {
        if (isLoading) {
          setError(
            "PDF loading timed out. The file might be too large, there could be network issues, or the PDF worker failed to load. Check browser console for more details."
          );
          setIsLoading(false);
        }
      }, 30000); // Increase to 30 seconds for larger PDFs

      setLoadingTimeout(timeout);

      return () => {
        clearTimeout(timeout);
        setLoadingTimeout(null);
      };
    }
  }, [isLoading, isOpen, fileUrl, loadingProgress, error]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    setLoadingProgress(100);

    // Clear the timeout when successful
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }

    // Set document ready after a longer delay to ensure worker is stable
    setTimeout(() => {
      // Double-check that the document is still valid before marking as ready
      if (pdfDocumentRef.current && isDocumentValid()) {
        setDocumentReady(true);
      } else {
        console.warn("Document validation failed after load success");
        setError("PDF document failed validation after loading");
      }
    }, 500); // Increased delay to 500ms
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
    } else if (
      errorMessage.includes("403") ||
      errorMessage.includes("Forbidden")
    ) {
      errorMessage =
        "Access to the PDF file was denied. The secure file link may have expired (usually after 1 hour). Please try downloading the document instead.";
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
    setDocumentReady(false);
    pdfDocumentRef.current = null;

    // Clear the timeout when error occurs
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
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
    // Try different worker configurations on retry
    if (retryAttempt > 0) {
      initializePDFWorker();
    }

    setError(null);
    setIsLoading(true);
    setNumPages(0);
    setPageNumber(1);
    setLoadingProgress(0);
    setRetryAttempt(retryAttempt + 1);
    setDocumentReady(false);
    pdfDocumentRef.current = null;

    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  }

  // Reset state when dialog closes
  function handleOpenChange(open: boolean) {
    if (!open) {
      // Clear timeout when closing
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }

      // Cleanup document reference
      if (pdfDocumentRef.current) {
        try {
          pdfDocumentRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying PDF document:", error);
        }
        pdfDocumentRef.current = null;
      }

      setPageNumber(1);
      setScale(1.0);
      setIsLoading(true);
      setError(null);
      setNumPages(0);
      setLoadingProgress(0);
      setDocumentReady(false);
      onClose();
    }
  }

  // Add file validation - make it more permissive
  const isValidPDFUrl = fileUrl && fileUrl.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="!w-[90vw] !max-w-[90vw] max-h-[95vh] flex flex-col p-0"
        style={{ width: "90vw !important", maxWidth: "90vw !important" }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between text-lg">
            <span className="truncate pr-4">{fileName}</span>
            <div className="flex items-center gap-2 flex-shrink-0 mr-8">
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
          <div className="flex-1 overflow-auto border rounded-md bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[600px]">
            {fileUrl && isValidPDFUrl && (
              <div className="pdf-container w-full h-full relative">
                {/* Loading overlay */}
                {isLoading && !error && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-md">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <div className="text-center">
                        <p>Loading PDF...</p>
                        {loadingProgress > 0 && (
                          <p className="text-xs mt-1">
                            Progress: {loadingProgress}%
                          </p>
                        )}
                        <p className="text-xs mt-1">
                          This may take a few moments for large files
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground/70">
                          Check browser console for debugging info
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {error && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-md">
                    <div className="text-center text-red-500 max-w-md p-4">
                      <p className="font-medium mb-2">Error loading PDF</p>
                      <p className="text-sm text-red-400 mb-3">{error}</p>
                      <div className="text-xs text-gray-600 mb-3 space-y-1">
                        <p>Attempt: {retryAttempt + 1}</p>
                        <p>File: {fileName}</p>
                        <p>
                          Worker:{" "}
                          {pdfjs.GlobalWorkerOptions.workerSrc.includes(
                            "/pdf-worker/"
                          )
                            ? "Local"
                            : "CDN"}
                        </p>
                      </div>
                      {!isValidPDFUrl && (
                        <p className="text-xs text-yellow-600 mb-3">
                          Warning: The file URL might not be accessible
                        </p>
                      )}
                      {(error.includes("403") ||
                        error.includes("Forbidden") ||
                        error.includes("expired")) && (
                        <div className="text-xs text-blue-600 mb-3 p-2 bg-blue-50 rounded">
                          <p className="font-medium">💡 File access expired</p>
                          <p className="mt-1">
                            The secure file link has expired (usually after 1
                            hour). Please try downloading the document instead.
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                        >
                          Download instead
                        </Button>
                        {retryAttempt < 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                          >
                            Retry ({3 - retryAttempt} left)
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF Document - Always render when we have a valid URL */}
                <Document
                  file={pdfUrl}
                  onLoadSuccess={(pdf) => {
                    // Validate the PDF document before storing reference
                    try {
                      if (pdf && pdf.numPages > 0) {
                        pdfDocumentRef.current = pdf;
                        onDocumentLoadSuccess(pdf);
                      } else {
                        console.error("Invalid PDF document received:", pdf);
                        onDocumentLoadError(
                          new Error("Invalid PDF document received")
                        );
                      }
                    } catch (error) {
                      console.error("Error validating PDF document:", error);
                      onDocumentLoadError(
                        error instanceof Error
                          ? error
                          : new Error("PDF validation failed")
                      );
                    }
                  }}
                  onLoadError={(error) => {
                    onDocumentLoadError(error);
                  }}
                  onLoadProgress={(progress) => {
                    onDocumentLoadProgress(progress);
                  }}
                  onItemClick={(item) => {
                    // Handle PDF item clicks if needed
                  }}
                  onPassword={(callback, reason) => {
                    // For now, just reject password-protected PDFs
                    callback(null);
                  }}
                  options={documentOptions}
                  className="w-full h-full flex justify-center items-start py-4"
                  loading={
                    <div className="flex items-center justify-center h-96">
                      <Loader2 className="h-6 w-6 animate-spin" />
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
                  {documentReady &&
                    !isLoading &&
                    !error &&
                    numPages > 0 &&
                    pdfDocumentRef.current &&
                    isDocumentValid() && (
                      <PageWrapper
                        pageNumber={pageNumber}
                        scale={scale}
                        pdfDocument={pdfDocumentRef.current}
                        isDocumentValid={isDocumentValid}
                      />
                    )}
                </Document>
              </div>
            )}

            {/* Fallback when no valid URL */}
            {(!fileUrl || !isValidPDFUrl) && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-red-500">
                  <p className="font-medium mb-2">Invalid PDF URL</p>
                  <p className="text-sm text-red-400">
                    The PDF file URL is not available or invalid.
                  </p>
                </div>
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

// Separate PageWrapper component to handle page rendering errors
function PageWrapper({
  pageNumber,
  scale,
  pdfDocument,
  isDocumentValid,
}: {
  pageNumber: number;
  scale: number;
  pdfDocument: PDFDocument;
  isDocumentValid: () => boolean;
}) {
  const [pageError, setPageError] = useState<string | null>(null);

  const handlePageError = (error: Error) => {
    console.error("Page rendering error:", error);
    setPageError(error.message);
  };

  // Reset page error when page number changes
  useEffect(() => {
    setPageError(null);
  }, [pageNumber]);

  // Validate document before rendering each time
  useEffect(() => {
    if (!isDocumentValid()) {
      setPageError(
        "PDF document is no longer valid. Please refresh the viewer."
      );
      return;
    }
  }, [pageNumber, isDocumentValid]);

  if (pageError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-500 max-w-md p-4">
          <p className="font-medium mb-2">Error rendering page {pageNumber}</p>
          <p className="text-sm text-red-400">{pageError}</p>
          <p className="text-xs text-gray-600 mt-2">
            Try refreshing the document or download it instead
          </p>
        </div>
      </div>
    );
  }

  // Double-check document validity before rendering
  if (!isDocumentValid()) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-500 max-w-md p-4">
          <p className="font-medium mb-2">Document no longer available</p>
          <p className="text-sm text-red-400">
            The PDF document connection was lost.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Please close and reopen the viewer to reload the document.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Page
      pageNumber={pageNumber}
      scale={scale}
      renderTextLayer={true}
      renderAnnotationLayer={true}
      className="pdf-page shadow-lg"
      onRenderError={handlePageError}
      loading={
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    />
  );
}
