import { use } from "react";
import { useTranslations } from "next-intl";
import BuildingPanel from "./building-panel";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function AdminDenguePage(props: Props) {
  const params = use(props.params);
  const trans = useTranslations("AdminDengue");

  return (
    <div>
      <h1>{trans("title")}</h1>
      <BuildingPanel locale={params.locale} className="mt-6"/>
    </div>
  );
}
