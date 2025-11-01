import { FormatNumber } from "@/lib/utils/format-value/format-number";
import { FormatValueProps } from "@/lib/utils/format-value/types";
import { useTranslation } from "react-i18next";
import { safeToNumber } from "./safe-to-number";

export function FormatCurrency({ value, options }: FormatValueProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { currency = "EUR" } = options;

  // Use safe number conversion to handle large values without precision loss
  const currencyValue = safeToNumber(value);

  if (typeof currency === "object" && "assetSymbol" in currency) {
    return (
      <div className="flex items-center gap-1 tabular-nums">
        <FormatNumber value={value} options={options} />
        {currency.assetSymbol}
      </div>
    );
  }

  // Try to format with Intl.NumberFormat
  try {
    return (
      <div className="tabular-nums">
        {new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
          ...(options.compact
            ? {
                notation: "compact",
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              }
            : { minimumFractionDigits: 2 }),
        }).format(currencyValue)}
      </div>
    );
  } catch {
    // If currency is not recognized, format as "value currency"
    const formatted = new Intl.NumberFormat(locale, {
      ...(options.compact
        ? {
            notation: "compact",
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          }
        : {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
    }).format(currencyValue);

    return (
      <div className="tabular-nums">
        {formatted} {currency}
      </div>
    );
  }
}
