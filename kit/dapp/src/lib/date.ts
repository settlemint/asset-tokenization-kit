/**
 * Formats a date string or Date object into a localized date-time string.
 * Default format matches 'PPP HH:mm' from date-fns (e.g., "April 29, 2023 14:30")
 *
 * @param date - The date to format (string or Date object)
 * @returns Formatted date string or 'Invalid Date' if the input is invalid
 */
export function formatDate(date: string | Date): string {
	try {
		const dateObj = typeof date === "string" ? new Date(date) : date;

		if (Number.isNaN(dateObj.getTime())) {
			return "Invalid Date";
		}

		const dateFormatter = new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});

		return dateFormatter.format(dateObj);
	} catch {
		return "Invalid Date";
	}
}
