import { use } from "react";
import { useTranslations } from "next-intl";
import RestaurantPanel from "./restaurant-panel";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function RestaurantPage(props: Props) {
  const params = use(props.params);
  const trans = useTranslations("Restaurant");

  return (
    <div>
      <h1>{trans("title")}</h1>
      <RestaurantPanel locale={params.locale} isEnablePager={true} isEnableSearch={true} />
    </div>
  );
}
