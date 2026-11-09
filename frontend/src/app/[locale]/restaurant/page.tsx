import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import RestaurantPanel from "./restaurant-panel";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const trans = await getTranslations({ locale, namespace: "Restaurant" });
  return { title: trans("title") };
}

export default async function RestaurantPage(props: Props) {
  const params = await props.params;
  const trans = await getTranslations("Restaurant");

  return (
    <div>
      <h1>{trans("title")}</h1>
      <RestaurantPanel locale={params.locale} isEnablePager={true} isEnableSearch={true} />
    </div>
  );
}
