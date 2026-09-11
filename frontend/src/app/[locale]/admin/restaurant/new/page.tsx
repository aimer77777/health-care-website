import RestaurantEditor from "../restaurant-editor";

type Props = {
  params: Promise<{ locale: string }>;
}

export default async function NewRestaurantPage(props: Props) {
  const params = await props.params;
  return (
    <RestaurantEditor locale={params.locale} />
  );
}