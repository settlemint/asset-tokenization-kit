/**
 * Calculate the last update time based on chart interval
 */
export function getChartLastUpdateTime(interval: "hour" | "day"): Date {
  const now = new Date();

  if (interval === "hour") {
    // Last update was at the start of the current hour
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0
    );
  }

  if (interval === "day") {
    // Last update was at the start of the current day
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
  }

  return now;
}

/**
 * Calculate the next update time based on chart interval
 */
export function getChartNextUpdateTime(interval: "hour" | "day"): Date {
  const now = new Date();

  if (interval === "hour") {
    // Next update will be at the start of the next hour
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours() + 1,
      0,
      0,
      0
    );
  }

  if (interval === "day") {
    // Next update will be at the start of the next day
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      0,
      0,
      0,
      0
    );
  }

  return now;
}

/**
 * Format the time until next update for display in tooltip
 */
export function formatTimeUntilNextUpdate(
  nextUpdateTime: Date,
  interval: "hour" | "day"
): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (nextUpdateTime.getTime() - now.getTime()) / (1000 * 60)
  );
  const diffInHours = Math.floor(diffInMinutes / 60);

  if (interval === "hour") {
    if (diffInMinutes <= 1) {
      return "Updates in less than a minute";
    }
    if (diffInMinutes < 60) {
      return `Updates in ${diffInMinutes} minutes`;
    }
    return `Updates in ${diffInHours} hour${diffInHours === 1 ? "" : "s"}`;
  }

  if (interval === "day") {
    if (diffInHours < 1) {
      return "Updates in less than an hour";
    }
    if (diffInHours < 24) {
      return `Updates in ${diffInHours} hours`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `Updates in ${diffInDays} day${diffInDays === 1 ? "" : "s"}`;
  }

  return "Updates soon";
}
