"use client";

import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";

const topicKeys = new Set([
  "work_team", "service_hours", "traffic_map", "freshman_health_check",
  "new_employee_physical_exam", "regular_health_check", "emergency_hotline",
  "campus_injury_treatment", "campus_aed", "student_group_insurance",
  "medical_equipment_loan", "health_management_facilities",
  "on_site_occupational_health_service", "workplace_health_service_plan",
  "freshman_cpr", "tobacco_prevention", "aids_prevention",
  "disease_prevention", "download_area", "regulation",
]);

export default function Breadcrumbs() {
  const pathname = usePathname();
  const homeTrans = useTranslations("Home");
  const topicTrans = useTranslations("Topic");
  const postTrans = useTranslations("Post");
  const restaurantTrans = useTranslations("Restaurant");
  const carouselTrans = useTranslations("Carousel");
  const downloadTrans = useTranslations("Download");

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const items: { href?: string; label: string }[] = [
    { href: "/", label: homeTrans("homepage") },
  ];

  if (segments[0] === "page" && segments[1]) {
    items.push({
      label: topicKeys.has(segments[1])
        ? topicTrans(segments[1])
        : decodeURIComponent(segments[1]).replaceAll("_", " "),
    });
  } else if (segments[0] === "post") {
    items.push(segments.length > 1
      ? { href: "/post", label: postTrans("title") }
      : { label: postTrans("title") });
    if (segments.length > 1) items.push({ label: postTrans("article") });
  } else if (segments[0] === "restaurant") {
    items.push(segments.length > 1
      ? { href: "/restaurant", label: restaurantTrans("title") }
      : { label: restaurantTrans("title") });
    if (segments.length > 1) items.push({ label: restaurantTrans("report_detail") });
  } else if (segments[0] === "carousel") {
    items.push({ label: carouselTrans("title") });
  } else if (segments[0] === "privacy") {
    items.push({ label: homeTrans("privacy") });
  } else if (segments[0] === "sitemap") {
    items.push({ label: homeTrans("sitemap") });
  } else if (segments[0] === "download_area") {
    items.push({ label: downloadTrans("title") });
  } else {
    items.push({ label: segments.map((segment) => decodeURIComponent(segment).replaceAll("_", " ")).join(" / ") });
  }

  return (
    <nav aria-label={homeTrans("breadcrumb")} className="mb-6 text-sm">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href
              ? <Link href={item.href} className="link">{item.label}</Link>
              : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
