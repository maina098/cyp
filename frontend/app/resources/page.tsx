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
          {items.length ? items.map((resource) => <div key={resource.id} className="resource-list-item"><h4>{resource.title}</h4><p>{resource.description || resource.summary}</p>{resource.fileUrl && <a className="text-link" href={resource.fileUrl.startsWith('http') ? resource.fileUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${resource.fileUrl}`} target="_blank" rel="noreferrer">Open resource</a>}</div>) : <p>No resources have been published yet.</p>}
        </article>
      </section>
    </SiteShell>
  );
}
