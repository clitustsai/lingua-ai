"use client";
import React from "react";
import { useAuthStore } from "@/store/useAuthStore";

interface State { hasError: boolean; error: Error | null; reported: boolean; }

async function reportError(error: Error, userId?: string) {
  try {
    await fetch("/api/report-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch { /* silent */ }
}

// Hook for functional components
export function useErrorReporter() {
  const { user } = useAuthStore();
  return (error: Error) => reportError(error, user?.id);
}

// Global unhandled error listener — add to root layout
export function GlobalErrorHandler() {
  const { user } = useAuthStore();

  React.useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      reportError(new Error(e.message || "Unknown error"), user?.id);
    };
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const err = e.reason instanceof Error ? e.reason : new Error(String(e.reason));
      reportError(err, user?.id);
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [user?.id]);

  return null;
}

// Class-based Error Boundary for React tree errors
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, reported: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, reported: false };
  }

  componentDidCatch(error: Error) {
    if (!this.state.reported) {
      reportError(error);
      this.setState({ reported: true });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6">
          <div className="text-4xl">😵</div>
          <div className="text-center">
            <p className="text-white font-semibold">Something went wrong</p>
            <p className="text-gray-500 text-sm mt-1">{this.state.error?.message}</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null, reported: false })}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm transition-colors">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
