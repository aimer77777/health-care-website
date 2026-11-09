import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import Card from "@/components/card";
import IndexMenuUsecase from "@/module/indexMenu/application/indexMenuUsecase";
import TopicGroupEntity from "@/module/indexMenu/domain/topicGroupEntity";

type Props = {
  className?: string;
};

export default function IndexMenu({ className }: Props) {

  const topicTrans = useTranslations("Topic");

  const indexMenuUsecase = new IndexMenuUsecase();

  return (
    <div className={className}>
      <div className="flex flex-col gap-5">
        {
          indexMenuUsecase.getTopicGroups().map((group) => (
            <SideMenuGroup key={group.label} group={group} />
          ))
        }
      </div>
    </div>
  )

  function SideMenuGroup({ group }: { group: TopicGroupEntity }) {
    return (
      <Card>
        <div className="flex flex-col items-center py-4 px-6 gap-2">
          <h2 className="text-lg">{topicTrans(group.label)}</h2>
          <hr className="w-full" />
          {
            group.topics.map((topic) => (
              <Link key={topic.label} href={`/page/${topic.label}`} className="rounded-full px-3 py-1 text-amber-950 hover:bg-black/5">
                {topicTrans(topic.label)}
              </Link>
            ))
          }
        </div>
      </Card>
    )
  }
}


