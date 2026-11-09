"use client";

import CarouselUsecase from "@/module/carousel/application/carouselUsecase";
import CarouselEntity from "@/module/carousel/domain/carouselEntity";
import CarouselRepoImpl from "@/module/carousel/presenter/carouselRepoImpl";
import { faAngleLeft, faAngleRight, faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MouseEventHandler, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import CarouselViewModel from "@/module/carousel/presenter/carouselViewModel";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

type Props = {
  className?: string;
  locale: string;
};

const usecase = new CarouselUsecase(new CarouselRepoImpl());

function plainText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

export default function Carousel({ className, locale }: Props) {
  const trans = useTranslations("Carousel");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carousels, setCarousels] = useState<CarouselEntity[]>([]);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const isEn = locale === "en";
  const isPaused = isManuallyPaused || isFocusPaused;

  useEffect(() => {
    usecase.getAllCarousels({ visibility: true })
      .then(setCarousels)
      .catch((err) => console.error("Fetching carousel failed:", err));
  }, []);

  const labels = useMemo(() => carousels.map((entity, index) => {
    const title = (isEn ? entity.titleEn : entity.title).trim();
    const content = plainText(isEn ? entity.contentEn : entity.content);
    const meaningfulTitle = title && !/^\d+$/.test(title) ? title : content.slice(0, 75);
    return meaningfulTitle.slice(0, 60) || trans("slide_fallback", { number: index + 1 });
  }), [carousels, isEn, trans]);

  const getNextIndex = (value: number) => carousels.length === 0 ? 0 : (value + 1) % carousels.length;
  const getPreviousIndex = (value: number) => carousels.length === 0 ? 0 : (value - 1 + carousels.length) % carousels.length;
  const resetTimer = () => setResetKey((value) => value + 1);
  const goNext = () => { setCurrentIndex(getNextIndex); resetTimer(); };
  const goPrevious = () => { setCurrentIndex(getPreviousIndex); resetTimer(); };

  useEffect(() => {
    if (isPaused || carousels.length <= 1) return;
    const interval = window.setInterval(
      () => setCurrentIndex((value) => (value + 1) % carousels.length),
      5000
    );
    return () => window.clearInterval(interval);
  }, [resetKey, carousels.length, isPaused]);

  if (carousels.length === 0) return null;

  return (
    <section
      className={`${className ?? ""} relative`}
      aria-roledescription={trans("region_description")}
      aria-label={trans("region_label")}
      onFocusCapture={() => setIsFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsFocusPaused(false);
      }}
    >
      <button
        type="button"
        className="mb-2 inline-flex items-center gap-2 rounded-md bg-gray-950 px-3 py-2 text-white"
        aria-pressed={isManuallyPaused}
        onClick={() => setIsManuallyPaused((value) => !value)}
      >
        <FontAwesomeIcon icon={isManuallyPaused ? faPlay : faPause} className="size-4" aria-hidden="true" />
        {isManuallyPaused ? trans("play") : trans("pause")}
      </button>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl" aria-live={isPaused ? "polite" : "off"}>
        {carousels.map((entity, index) => {
          const viewModel = new CarouselViewModel(entity);
          const isCurrent = index === currentIndex;
          return (
            <Image
              key={entity.id}
              alt={isCurrent ? trans("image_alt", { title: labels[index] }) : ""}
              aria-hidden={!isCurrent}
              src={viewModel.imageUrl}
              fill
              priority={index === 0}
              sizes="(min-width: 768px) 75vw, 100vw"
              className={`object-cover transition-all duration-500 ease-in-out ${index > currentIndex ? "translate-x-full opacity-0" : index < currentIndex ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}
            />
          );
        })}
        <CarouselControl />
      </div>
    </section>
  );

  function CarouselControl() {
    return (
      <div id="carousel-control" className="absolute inset-0">
        <Link href={`/carousel/${carousels[currentIndex].id}`} className="absolute inset-0 z-0" aria-label={trans("open_slide", { title: labels[currentIndex] })} />
        <button
          id="carousel-left-button"
          type="button"
          aria-label={trans("previous")}
          className="absolute top-1/2 left-4 z-10 transform -translate-y-1/2 p-3 rounded-full text-white bg-black bg-opacity-70 cursor-pointer"
          onClick={goPrevious}
        >
          <FontAwesomeIcon
            icon={faAngleLeft}
            className="size-5 md:size-6 lg:size-7"
            aria-hidden="true"
          />
        </button>
        <button
          id="carousel-right-button"
          type="button"
          aria-label={trans("next")}
          className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2 p-3 rounded-full text-white bg-black bg-opacity-70 cursor-pointer"
          onClick={goNext}
        >
          <FontAwesomeIcon
            icon={faAngleRight}
            className="size-5 md:size-6 lg:size-7"
            aria-hidden="true"
          />
        </button>
        <div className="absolute flex flex-row bottom-4 left-1/2 z-10 transform -translate-x-1/2 gap-2">
          {
            Array.from({ length: carousels.length }).map((_, i) => (
              <Circle key={i} index={i} label={labels[i]} isSelected={i === currentIndex} onClick={() => { setCurrentIndex(i); resetTimer(); }} />
            ))
          }
        </div>
      </div>
    )
  }

  function Circle({
    index,
    label,
    isSelected,
    onClick,
  }: {
    index: number,
    label: string,
    isSelected: boolean,
    onClick?: MouseEventHandler<HTMLButtonElement>,
  }) {
    return (
      <button
        type="button"
        aria-label={trans("go_to_slide", { number: index + 1, title: label })}
        aria-current={isSelected ? "true" : undefined}
        className={`relative size-4 rounded-full border-2 border-white ${isSelected ? "bg-gray-950" : "bg-gray-600"} cursor-pointer`}
        onClick={onClick}
      />
    )
  }
}
