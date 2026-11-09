"use client";

import { usePathname } from "@/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function RouteAnnouncer() {
  const pathname = usePathname();
  const trans = useTranslations("Accessibility");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(trans("page_changed", { title: document.title }));
  }, [pathname, trans]);

  return <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</div>;
}
