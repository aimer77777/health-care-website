import { use } from "react";
import { useTranslations } from "next-intl";
import DownloadPanel from "../../page/download_area/download-panel";
import Button from "@/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { Link } from "@/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function AdminDownloadAreaPage(props: Props) {
  const params = use(props.params);
  const trans = useTranslations("Download");

  const actions = (
    <Button className="border">
      <FontAwesomeIcon icon={faAdd} className="size-4 me-2" />
      <Link href={`/admin/download_area/new`} className="py-1">{trans("new")}</Link>
    </Button>
  );

  return (
    <>
      <h1>{trans("title")}</h1>
      <DownloadPanel
        className="mt-6"
        locale={params.locale}
        isAdmin={true}
        actions={actions}
      />
    </>
  );
}
