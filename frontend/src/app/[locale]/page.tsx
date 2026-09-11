import IndexMenu from "./index-menu";
import PostPanel from "./post/post-panel";
import RestaurantPanel from "./restaurant/restaurant-panel";
import Carousel from "./carousel";
import { normalPostColumnSelections } from "@/module/post/presenter/columnSelection";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage(props: Props) {
  const params = await props.params;
  return (
    <>
      <div className="flex flex-row gap-10">
        <IndexMenu className="max-md:hidden" />
        <div className="flex flex-col flex-1 gap-10">
          <Carousel locale={params.locale} />
          <PostPanel
            locale={params.locale}
            isEnableTitle={true}
            isEnableMore={true}
            columnSelections={normalPostColumnSelections}
          />
          <RestaurantPanel locale={params.locale} isEnableTitle={true} isEnableMore={true} />
        </div>
      </div>
    </>
  )
}
