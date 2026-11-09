import AttachmentPreview from "@/components/attachment-preview";
import HeadInfo from "@/components/head-info";
import QuillViewer from "@/components/quill-viewer";
import AttachmentUsecase from "@/module/attachment/application/attachmentUsecase";
import AttachmentEntity from "@/module/attachment/domain/attachmentEntity";
import AttachmentRepoImpl from "@/module/attachment/presenter/attachmentRepoImpl";
import IndexMenuUsecase from "@/module/indexMenu/application/indexMenuUsecase";
import TopicEnum from "@/module/indexMenu/domain/topicEnum";
import StaticPostUsecase from "@/module/post/application/staticPostUsecase";
import PostRepoImpl from "@/module/post/presenter/postRepoImpl";
import PostViewModel from "@/module/post/presenter/postViewModel";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    label: string;
    locale: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { label, locale } = await props.params;
  const trans = await getTranslations({ locale, namespace: "Topic" });
  return { title: trans(label) };
}

export default async function StaticPage(props: Props) {
  const params = await props.params;
  const trans = await getTranslations("Topic");

  const postUsecase = new StaticPostUsecase(new PostRepoImpl());
  const attachmentUsecase = new AttachmentUsecase(new AttachmentRepoImpl());
  const indexMenuUsecase = new IndexMenuUsecase();

  const topicGroups = indexMenuUsecase.getTopicGroupsExcept([
    TopicEnum.DownloadArea,
    TopicEnum.DiseasePrevension,
  ]);

  if (topicGroups.filter(
    (group) => group.topics.map((topic) => topic.label).includes(params.label as TopicEnum)
  ).length === 0) notFound();

  var viewModel: PostViewModel | null = null;
  try {
    const entity = await postUsecase.getStaticPost(params.label);
    viewModel = new PostViewModel(entity);
  } catch { }

  const attachments: AttachmentEntity[] = [];
  for (var attachmentId of viewModel?.attachments ?? []) {
    const attachment = await attachmentUsecase.getAttachmentInfo(attachmentId);
    attachments.push(attachment);
  }

  const isEn = params.locale === "en";
  const isCampusAed = params.label === TopicEnum.Aed;
  const aedLocations = isEn
    ? [
      "Female Dormitory 14", "iHouse", "Administration Building", "Pine Garden Restaurant",
      "Zhong-Zheng Library (old map)", "Graduate Dormitory (Xi-Wang House)",
      "General Education Building (Language Center)", "Science Building 5",
      "Yi-Ren Hall (Physical Education Office)", "Taoyuan Zhongda Civil Sports Center",
      "Sports Equipment Room", "Environmental and Chemical Engineering Building (Engineering Building 4)",
      "Engineering Building 5 (College of Engineering Office)", "Mechanical Engineering Building", "You-Yi Hall",
    ]
    : [
      "學生女十四舍", "享想空間", "行政大樓", "松苑餐廳", "中正圖書館（舊圖）",
      "研究生宿舍（曦望居）", "綜教館（語言中心）", "科五館", "依仁堂（體育室辦公室）",
      "桃園市中大國民運動中心", "體育器材室", "環工化工館（工四館）",
      "工五館（工學院辦公室）", "機械館", "游藝館",
    ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h1>{trans(params.label)}</h1>
        <HeadInfo view={viewModel?.view} datetime={viewModel?.releasedDate}/>
      </div>
      <hr className="my-3" />
      <QuillViewer
        value={(isEn ? viewModel?.contentEn : viewModel?.content) ?? ""}
        imageAlt={isCampusAed
          ? (isEn ? "Map of AED locations on the National Central University campus" : "國立中央大學校園 AED 位置圖")
          : `${trans(params.label)}圖片`}
        imageDescriptionId={isCampusAed ? "campus-aed-map-description" : undefined}
        newWindowText={isEn ? "Opens in a new window" : "另開新視窗"}
      />
      {isCampusAed && (
        <section id="campus-aed-map-description" className="mt-6 rounded-lg border-2 border-amber-700 bg-amber-50 p-5 text-gray-950">
          <h2>{isEn ? "Full description of the campus AED map" : "校園 AED 位置圖完整說明"}</h2>
          <p className="mt-3">
            {isEn
              ? "The map is oriented with north at the top and marks 15 AED locations. Locations are listed below; in an emergency, call 119 and ask nearby staff for assistance."
              : "本圖以北方朝上，標示校內 15 處自動體外心臟去顫器（AED）位置。各點位如下；遇緊急狀況請先撥打 119，並請鄰近單位人員協助。"}
          </p>
          <ol className="mt-3 list-decimal space-y-1 ps-6">
            {aedLocations.map((location) => <li key={location}>{location}</li>)}
          </ol>
          <p className="mt-3">
            {isEn
              ? "Map overview: Science Building 5 and the Graduate Dormitory are to the north; the General Education Building is north-central; the library and Administration Building are to the east; iHouse, Female Dormitory 14, and You-Yi Hall are to the southeast; the sports facilities, engineering buildings, Mechanical Engineering Building, Yi-Ren Hall, and Pine Garden Restaurant are to the west."
              : "方位概述：科五館及研究生宿舍位於北側，綜教館位於中北側；中正圖書館與行政大樓位於東側；享想空間、女十四舍及游藝館位於東南側；國民運動中心、體育器材室、環工化工館、工五館、機械館、依仁堂及松苑餐廳分布於西側。"}
          </p>
        </section>
      )}
      {attachments.length > 0 && <AttachmentPreview attachments={attachments} />}
    </div>
  );
}
