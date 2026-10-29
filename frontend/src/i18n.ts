import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["en", "zh"];

export default getRequestConfig(async ({ requestLocale }) => {
    // Non-localized error pages have no request locale.
    const locale = (await requestLocale) || "zh";
    if (!locales.includes(locale)) notFound();

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    }
});
