// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Add optional integrations for additional features
    integrations: [
      Sentry.replayIntegration({
        // Mask all text content in replays for privacy
        maskAllText: true,
        maskAllInputs: true,
        // Only record replays on errors
        networkDetailAllowUrls: [window.location.origin],
      }),
      // Browser Tracing for performance monitoring
      Sentry.browserTracingIntegration({
        // Trace fetch requests
        traceFetch: true,
        // Trace XHR requests
        traceXHR: true,
        // Set transaction names from route
        enableLongAnimationFrame: true,
      }),
      // Capture console errors and warnings
      Sentry.captureConsoleIntegration({
        levels: ["error", "warn"],
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Enable profiling for performance monitoring
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    environment: process.env.NODE_ENV,

    // Filtering
    ignoreErrors: [
      // Ignore common browser errors
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      // Ignore network errors that are expected
      "NetworkError",
      "Failed to fetch",
      // Ignore user-triggered errors
      "User aborted",
      "AbortError",
    ],

    beforeSend(event, _hint) {
      // Filter out sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }

      // Don't send events in development unless explicitly enabled
      if (
        process.env.NODE_ENV === "development" &&
        !process.env.NEXT_PUBLIC_SENTRY_DEBUG
      ) {
        return null;
      }

      return event;
    },

    // Only print debug info in development
    debug: process.env.NODE_ENV === "development",
  });

  // Set initial user context if available
  if (typeof window !== "undefined") {
    // This will be updated when the user logs in
    Sentry.setTag(
      "app.version",
      process.env.NEXT_PUBLIC_APP_VERSION || "unknown"
    );
  }
}

export const onRouterTransitionStart = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? Sentry.captureRouterTransitionStart
  : () => {};
