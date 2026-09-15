import Link from "next/link";

type Props = {
  params?: { locale?: string };
};

export default function LocalizedNotFound({ params }: Props) {
  const isEnglish = params?.locale === "en";

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
