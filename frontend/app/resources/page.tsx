import { SiteShell } from '@/components/site-shell';
import { getResources } from '@/lib/api';

export default async function ResourcesPage() {
  const resources = await getResources();
  const items = Array.isArray(resources) ? resources : [];

  return (
    <SiteShell
      eyebrow="Resources"
      title="Blueprints and strategic documents"
      intro="Public planning documents, sector reports and implementation resources guiding coastal development."
      showTopBar={false}
      bannerImage="/images/resources-cover.jpg"
      bannerCtaLabel="Open Library"
      bannerCtaHref="/resources"
    >
      <section className="content-layout stack-layout">
        <article className="panel-box">
          <h3>Resources library</h3>
          <p>Access strategic documents and blueprints for coastal development.</p>
        </article>
      </section>
    </SiteShell>
  );
}
