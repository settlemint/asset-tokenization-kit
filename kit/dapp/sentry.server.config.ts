// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Enable profiling for performance monitoring
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Release tracking
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    environment: process.env.NODE_ENV,

    // Integrations
    integrations: [
      // Capture Prisma/Database errors with more context
      Sentry.graphqlIntegration(),
      Sentry.browserTracingIntegration(),
      // HTTP instrumentation
      Sentry.httpIntegration({
        breadcrumbs: true,
      }),
      // Capture unhandled promise rejections
      Sentry.onUnhandledRejectionIntegration({
        mode: "strict",
      }),
    ],

    // Filtering
    ignoreErrors: [
      // Ignore expected API errors
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
    ],

    beforeSend(event) {
      // Filter out sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Don't send events in development unless explicitly enabled
      if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
        return null;
      }

      return event;
    },

    // Only print debug info in development
    debug: process.env.NODE_ENV === "development",
  });
}
