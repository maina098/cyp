import { SiteShell } from '@/components/site-shell';
import { getEvents } from '@/lib/api';

export default async function EventsPage() {
  const events = await getEvents();
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
          <h3>Upcoming events</h3>
          {events.length ? events.map((event) => <div key={event.id} className="event-list-item"><h4>{event.title}</h4><p>{event.description || event.summary}</p><span>{event.date ? new Date(event.date).toLocaleString() : 'Date to be announced'}{event.location ? ` · ${event.location}` : ''}</span></div>) : <p>No upcoming events have been published.</p>}
        </article>
      </section>
    </SiteShell>
  );
}
