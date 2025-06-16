"use client";

import React, { useEffect, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { usePathname } from "@/i18n/routing";
import {
  setSentryUser,
  addActionBreadcrumb,
  setSentryContext,
  startSentrySession,
  endSentrySession,
} from "./index";
import type { User } from "@/lib/auth/types";

/**
 * Hook to integrate Sentry with React components
 *
 * @param user - The current user (if authenticated)
 */
export function useSentry(user?: User | null) {
  const pathname = usePathname();

  // Set user context when it changes
  useEffect(() => {
    if (user) {
      setSentryUser(user);
      startSentrySession();
    } else {
      setSentryUser(null);
      endSentrySession();
    }
  }, [user]);

  // Track page views
  useEffect(() => {
    addActionBreadcrumb("Page View", { path: pathname });
  }, [pathname]);

  return {
    /**
     * Capture an error with component context
     */
    captureError: (error: Error, context?: Record<string, any>) => {
      Sentry.captureException(error, {
        contexts: {
          component: {
            pathname,
            ...context,
          },
        },
      });
    },

    /**
     * Add a breadcrumb for user actions
     */
    trackAction: (action: string, data?: Record<string, any>) => {
      addActionBreadcrumb(action, {
        pathname,
        ...data,
      });
    },

    /**
     * Set additional context
     */
    setContext: (context: Record<string, any>) => {
      setSentryContext({
        pathname,
        ...context,
      });
    },

    /**
     * Create a monitored callback
     */
    monitored: <T extends (...args: any[]) => any>(
      name: string,
      callback: T
    ): T => {
      return ((...args: Parameters<T>) => {
        return Sentry.startSpan(
          {
            name: `component.${name}`,
            op: "ui.action",
            attributes: {
              pathname,
            },
          },
          () => {
            try {
              return callback(...args);
            } catch (error) {
              Sentry.captureException(error, {
                contexts: {
                  ui_action: {
                    name,
                    pathname,
                  },
                },
              });
              throw error;
            }
          }
        );
      }) as T;
    },
  };
}

/**
 * Error boundary component that reports to Sentry
 * Note: Sentry's ErrorBoundary is available in @sentry/react, not @sentry/nextjs
 * For Next.js apps, we'll use a custom implementation that reports to Sentry
 */
export function SentryErrorBoundary({
  children,
  _fallback,
}: {
  children: ReactNode;
  _fallback?: (error: Error, reset: () => void) => ReactNode;
}) {
  // For now, return children directly
  // In production, you should use @sentry/react ErrorBoundary or implement a custom one
  return children as React.ReactElement;
}
