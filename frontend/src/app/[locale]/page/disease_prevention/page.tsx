import { use } from "react";
import { useTranslations } from "next-intl";
import PostPanel from "../../post/post-panel";
import { diseasePostColumnSelections } from "@/module/post/presenter/columnSelection";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function DiseasePrevensionPage(props: Props) {
  const params = use(props.params);
  const trans = useTranslations("Post");

  return (
    <div>
      <h1>{trans("title_disease")}</h1>
      <PostPanel
        locale={params.locale}
        isEnablePager={true}
        isEnableSearch={true}
        columnSelections={diseasePostColumnSelections}
      />
    </div>
  );
}
