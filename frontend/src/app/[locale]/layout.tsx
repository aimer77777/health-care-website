import "@radix-ui/themes/styles.css";
import NavigationBar from "./navigation-bar";
import Footer from "./footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const messages = await getMessages();
  const { locale } = await params;
  const lang = locale === "en" ? "en" : "zh-Hant-TW";

  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={lang} style={{ minHeight: "calc(100vh)" }}>
        <NavigationBar />
        <div className="container mx-auto mb-20">
          {children}
        </div>
      </div>
      <Footer />
    </NextIntlClientProvider>
  );
}
