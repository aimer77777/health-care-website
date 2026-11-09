import CarouselUsecase from "@/module/carousel/application/carouselUsecase";
import CarouselRepoImpl from "@/module/carousel/presenter/carouselRepoImpl";
import CarouselViewModel from "@/module/carousel/presenter/carouselViewModel";
import { notFound } from "next/navigation";
import Image from "next/image";
import HeadInfo from "@/components/head-info";
import QuillViewer from "@/components/quill-viewer";
import { Link } from "@/navigation";
import type { Metadata } from "next";
import { cache } from "react";

type Props = {
  params: Promise<{ locale: string; id: string }>;
}

const getCarousel = cache((id: number) => new CarouselUsecase(new CarouselRepoImpl()).getCarouselInfo(id));

function getCarouselTitle(entity: { id: number; title: string; titleEn: string; content: string; contentEn: string }, locale: string) {
  const title = (locale === "en" ? entity.titleEn : entity.title).trim();
  if (title && !/^\d+$/.test(title)) return title;
  const content = (locale === "en" ? entity.contentEn : entity.content)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return content.slice(0, 60) || (locale === "en" ? `Homepage banner ${entity.id}` : `首頁橫幅 ${entity.id}`);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id, locale } = await props.params;
  if (!/^\d+$/.test(id)) return {};
  try {
    const entity = await getCarousel(Number(id));
    return { title: getCarouselTitle(entity, locale) };
  } catch {
    return {};
  }
}

export default async function CarouselPage(props: Props) {
  const params = await props.params;
  if (!/^\d+$/.test(params.id)) notFound();
  const idNum = Number(params.id);

  var viewModel: CarouselViewModel;
  try {
    const entity = await getCarousel(idNum);
    viewModel = new CarouselViewModel(entity);
  } catch (err) {
    notFound();
  }

  const isEn = params.locale === "en";
  const pageTitle = getCarouselTitle(viewModel, params.locale);

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h1>{pageTitle}</h1>
        <HeadInfo datetime={viewModel.releasedDate} />
      </div>
      <hr className="my-3" />
      <div className="w-full max-w-[60rem]">
        <Link href={viewModel.imageUrl} target="_blank" title={isEn ? "Open full-size image in a new window" : "另開新視窗檢視完整圖片"}>
          <Image
            src={viewModel.imageUrl}
            alt={isEn ? `Homepage banner: ${pageTitle}` : `首頁橫幅：${pageTitle}`}
            width={960}
            height={540}
          />
          <span className="sr-only">{isEn ? "Opens in a new window" : "另開新視窗"}</span>
        </Link>
      </div>
      <QuillViewer value={isEn ? viewModel.contentEn : viewModel.content} imageAlt={`${pageTitle}圖片`} newWindowText={isEn ? "Opens in a new window" : "另開新視窗"} />
    </>
  );
}
