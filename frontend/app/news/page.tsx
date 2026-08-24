import { SiteShell } from '@/components/site-shell';
import { getNews } from '@/lib/api';

export default async function NewsPage() {
  const news = await getNews();
  const items = Array.isArray(news) ? news : [];

  return (
    <SiteShell
      eyebrow="Media Center"
      title="Media Showcase"
      intro="Showcasing various media coverage, stories, and announcements from the Coastal Youth Parliament."
      showTopBar={false}
      bannerImage="/images/mediacenter-cover.jpg"
      bannerCtaLabel="Browse Stories"
      bannerCtaHref="/news"
    >
      <section className="content-layout stack-layout">
        <article className="panel-box story-card">
          <h3>Media Center updates are currently being refreshed.</h3>
          <p>We are clearing old items and preparing new media content for the Coastal Youth Parliament.</p>
        </article>

      </section>
    </SiteShell>
  );
}
