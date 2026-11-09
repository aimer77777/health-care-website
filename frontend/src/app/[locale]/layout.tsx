import "@radix-ui/themes/styles.css";
import NavigationBar from "./navigation-bar";
import Footer from "./footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import PageLanguage from "@/components/page-language";
import Breadcrumbs from "./breadcrumbs";
import RouteAnnouncer from "./route-announcer";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const accessibilityTrans = await getTranslations("Accessibility");

  return (
    <NextIntlClientProvider messages={messages}>
      <PageLanguage />
      <a href="#main-content" className="skip-link">{accessibilityTrans("skip_to_content")}</a>
      <RouteAnnouncer />
      <div style={{ minHeight: "calc(100vh)" }}>
        <NavigationBar />
        <main id="main-content" tabIndex={-1} className="container mx-auto mb-20">
          <a href="#main-content" accessKey="c" className="accesskey-anchor">::: {accessibilityTrans("main_content")}</a>
          <Breadcrumbs />
          {children}
        </main>
      </div>
      <Footer />
    </NextIntlClientProvider>
  );
}
