/**
 * Redacts sensitive fields in an object by replacing their values with asterisks
 */
export function redactSensitiveFields(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveFields);
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (key === "pincode") {
        return [key, "******"];
      }
      if (typeof value === "object" && value !== null) {
        return [key, redactSensitiveFields(value)];
      }
      return [key, value];
    })
  );
}
