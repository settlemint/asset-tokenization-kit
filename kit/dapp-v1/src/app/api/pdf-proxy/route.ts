import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(url);

    console.log("Proxying PDF from:", decodedUrl);

    // Fetch the PDF from the original source
    const response = await fetch(decodedUrl, {
      headers: {
        // Forward some headers that might be needed
        "User-Agent": request.headers.get("user-agent") || "Next.js PDF Proxy",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        {
          error: `Failed to fetch PDF: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Get the PDF content
    const pdfBuffer = await response.arrayBuffer();

    console.log(
      `Successfully proxied PDF, size: ${pdfBuffer.byteLength} bytes`
    );

    // Return the PDF with proper headers for PDF.js
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        // CORS headers to allow PDF.js access
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers":
          "Range, Content-Range, Content-Length, Content-Type",
        "Access-Control-Expose-Headers":
          "Accept-Ranges, Content-Encoding, Content-Length, Content-Range",
        // Support range requests for large PDFs
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("Error proxying PDF:", error);
    return NextResponse.json(
      {
        error: `Failed to proxy PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers":
        "Range, Content-Range, Content-Length, Content-Type",
    },
  });
}

// Handle HEAD requests for PDF.js pre-flight checks
export async function HEAD(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const decodedUrl = decodeURIComponent(url);

    // Make HEAD request to original source
    const response = await fetch(decodedUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Next.js PDF Proxy",
      },
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    // Return HEAD response with proper headers
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": response.headers.get("content-length") || "0",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers":
          "Range, Content-Range, Content-Length, Content-Type",
        "Access-Control-Expose-Headers":
          "Accept-Ranges, Content-Encoding, Content-Length, Content-Range",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
