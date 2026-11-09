"use client";

import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import ExpensionTile from "@/components/expension-tile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faGraduationCap, faHouse, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import ListTile from "@/components/list-tile";
import DropdownMenu from "@/components/dropdown-menu";
import { useSearchParams } from "next/navigation";
import IndexMenuUsecase from "@/module/indexMenu/application/indexMenuUsecase";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Drawer({ isOpen, onClose: closeCallback }: Props) {

  const homeTrans = useTranslations("Home");
  const topicTrans = useTranslations("Topic");

  const pathname = usePathname();
  const query = useSearchParams().toString();

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState<boolean>(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const indexMenuUsecase = new IndexMenuUsecase();

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!document.getElementById("drawer")?.contains(event.target as Node))
        closeCallback?.();
    };

    if (isOpen)
      document.addEventListener("click", clickHandler);

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCallback?.();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    if (isOpen) document.addEventListener("keydown", keyHandler);

    return () => {
      document.removeEventListener("click", clickHandler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [isOpen, closeCallback]);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed z-10 inset-0 bg-black opacity-50 pointer-events-auto"></div>
      <div ref={drawerRef} id="drawer" className="fixed z-10 top-0 left-0 bottom-0 h-screen bg-white w-72 rounded-r-xl" role="dialog" aria-modal="true" aria-label={homeTrans("menu")}>
        <div className="flex flex-col pt-20 pb-8 h-full">
          <div className="mx-4 flex items-center justify-between">
            <h2>{homeTrans("menu")}</h2>
            <button ref={closeButtonRef} type="button" onClick={closeCallback} aria-label={homeTrans("close_menu")} className="rounded-md p-2">
              <FontAwesomeIcon icon={faXmark} className="size-5" aria-hidden="true" />
            </button>
          </div>
          <hr className="m-4" />
          <div className="flex flex-col flex-1 overflow-y-auto">
            {
              indexMenuUsecase.getTopicGroups().map((group) => (
                <ExpensionTile key={group.label} title={topicTrans(group.label)} className="w-full" titleClassName="py-2 px-4">
                  {
                    group.topics.map((topic) => (
                      <ListTile key={topic.label} className="py-2 px-4">
                        <Link href={`/page/${topic.label}`} className="py-2" onClick={closeCallback}>
                          {topicTrans(topic.label)}
                        </Link>
                      </ListTile>
                    ))
                  }
                </ExpensionTile>
              ))
            }
          </div>
          <div id="drawer-bottom" className="flex flex-col h-fit mx-4">
            <hr className="my-4" />
            <ListTile className="py-2 px-4">
              <Link href="/" className="flex flex-row items-center" onClick={closeCallback}>
                <FontAwesomeIcon icon={faHouse} className="size-5 me-4" />
                {homeTrans("homepage")}
              </Link>
            </ListTile>
            <ListTile className="py-2 px-4">
              <Link href="https://ncu.edu.tw/" className="flex flex-row items-center" onClick={closeCallback}>
                <FontAwesomeIcon icon={faGraduationCap} className="size-5 me-4" />
                {homeTrans("ncu_homepage")}
              </Link>
            </ListTile>
            <div className="flex flex-col">
              <button
                type="button"
                className="flex w-full flex-row items-center px-4 py-2 text-left"
                aria-controls="drawer-language-menu"
                aria-expanded={isLanguageDropdownOpen}
                aria-haspopup="menu"
                onClick={() => setIsLanguageDropdownOpen((value) => !value)}
              >
                <FontAwesomeIcon icon={faGlobe} className="size-5 me-4" />
                {homeTrans("language")}
              </button>
              <DropdownMenu
                id="drawer-language-menu"
                isOpen={isLanguageDropdownOpen}
                onCancel={() => setIsLanguageDropdownOpen(false)}
              >
                {
                  [["zh", "中文"], ["en", "English"]].map(([locale, label]) => (
                    <Link
                      key={locale} href={{ pathname, query }} locale={locale}
                      onClick={closeCallback}
                      className="hover:bg-black hover:bg-opacity-5 px-2 py-1 rounded-md"
                    >
                      {label}
                    </Link>
                  ))
                }
              </DropdownMenu>
            </div>
            <div className="flex flex-row gap-2 w-fit mt-2 ms-1.5">
              <Link href="https://www.instagram.com/ncu7270" aria-label="Instagram" title="Instagram">
                <FontAwesomeIcon icon={faInstagram} className="size-5 p-2 border border-gray-300 rounded-full" aria-hidden="true" />
              </Link>
              <Link href="https://www.facebook.com/profile.php?id=100057326145371" aria-label="Facebook" title="Facebook">
                <FontAwesomeIcon icon={faFacebook} className="size-5 p-2 border border-gray-300 rounded-full" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
