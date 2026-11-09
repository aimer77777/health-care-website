import IndexMenuUsecase from "@/module/indexMenu/application/indexMenuUsecase";
import { Link } from "@/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const trans = await getTranslations({ locale, namespace: "Home" });
  return { title: trans("sitemap") };
}

export default async function SitemapPage() {
  const homeTrans = await getTranslations("Home");
  const topicTrans = await getTranslations("Topic");
  const groups = new IndexMenuUsecase().getTopicGroups();

  return (
    <div>
      <h1>{homeTrans("sitemap")}</h1>
      <section className="mt-6 rounded-lg border p-5" aria-labelledby="accesskey-help-title">
        <h2 id="accesskey-help-title">{homeTrans("accesskey_help")}</h2>
        <p className="mt-3">{homeTrans("accesskey_intro")}</p>
        <ul className="mt-3 list-disc space-y-1 ps-6">
          <li><kbd>Alt</kbd> + <kbd>U</kbd>：{homeTrans("accesskey_u")}</li>
          <li><kbd>Alt</kbd> + <kbd>C</kbd>：{homeTrans("accesskey_c")}</li>
          <li><kbd>Alt</kbd> + <kbd>Z</kbd>：{homeTrans("accesskey_z")}</li>
        </ul>
        <p className="mt-3">{homeTrans("accesskey_browser_note")}</p>
      </section>

      <nav className="mt-8" aria-label={homeTrans("sitemap")}>
        <h2>{homeTrans("main_pages")}</h2>
        <ul className="mt-3 list-disc space-y-2 ps-6">
          <li><Link href="/" className="link">{homeTrans("homepage")}</Link></li>
          <li><Link href="/post" className="link">NEWS</Link></li>
          <li><Link href="/restaurant" className="link">{homeTrans("restaurant_reports")}</Link></li>
          <li><Link href="/page/download_area" className="link">{homeTrans("download_area")}</Link></li>
          <li><Link href="/privacy" className="link">{homeTrans("privacy")}</Link></li>
        </ul>

        <h2 className="mt-8">{homeTrans("topic_pages")}</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <section key={group.label} aria-labelledby={`sitemap-${group.label}`}>
              <h3 id={`sitemap-${group.label}`}>{topicTrans(group.label)}</h3>
              <ul className="mt-2 list-disc space-y-1 ps-6">
                {group.topics.map((topic) => (
                  <li key={topic.label}><Link href={`/page/${topic.label}`} className="link">{topicTrans(topic.label)}</Link></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </nav>
    </div>
  );
}
