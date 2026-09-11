import { use } from "react";
import { useTranslations } from "next-intl";
import DownloadPanel from "./download-panel";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function DownloadAreaPage(props: Props) {
  const params = use(props.params);
  const trans = useTranslations("Download");

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
