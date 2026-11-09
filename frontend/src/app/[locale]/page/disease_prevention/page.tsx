import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import PostPanel from "../../post/post-panel";
import { diseasePostColumnSelections } from "@/module/post/presenter/columnSelection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const trans = await getTranslations({ locale, namespace: "Post" });
  return { title: trans("title_disease") };
}

export default async function DiseasePrevensionPage(props: Props) {
  const params = await props.params;
  const trans = await getTranslations("Post");

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
