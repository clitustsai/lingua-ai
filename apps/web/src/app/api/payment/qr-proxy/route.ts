import { NextRequest, NextResponse } from "next/server";

// Proxy VietQR image to avoid CSP issues
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !url.startsWith("https://img.vietqr.io/")) {
    return new NextResponse("Invalid URL", { status: 400 });
  }
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch QR", { status: 500 });
  }
}
