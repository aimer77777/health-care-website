import AttachmentPreview from "@/components/attachment-preview";
import HeadInfo from "@/components/head-info";
import QuillViewer from "@/components/quill-viewer";
import AttachmentUsecase from "@/module/attachment/application/attachmentUsecase";
import AttachmentEntity from "@/module/attachment/domain/attachmentEntity";
import AttachmentRepoImpl from "@/module/attachment/presenter/attachmentRepoImpl";
import NormalPostUsecase from "@/module/post/application/normalPostUsecase";
import PostEntity from "@/module/post/domain/postEntity";
import PostRepoImpl from "@/module/post/presenter/postRepoImpl";
import PostViewModel from "@/module/post/presenter/postViewModel";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";

type Props = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

const getPost = cache((id: number) => new NormalPostUsecase(new PostRepoImpl()).getPostById(id));

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id, locale } = await props.params;
  if (!/^\d+$/.test(id)) return {};
  try {
    const entity = await getPost(Number(id));
    return { title: locale === "en" ? entity.titleEn : entity.title };
  } catch {
    return {};
  }
}

export default async function PostPage(props: Props) {
  const params = await props.params;
  const attachmentUsecase = new AttachmentUsecase(new AttachmentRepoImpl());

  if (!/^\d+$/.test(params.id)) notFound();
  const idNum = Number(params.id);

  var entity: PostEntity;
  try {
    entity = await getPost(idNum);
  } catch {
    notFound();
  }
  const viewModel = new PostViewModel(entity);

  const attachments: AttachmentEntity[] = [];
  for (var attachmentId of viewModel?.attachments ?? []) {
    const attachment = await attachmentUsecase.getAttachmentInfo(attachmentId);
    attachments.push(attachment);
  }

  const isEn = params.locale === "en";

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h1>{isEn ? viewModel.titleEn : viewModel.title}</h1>
        <HeadInfo view={viewModel.view} datetime={viewModel.releasedDate} />
      </div>
      <hr className="my-3" />
      <QuillViewer value={isEn ? viewModel.contentEn : viewModel.content} imageAlt={`${isEn ? viewModel.titleEn : viewModel.title}圖片`} newWindowText={isEn ? "Opens in a new window" : "另開新視窗"} />
      {
        attachments.length > 0 &&
        <AttachmentPreview className="mt-12" attachments={attachments} />
      }
    </div>
  );
}
