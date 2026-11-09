import DownloadPanel from "./download-panel";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const trans = await getTranslations({ locale, namespace: "Download" });
  return { title: trans("title") };
}

export default async function DownloadAreaPage(props: Props) {
  const params = await props.params;
  const trans = await getTranslations("Download");

  return (
    <>
      <h1>{trans("title")}</h1>
      <DownloadPanel
        className="mt-6"
        locale={params.locale}
      />
    </>
  );
}
