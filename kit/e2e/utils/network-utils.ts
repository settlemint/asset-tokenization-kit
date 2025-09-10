import type { Page, Request, Response } from "@playwright/test";

export interface NetworkError {
  url: string;
  status: number;
  statusText: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: Date;
}

export interface NetworkCapture {
  requests: Request[];
  responses: Response[];
  errors: NetworkError[];
  signUpAttempts: Array<{
    request: Request;
    response?: Response;
    error?: NetworkError;
  }>;
}

export class NetworkDebugger {
  private capture: NetworkCapture = {
    requests: [],
    responses: [],
    errors: [],
    signUpAttempts: [],
  };

  constructor(private page: Page) {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners() {
    this.page.on("request", (request) => {
      this.capture.requests.push(request);

      if (
        request.url().includes("/auth/sign-up") ||
        request.url().includes("/api/auth")
      ) {
        if (request.postData()) {
          try {
            JSON.parse(request.postData() || "{}");
          } catch (e) {}
        }
      }
    });

    this.page.on("response", (response) => {
      this.capture.responses.push(response);

      if (
        response.url().includes("/auth/sign-up") ||
        response.url().includes("/api/auth")
      ) {
        const matchingRequest = this.capture.requests.find(
          (r) => r.url() === response.url()
        );
        if (matchingRequest) {
          this.capture.signUpAttempts.push({
            request: matchingRequest,
            response: response,
          });
        }

        if (response.status() >= 400) {
          this.handleErrorResponse(response, matchingRequest);
        }
      }
    });

    this.page.on("requestfailed", (request) => {
      const error: NetworkError = {
        url: request.url(),
        status: 0,
        statusText: "Failed",
        method: request.method(),
        timestamp: new Date(),
      };

      this.capture.errors.push(error);

      if (request.url().includes("/auth")) {
      }
    });
  }

  private async handleErrorResponse(response: Response, request?: Request) {
    const error: NetworkError = {
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      method: request?.method() || "UNKNOWN",
      headers: response.headers(),
      timestamp: new Date(),
    };

    try {
      const responseBody = await response.text();
      if (responseBody) {
        try {
          error.body = JSON.parse(responseBody);
        } catch {
          error.body = responseBody;
        }
      }
    } catch (e) {}

    this.capture.errors.push(error);

    if (response.status() === 422) {
      if (request?.postData()) {
        try {
          JSON.parse(request.postData() || "{}");
        } catch (e) {}
      }

      if (request) {
        this.capture.signUpAttempts.push({
          request: request,
          response: response,
          error: error,
        });
      }
    }

    if (response.status() === 400) {
    }

    if (response.status() === 500) {
    }
  }

  public async waitForSignUpResponse(
    timeout: number = 10000
  ): Promise<{ success: boolean; error?: NetworkError; response?: Response }> {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkForResponse = () => {
        const latestAttempt =
          this.capture.signUpAttempts[this.capture.signUpAttempts.length - 1];

        if (latestAttempt) {
          if (latestAttempt.error) {
            resolve({ success: false, error: latestAttempt.error });
            return;
          }

          if (latestAttempt.response) {
            const isSuccess =
              latestAttempt.response.status() >= 200 &&
              latestAttempt.response.status() < 300;
            resolve({
              success: isSuccess,
              response: latestAttempt.response,
              error: isSuccess
                ? undefined
                : {
                    url: latestAttempt.response.url(),
                    status: latestAttempt.response.status(),
                    statusText: latestAttempt.response.statusText(),
                    method: latestAttempt.request.method(),
                    timestamp: new Date(),
                  },
            });
            return;
          }
        }

        if (Date.now() - startTime > timeout) {
          resolve({
            success: false,
            error: {
              url: "timeout",
              status: 0,
              statusText: "Timeout waiting for sign-up response",
              method: "POST",
              timestamp: new Date(),
            },
          });
          return;
        }

        setTimeout(checkForResponse, 100);
      };

      checkForResponse();
    });
  }

  public getNetworkSummary(): string {
    const summary = [
      `📊 Network Debug Summary:`,
      `🔄 Total Requests: ${this.capture.requests.length}`,
      `📡 Total Responses: ${this.capture.responses.length}`,
      `❌ Errors: ${this.capture.errors.length}`,
      `🔐 Sign-up Attempts: ${this.capture.signUpAttempts.length}`,
      ``,
    ];

    if (this.capture.errors.length > 0) {
      summary.push(`⚠️  Recent Errors:`);
      this.capture.errors.slice(-3).forEach((error) => {
        summary.push(`  • ${error.status} ${error.method} ${error.url}`);
        if (error.body && typeof error.body === "object") {
          summary.push(`    📋 ${JSON.stringify(error.body)}`);
        }
      });
      summary.push(``);
    }

    if (this.capture.signUpAttempts.length > 0) {
      summary.push(`🔐 Sign-up Attempts:`);
      this.capture.signUpAttempts.forEach((attempt, index) => {
        const status =
          attempt.response?.status() ||
          (attempt.error ? attempt.error.status : "PENDING");
        summary.push(
          `  ${index + 1}. ${attempt.request.method()} ${attempt.request.url()} → ${status}`
        );

        if (attempt.error) {
          summary.push(`     ❌ Error: ${attempt.error.statusText}`);
          if (attempt.error.body) {
            summary.push(`     📋 ${JSON.stringify(attempt.error.body)}`);
          }
        }
      });
    }

    return summary.join("\n");
  }

  public clear() {
    this.capture = {
      requests: [],
      responses: [],
      errors: [],
      signUpAttempts: [],
    };
  }
}

export function attachNetworkDebugger(page: Page): NetworkDebugger {
  return new NetworkDebugger(page);
}

export async function waitForNetworkIdle(
  page: Page,
  timeout: number = 5000
): Promise<void> {
  return page.waitForLoadState("networkidle", { timeout });
}

export function isValidationError(response: Response): boolean {
  return response.status() === 422;
}

export async function getValidationErrors(response: Response): Promise<any> {
  if (!isValidationError(response)) {
    return null;
  }

  try {
    const body = await response.text();
    return JSON.parse(body);
  } catch (e) {
    return null;
  }
}
