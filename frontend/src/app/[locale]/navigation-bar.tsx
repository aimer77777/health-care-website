"use client";

import Button from "@/components/button"
import Logo from "@/components/logo";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons"
import { faBars, faGlobe, faGraduationCap, faHouse, faMosquito, faScrewdriverWrench, faSignOut } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useRef, useState } from "react"
import Drawer from "./drawer";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/navigation";
import DropdownMenu from "@/components/dropdown-menu";
import { useSearchParams } from "next/navigation";
import UserRoleEnum from "@/module/user/domain/userRoleEnum";
import UserUsecase from "@/module/user/application/userUsecase";
import UserRepoImpl from "@/module/user/presenter/userRepoImpl";

const userUsecase = new UserUsecase(new UserRepoImpl());

export default function NavigationBar() {
  const homeTrans = useTranslations("Home");
  const pageLocale = useLocale();

  const pathname = usePathname();
  const query = useSearchParams().toString();

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRoleEnum>(UserRoleEnum.None);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function clearUserRole() {
    setUserRole(UserRoleEnum.None);
  }

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    userUsecase.getCurrentUser()
      .then((user) => setUserRole(user.role))
      .catch(clearUserRole);
  }, []);

  return (
    <header id="top-navigation">
      <a href="#top-navigation" accessKey="u" className="accesskey-anchor">::: {homeTrans("accesskey_u")}</a>
      <div className="flex items-center justify-end bg-amber-400 py-1 px-2 gap-2 text-gray-800 max-md:hidden">
        {/* Admin links */}
        {
          userRole <= UserRoleEnum.Normal &&
          <Link href="/dengue" className="flex items-center rounded-full px-3 py-1 hover:bg-black/5">
              <FontAwesomeIcon icon={faMosquito} className="size-5 me-2" />
              {homeTrans("dengue")}
          </Link>
        }
        {
          userRole <= UserRoleEnum.StudentB &&
          <Link href="/admin" className="flex items-center rounded-full px-3 py-1 hover:bg-black/5">
              <FontAwesomeIcon icon={faScrewdriverWrench} className="size-5 me-2" />
              {homeTrans("admin")}
          </Link>
        }
        {
          userRole <= UserRoleEnum.Normal &&
          <Link href="/logout" onClick={clearUserRole} className="flex items-center rounded-full px-3 py-1 hover:bg-black/5">
              <FontAwesomeIcon icon={faSignOut} className="size-5 me-2" />
              {homeTrans("logout")}
          </Link>
        }
        {/* Social links */}
        <Link href="/" className="flex items-center rounded-full px-3 py-1 hover:bg-black/5">
            <FontAwesomeIcon icon={faHouse} className="size-5 me-2" />
            {homeTrans("homepage")}
        </Link>
        <Link href="https://ncu.edu.tw/" className="flex items-center rounded-full px-3 py-1 hover:bg-black/5">
            <FontAwesomeIcon icon={faGraduationCap} className="size-5 me-2" />
            {homeTrans("ncu_homepage")}
        </Link>
        <div>
          <Button
            ariaControls="desktop-language-menu"
            ariaExpanded={isLanguageDropdownOpen}
            ariaHasPopup="menu"
            onClick={() => setIsLanguageDropdownOpen((value) => !value)}
          >
            <FontAwesomeIcon icon={faGlobe} className="size-5 me-2" />
            {homeTrans("language")}
          </Button>
          <DropdownMenu
            id="desktop-language-menu"
            isOpen={isLanguageDropdownOpen}
            onCancel={() => setIsLanguageDropdownOpen(false)}
          >
            {
              [["zh", "中文"], ["en", "English"]].map(([locale, label]) => (
                <Link
                  key={locale} href={{ pathname, query }} locale={locale}
                  lang={locale !== pageLocale ? (locale === "en" ? "en" : "zh-Hant-TW") : undefined}
                  className="hover:bg-black hover:bg-opacity-5 px-2 py-1 rounded-md"
                >
                  {label}
                </Link>
              ))
            }
          </DropdownMenu>
        </div>
        <Link href="https://www.instagram.com/ncu7270" aria-label="Instagram" title="Instagram" className="rounded-full p-2 hover:bg-black/5">
            <FontAwesomeIcon icon={faInstagram} className="size-5 my-0.5" aria-hidden="true" />
        </Link>
        <Link href="https://www.facebook.com/profile.php?id=100057326145371" aria-label="Facebook" title="Facebook" className="rounded-full p-2 hover:bg-black/5">
            <FontAwesomeIcon icon={faFacebook} className="size-5 my-0.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Inner links */}
      <div className="flex flex-row justify-between items-center container mx-auto">
        <button
          ref={menuButtonRef}
          type="button"
          className="md:hidden"
          aria-label={homeTrans("menu")}
          aria-controls="drawer"
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen(true)}
        >
          <FontAwesomeIcon icon={faBars} className="size-5" aria-hidden="true" />
        </button>
        <div className="flex flex-row w-full justify-center md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-row items-center max-md:hidden gap-2">
          <Link href="/page/work_team" className="text-amber-950 text-nowrap rounded-full px-3 py-1 hover:bg-black/5">
            {homeTrans("about_us")}
          </Link>
          <Link href="/page/campus_aed" className="text-amber-950 text-nowrap rounded-full px-3 py-1 hover:bg-black/5">
            {homeTrans("aed")}
          </Link>
          <Link href="/page/regulation" className="text-amber-950 text-nowrap rounded-full px-3 py-1 hover:bg-black/5">
            {homeTrans("regulation")}
          </Link>
          <Link href="/page/download_area" className="text-amber-950 text-nowrap rounded-full px-3 py-1 hover:bg-black/5">
            {homeTrans("download_area")}
          </Link>
          <Link href="/sitemap" className="text-amber-950 text-nowrap rounded-full px-3 py-1 hover:bg-black/5">
            {homeTrans("sitemap")}
          </Link>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </header>
  )
}
