import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import PostPanel from "./post-panel";
import { normalPostColumnSelections } from "@/module/post/presenter/columnSelection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const trans = await getTranslations({ locale, namespace: "Post" });
  return { title: trans("title") };
}

export default async function PostPage(props: Props) {
  const params = await props.params;
  const trans = await getTranslations("Post");

  return (
    <div>
      <h1>{trans("title")}</h1>
      <PostPanel
        locale={params.locale}
        isEnablePager={true}
        isEnableSearch={true}
        columnSelections={normalPostColumnSelections}
      />
    </div>
  );
}
