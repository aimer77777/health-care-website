import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const trans = await getTranslations({ locale, namespace: "Privacy" });
  return { title: trans("title") };
}

export default async function PrivacyPage() {
  const trans = await getTranslations("Privacy");

  return (
    <>
      <h1>{trans("title")}</h1>
      <hr className="my-3" />
      <p className="mb-3">{trans("p_0")}</p>
      <h2 className="mt-6 mb-1.5">{trans("sec_1")}</h2>
      <p className="mb-3">{trans("p_1")}</p>
      <h2 className="mt-6 mb-1.5">{trans("sec_2")}</h2>
      <p className="mb-3">{trans("p_2_1")}</p>
      <p className="mb-3">{trans("p_2_2")}</p>
      <p className="mb-3">{trans("p_2_3")}</p>
      <ol type="1" className="list-decimal ms-8 mb-3">
        <li>{trans("p_2_3_1")}</li>
        <li>{trans("p_2_3_2")}</li>
        <li>{trans("p_2_3_3")}</li>
      </ol>
      <p className="mb-3">{trans("p_2_4")}</p>
      <ol type="1" className="list-decimal ms-8 mb-3">
        <li>{trans("p_2_4_1")}</li>
        <li>{trans("p_2_4_2")}</li>
        <li>{trans("p_2_4_3")}</li>
      </ol>
      <h2 className="mt-6 mb-1.5">{trans("sec_3")}</h2>
      <p className="mb-3">{trans("p_3")}</p>
      <h2 className="mt-6 mb-1.5">{trans("sec_4")}</h2>
      <p className="mb-3">{trans("p_4")}</p>
      <h2 className="mt-6 mb-1.5">{trans("sec_5")}</h2>
      <p className="mb-3">{trans("p_5")}</p>
      <h2 className="mt-6 mb-1.5">{trans("sec_6")}</h2>
      <p className="mb-3">{trans("p_6")}</p>
      <h2 className="mt-6 mb-1.5">{trans("sec_7")}</h2>
      <p className="mb-3">{trans("p_7")}</p>
    </>
  );
}
