import Link from "next/link";
import { getLocale } from "next-intl/server";

export default async function RootNotFound() {
  const isEnglish = (await getLocale()) === "en";

  return (
    <main className="min-h-[80vh] flex flex-col justify-center items-center text-center gap-4">
      <h1 lang={isEnglish ? "zh-Hant-TW" : undefined}>找不到頁面</h1>
      <p lang={isEnglish ? undefined : "en"}>The requested page could not be found.</p>
      <Link href="/" className="link" lang={isEnglish ? "zh-Hant-TW" : undefined}>回到首頁</Link>
    </main>
  )
}
