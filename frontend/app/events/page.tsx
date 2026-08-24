import { SiteShell } from '@/components/site-shell';

export default function EventsPage() {
  return (
    <SiteShell
      eyebrow="Events"
      title="Upcoming programs & engagements"
      intro="Regional convenings, strategic forums and public programmes aligned with the coastal development agenda."
      showTopBar={false}
      bannerImage="/images/events-cover.jpg"
      bannerCtaLabel="See Events"
      bannerCtaHref="/events"
    >
      <section className="content-layout stack-layout">
        <article className="panel-box">
          <h3>Events coming soon</h3>
          <p>View upcoming regional programs and engagements.</p>
        </article>
      </section>
    </SiteShell>
  );
}
