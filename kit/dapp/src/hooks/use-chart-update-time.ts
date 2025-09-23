import {
  addDays,
  addHours,
  differenceInHours,
  differenceInMinutes,
  formatDistanceToNowStrict,
  startOfDay,
  startOfHour,
} from "date-fns";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

export type ChartInterval = "hour" | "day";

interface ChartUpdateInfo {
  lastUpdate: Date;
  nextUpdate: Date;
  timeUntilUpdate: string;
}

export function useChartUpdateTime() {
  const { t } = useTranslation("common");

  const getLastUpdateTime = useCallback((interval: ChartInterval): Date => {
    const now = new Date();
    return interval === "hour" ? startOfHour(now) : startOfDay(now);
  }, []);

  const getNextUpdateTime = useCallback((interval: ChartInterval): Date => {
    const now = new Date();

    if (interval === "hour") {
      return addHours(startOfHour(now), 1);
    }

    return addDays(startOfDay(now), 1);
  }, []);

  const formatTimeUntilUpdate = useCallback(
    (nextUpdateTime: Date, interval: ChartInterval): string => {
      const now = new Date();
      const minutesUntilUpdate = differenceInMinutes(nextUpdateTime, now);
      const hoursUntilUpdate = differenceInHours(nextUpdateTime, now);

      if (interval === "hour") {
        if (minutesUntilUpdate <= 0) {
          return t("chart.update.refreshing");
        }
        if (minutesUntilUpdate === 1) {
          return t("chart.update.inOneMinute");
        }
        if (minutesUntilUpdate < 60) {
          return t("chart.update.inMinutes", {
            count: minutesUntilUpdate,
          });
        }
        return t("chart.update.inOneHour");
      }

      if (interval === "day") {
        if (hoursUntilUpdate <= 0) {
          return t("chart.update.refreshing");
        }
        if (hoursUntilUpdate === 1) {
          return t("chart.update.inOneHour");
        }
        if (hoursUntilUpdate < 24) {
          return t("chart.update.inHours", {
            count: hoursUntilUpdate,
          });
        }
        return t("chart.update.tomorrow");
      }

      return t("chart.update.soon");
    },
    [t]
  );

  const getFormattedDistance = useCallback(
    (date: Date): string => {
      try {
        return formatDistanceToNowStrict(date, { addSuffix: true });
      } catch {
        return t("chart.update.soon");
      }
    },
    [t]
  );

  const getChartUpdateInfo = useCallback(
    (interval: ChartInterval): ChartUpdateInfo => {
      const lastUpdate = getLastUpdateTime(interval);
      const nextUpdate = getNextUpdateTime(interval);
      const timeUntilUpdate = formatTimeUntilUpdate(nextUpdate, interval);

      return {
        lastUpdate,
        nextUpdate,
        timeUntilUpdate,
      };
    },
    [getLastUpdateTime, getNextUpdateTime, formatTimeUntilUpdate]
  );

  return useMemo(
    () => ({
      getChartUpdateInfo,
      getLastUpdateTime,
      getNextUpdateTime,
      formatTimeUntilUpdate,
      getFormattedDistance,
    }),
    [
      getChartUpdateInfo,
      getLastUpdateTime,
      getNextUpdateTime,
      formatTimeUntilUpdate,
      getFormattedDistance,
    ]
  );
}
