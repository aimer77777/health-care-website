import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useLocale } from "next-intl";

type Props = {}

export default function Logo({ }: Props) {
  const isEnglish = useLocale() === "en";
  const logoAlt = isEnglish
    ? "National Central University Health Care Division logo"
    : "國立中央大學衛生保健組 logo";
  return (
    <Link href="/" className="flex items-center h-32" aria-label={logoAlt}>
      <Image alt={logoAlt} src="/logo.png" height={128} width={181} priority={true} />
      <div className="flex flex-col items-center" aria-hidden="true">
        <span lang={isEnglish ? "zh-Hant-TW" : undefined} className="text-2xl font-semibold">衛生保健組</span>
        <span lang={isEnglish ? undefined : "en"} className="text-xl font-semibold">Health Center</span>
      </div>
    </Link>
  )
}
