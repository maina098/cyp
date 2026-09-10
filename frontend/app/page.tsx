import type { Metadata } from 'next';
import Link from 'next/link';
import { getOverview, getNews, getEvents } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Coastal Youth Parliament connects youth leadership, county collaboration, investment, and inclusive development.',
  alternates: { canonical: '/' },
};

const CYP_LOGO_URL = 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/769118712_122102969019423074_6609072866730560699_n.jpg';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Resources', href: '/resources' },
  { label: 'Events', href: '/events' },
  { label: 'Media Center', href: '/news' },
  { label: 'Contact', href: '/contact' },
];

export default async function HomePage() {
  const [overview, news, events] = await Promise.all([
    getOverview(),
    getNews(),
    getEvents(),
  ]);

  const homepageEvents = events.length ? events.slice(0, 3) : [
    { id: 'leadership-forum-2026', title: 'Coastal Youth Leadership Forum', location: 'Mombasa', date: '15th October 2026' },
    { id: 'policy-investment-forum-2026', title: 'Coastal Policy and Investment Forum', location: 'Mombasa', date: '5th November 2026' },
  ];

  const stats = [
    { label: 'Active governors', value: 6 },
    { label: 'Secretariat members', value: 54 },
    { label: 'Published news', value: 24 },
    { label: 'Events', value: 12 },
  ];

  const strategicPillars = [
    {
      title: 'Coordination',
      text: 'Aligning county priorities, stakeholders and action plans to deliver coherent regional development.',
    },
    {
      title: 'Promotion',
      text: 'Elevating the coast as a destination for investment, trade, culture and enterprise opportunities.',
    },
    {
      title: 'Investments',
      text: 'Mobilizing capital, partnerships and innovation toward high-impact projects across the region.',
    },
    {
      title: 'Policy Harmonization',
      text: 'Supporting sector alignment on governance, infrastructure, blue economy and youth inclusion.',
    },
  ];

  const coastalCounties = [
    { name: 'Mombasa', style: { top: '76%', left: '60%' } },
    { name: 'Kwale', style: { top: '68%', left: '50%' } },
    { name: 'Kilifi', style: { top: '52%', left: '40%' } },
    { name: 'Tana River', style: { top: '40%', left: '57%' } },
    { name: 'Lamu', style: { top: '26%', left: '52%' } },
    { name: 'Taita Taveta', style: { top: '58%', left: '30%' } },
  ];

  return (
    <>
      <header className="site-header">
        <nav className="main-nav container">
          <div className="brand-wrap">
            <img src={CYP_LOGO_URL} alt="Coastal Youth Parliament logo" className="brand-logo" />
            <div>
              <strong>COASTAL</strong>
              <small>YOUTH PARLIAMENT</small>
            </div>
          </div>

          <div className="nav-menu">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="nav-item">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="nav-cta">
            <Link href="/signin" className="portal-btn">Dashboard</Link>
            <Link href="/contact" className="partner-btn">Partner With Us</Link>
          </div>
        </nav>
      </header>

      <main className="container page-shell">
        <section className="hero-banner hero-showcase">
          <div className="hero-copy">
            <p className="section-kicker">The Coast • United for Growth</p>
            <h1>Building a stronger, smarter and more inclusive coastal future.</h1>
            <p>
              The Coastal Youth Parliament brings together six coastal counties to coordinate strategy,
              promote investment, empower youth leadership and unlock the region’s full economic potential.
            </p>
            <div className="hero-actions">
              <Link href="/about" className="primary-btn">Learn more</Link>
              <Link href="/elections" className="secondary-btn">Get involved</Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="status-box spotlight-box">
              <h3>Coastal priorities</h3>
              <div className="status-row"><span>Blue economy</span><strong>Growth</strong></div>
              <div className="status-row"><span>Tourism</span><strong>Jobs</strong></div>
              <div className="status-row"><span>Trade</span><strong>Value chains</strong></div>
              <div className="status-row"><span>Innovation</span><strong>Youth-led</strong></div>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </section>

        <section className="strategic-grid">
          {strategicPillars.map((item) => (
            <article key={item.title} className="info-card pillar-card">
              <p className="section-kicker">Focus area</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mission-layout">
          <div className="mission-panel panel-box">
            <div className="section-tag-row">
              <span className="section-kicker">Mission & Vision</span>
            </div>
            <h2>Purpose built for coastal transformation.</h2>
            <div className="mission-copy">
              <div>
                <h3>Mission</h3>
                <p>
                  To coordinate and mobilize youth enterprise, innovation and community development across the six coastal counties in order to accelerate sustainable social and economic transformation.
                </p>
              </div>
              <div>
                <h3>Vision</h3>
                <p>
                  A prosperous, united and globally competitive coastal region where young people lead inclusive development, innovation and good governance.
                </p>
              </div>
            </div>
          </div>

          <div className="mission-stack">
            <div className="panel-box quick-panel">
              <p className="section-kicker">Aspirants</p>
              <h3>Purposeful leadership pipeline</h3>
              <p>
                We identify, mentor and mobilize aspirants who are ready to represent youth interests and drive practical change in policy, enterprise and community development.
              </p>
            </div>

            <div className="panel-box quick-panel">
              <p className="section-kicker">Core mandates</p>
              <ul className="mandate-list">
                <li>Promote regional integration and social cohesion.</li>
                <li>Champion youth participation in governance and development.</li>
                <li>Mobilize investment and enterprise opportunities.</li>
                <li>Support policy harmonization and county collaboration.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="county-panel panel-box">
          <div className="panel-head align-start">
            <div>
              <p className="section-kicker">Regional footprint</p>
              <h2>Six coastal counties, one agenda</h2>
            </div>
          </div>

          <div className="county-map-wrap">
            <div className="county-map" aria-label="Map of the six coastal counties">
              <div className="map-shape" />
              {coastalCounties.map((county) => (
                <span key={county.name} className="county-pin" style={county.style as React.CSSProperties}>
                  {county.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel-box">
            <div className="panel-head">
              <div>
                <p className="section-kicker">News</p>
                <h2>Latest updates</h2>
              </div>
              <Link href="/news">View all</Link>
            </div>
            <div className="list-stack">
              {news
                .filter((item: any) => item.title !== 'JKP Launches Regional Economic Blueprint 2030' && item.title !== 'Preparations Underway for JABEIC 2026')
                .slice(0, 3)
                .map((item: any) => (
                  <article key={item.id} className="list-item">
                    <h3>{item.title}</h3>
                    <p>{item.summary || item.content || 'Updated coastal development news from the bloc.'}</p>
                  </article>
                ))}
            </div>
          </div>

          <div className="panel-box">
            <div className="panel-head">
              <div>
                <p className="section-kicker">Events</p>
                <h2>Upcoming events</h2>
              </div>
              <Link href="/events">View all</Link>
            </div>
            <div className="list-stack">
              {homepageEvents.map((item) => (
                <article key={item.id} className="list-item">
                  <h3>{item.title}</h3>
                  <p>{`${item.date || 'Date to be announced'} · ${item.location || 'Location to be announced'}`}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="site-footer">
        <div className="container footer-newsletter">
          <div className="footer-newsletter-copy">
            <h3>Subscribe To Newsletter</h3>
            <p>Get updates on C Y P projects, events, and investment opportunities across the coast region.</p>
          </div>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter Your Email Address" aria-label="Email address" />
            <button type="button">Subscribe</button>
          </div>
        </div>

        <div className="container footer-main">
          <div className="footer-column footer-brand">
            <div className="brand-wrap footer-brand-wrap">
              <img src={CYP_LOGO_URL} alt="Coastal Youth Parliament logo" className="brand-logo" />
              <div>
                <strong>COASTAL</strong>
                <small>YOUTH PARLIAMENT</small>
              </div>
            </div>
            <p>The Coastal Youth Parliament is the regional development body for Kenya’s coastal counties, driving shared prosperity and sustainable growth.</p>
            <div className="social-icons">
              <span>f</span>
              <span>x</span>
              <span>in</span>
              <span>◎</span>
            </div>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/resources">Resources</a></li>
              <li><a href="/news">Media Center</a></li>
              <li><a href="/events">Events</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Get In Touch</h4>
            <ul className="contact-list">
              <li>📍 Tononoka, Mvita, Mombasa, Kenya</li>
              <li>📞 +254 712 511773</li>
              <li>✉️ Coastalyouthparliament@gmail.com</li>
              <li>🌐 www.coastalyouthparliament.org</li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Working Hours</h4>
            <div className="hours-row"><span>Monday - Friday</span><strong>8:30am - 5:00pm</strong></div>
            <div className="hours-row"><span>Saturday</span><strong>Closed</strong></div>
            <div className="hours-row"><span>Sunday</span><strong>Closed</strong></div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© 2026 Coastal Youth Parliament. All rights reserved.</p>
          <div className="legal-links">
            <a href="/terms-of-service">Terms</a>
            <a href="/privacy-policy">Privacy</a>
            <a href="/faq">FAQ</a>
          </div>
        </div>
      </footer>
    </>
  );
}
