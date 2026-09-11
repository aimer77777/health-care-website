"use client";

import { useTranslations } from "next-intl"
import Link from "next/link"

export default function NotFoundPage() {
    const trans = useTranslations("NotFound");

    return (
        <div className="h-[80vh] flex flex-col justify-center items-center text-center gap-4">
            <h1>{trans("title")}</h1>
            <h3>{trans("message")} <Link href="/" className="link">{trans("homepage")}</Link></h3>
        </div>
    )
}
