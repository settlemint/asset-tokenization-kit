const appliedVariables = new Map<string, string>();

let pendingVariables: Record<string, string> | null = null;
let rafId: number | null = null;

function normalizeVariableName(variable: string): string {
  return variable.startsWith("--") ? variable : `--${variable}`;
}

function flushThemeDomUpdates(): void {
  if (typeof document === "undefined") {
    pendingVariables = null;
    return;
  }

  const updates = pendingVariables;
  pendingVariables = null;
  rafId = null;

  if (!updates) {
    return;
  }

  const root = document.documentElement;

  for (const [rawKey, value] of Object.entries(updates)) {
    const key = normalizeVariableName(rawKey);
    const lastValue = appliedVariables.get(key);

    if (lastValue === value) {
      continue;
    }

    root.style.setProperty(key, value);
    appliedVariables.set(key, value);
  }
}

function scheduleFlush(): void {
  if (pendingVariables === null) {
    return;
  }

  if (
    globalThis.window === undefined ||
    typeof globalThis.requestAnimationFrame !== "function"
  ) {
    flushThemeDomUpdates();
    return;
  }

  if (rafId !== null) {
    return;
  }

  rafId = globalThis.requestAnimationFrame(() => {
    flushThemeDomUpdates();
  });
}

export function queueThemeDomUpdates(updates: Record<string, string>): void {
  if (typeof document === "undefined") {
    return;
  }

  if (pendingVariables === null) {
    pendingVariables = {};
  }

  for (const [key, value] of Object.entries(updates)) {
    pendingVariables[normalizeVariableName(key)] = value;
  }

  scheduleFlush();
}

export function forceFlushThemeDomUpdates(): void {
  flushThemeDomUpdates();
}

export function resetThemeDomUpdateQueue(): void {
  if (
    rafId !== null &&
    globalThis.window !== undefined &&
    typeof globalThis.cancelAnimationFrame === "function"
  ) {
    globalThis.cancelAnimationFrame(rafId);
  }

  rafId = null;
  pendingVariables = null;
  appliedVariables.clear();
}
