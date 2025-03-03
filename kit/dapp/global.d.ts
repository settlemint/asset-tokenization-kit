/* eslint-disable @typescript-eslint/no-empty-object-type */
import type en from "./messages/en.json";

type Messages = typeof en;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
