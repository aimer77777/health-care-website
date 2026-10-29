import Link from "next/link";
import { getLocale } from "next-intl/server";

export default async function LocalizedNotFound() {
  const isEnglish = (await getLocale()) === "en";

  return (
    <main className="min-h-[80vh] flex flex-col justify-center items-center text-center gap-4">
      <h1>{isEnglish ? "Page not found" : "找不到頁面"}</h1>
      <p>
        {isEnglish
          ? "The requested page could not be found."
          : "你所要求的頁面不存在或已被移除。"}
      </p>
      <Link href={`/${isEnglish ? "en" : "zh"}`} className="link">
        {isEnglish ? "Back to homepage" : "回到首頁"}
      </Link>
    </main>
  );
}
