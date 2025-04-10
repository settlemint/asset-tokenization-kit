import { registerOTel } from "@vercel/otel";

export function register() {
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    registerOTel({
      serviceName: process.env.NEXT_PUBLIC_APP_ID || "ATK",
    });
  }
}
