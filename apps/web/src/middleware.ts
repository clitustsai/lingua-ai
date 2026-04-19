import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Block suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//,           // Path traversal
    /<script/i,         // XSS attempt
    /union.*select/i,   // SQL injection
    /exec\s*\(/i,       // Code execution
    /eval\s*\(/i,       // Eval injection
    /javascript:/i,     // JS protocol
    /vbscript:/i,       // VBScript
    /on\w+\s*=/i,       // Event handlers
  ];

  const url = decodeURIComponent(req.url);
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return new NextResponse("Bad Request", { status: 400 });
    }
  }

  // Block common attack paths
  const blockedPaths = [
    "/wp-admin", "/wp-login", "/.env", "/phpinfo",
    "/admin.php", "/config.php", "/.git", "/backup",
    "/shell", "/cmd", "/exec",
  ];
  for (const blocked of blockedPaths) {
    if (pathname.toLowerCase().startsWith(blocked)) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
