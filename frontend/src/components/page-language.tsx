"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export default function PageLanguage() {
  const locale = useLocale();

  useEffect(() => {
    // The shared root layout persists during client-side language changes.
    document.documentElement.lang = locale === "en" ? "en" : "zh-Hant-TW";
  }, [locale]);

  return null;
}
