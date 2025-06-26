import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { expect } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";

// Register Happy DOM globally for React component testing
GlobalRegistrator.register();

// Add custom matchers from @testing-library/jest-dom
expect.extend(matchers);

// Mock navigator.clipboard
if (typeof navigator !== "undefined") {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: () => Promise.resolve(),
      readText: () => Promise.resolve(""),
    },
    configurable: true,
    writable: true,
  });
}

// Setup window.location for better-auth
if (typeof window !== "undefined" && !window.location.origin) {
  Object.defineProperty(window, "location", {
    value: {
      origin: "http://localhost:3000",
      href: "http://localhost:3000",
      protocol: "http:",
      host: "localhost:3000",
      hostname: "localhost",
      port: "3000",
      pathname: "/",
      search: "",
      hash: "",
    },
    configurable: true,
    writable: true,
  });
}
