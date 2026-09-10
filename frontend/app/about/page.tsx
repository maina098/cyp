import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Coastal Youth Parliament, its mission, vision, and regional development mandate.',
  alternates: { canonical: '/about' },
};

const topLeadership = [
  {
    name: 'HON. KIBWANA',
    title: 'Pioneer and President',
    role: 'Founder and visionary patron of the Coastal Youth Parliament, shaping the movement around youth inclusion, public participation, and economic transformation.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/Hon.Kibwana.jpeg.jpeg',
  },
  {
    name: 'HON. NASSIB JUMA',
    title: 'Prime Cabinet Secretary',
    role: 'Executive founding committee member supporting Hon. Kibwana in coordinating key cabinet functions and strategic leadership across the movement.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2011.56.41%20AM.jpeg',
    imagePos: 'center 5%',
  },
  {
    name: 'HON. ALI KUBO',
    title: 'Speaker of the House',
    role: 'A principled and visionary leader entrusted with maintaining the dignity and order of parliamentary proceedings. Hon. Ali Kubo brings a wealth of experience in youth advocacy, governance, and legislative oversight, ensuring every voice in the coastal youth assembly is heard and represented with fairness and integrity.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/630959814_26425337237072696_7273013418810656639_n.jpg',
  },
];

const leadershipTeam = [
  {
    name: 'HON. DULLA',
    title: 'Secretary General',
    role: 'Acts as the bridge between Parliament and the Executive, ensuring policy alignment, communication, and effective coordination among leadership structures.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%202.19.38%20AM.jpeg',
  },
  {
    name: 'HON. EMMANUEL MAINGI',
    title: 'CABINET SECRETARY FOR TREASURY',
    role: 'Leads treasury, fiscal policy, and economic development strategies that strengthen youth participation in national and regional growth.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2012.12.22%20PM.jpeg',
    imagePos: 'center 5%',
  },
  {
    name: 'HON. ANDERSON MAINA',
    title: 'Cabinet Secretary for ICT',
    role: 'Drives digital transformation, innovation, and technology-driven engagement to strengthen connectivity, communication, and service delivery.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2012.31.16%20PM.jpeg',
    imagePos: 'center 5%',
  },
];

export default function AboutPage() {
  return (
    <SiteShell
      eyebrow="About Us"
      title="About the Coastal Youth Parliament"
      intro="The Coastal Youth Parliament brings together counties along Kenya’s coast to strengthen economic integration, investment, and regional development."
      showTopBar={false}
      bannerImage="/images/about-cover.jpg"
      bannerCtaLabel="Learn More"
      bannerCtaHref="/about"
    >
      <section className="focus-grid">
        <div className="focus-panel" style={{ backgroundImage: `url(${topLeadership[0].image})` }}>
          <div className="focus-panel-copy">
          <h3>Vision</h3>
          <p>
            An empowered, united and transformative generation of coastal youth, fully engaged in the governance,
            economic, and social development of their region and their nation.
          </p>
          </div>
        </div>

        <div className="focus-panel" style={{ backgroundImage: `url(${leadershipTeam[0].image})` }}>
          <div className="focus-panel-copy">
          <h3>Mission</h3>
          <p>
            To organise, capacitate, and amplify the voice of coastal youth through structured advocacy,
            leadership development, and active participation in policy and decision-making processes at the county
            and national level.
          </p>
          </div>
        </div>

        <div className="focus-panel" style={{ backgroundImage: `url(${topLeadership[1].image})` }}>
          <div className="focus-panel-copy">
          <h3>Core mandate</h3>
          <p>
            The bloc aligns county priorities, mobilizes investment, and supports partnerships that
            improve growth, livelihoods, and long-term regional competitiveness.
          </p>
          </div>
        </div>

        <div className="panel-box wide-panel">
          <h3>Stakeholders</h3>
          <p>
            We work with county governments, private sector actors, development partners, youth groups,
            scholars and community organizations to deliver expansion and opportunity across the region.
          </p>
        </div>
      </section>

      <section className="leadership-section">
        <div className="leadership-header">
          <span className="section-kicker">Leadership</span>
          <h2>Executive Leadership Team</h2>
        </div>

        <div className="leadership-grid">
          {topLeadership.map((leader) => (
            <article className="leader-card" key={leader.name}>
              <img src={leader.image} alt={leader.name} className="leader-image" style={leader.imagePos ? { objectPosition: leader.imagePos } : undefined} />
              <div className="leader-body">
                <h3>{leader.name}</h3>
                <p className="leader-title">{leader.title}</p>
                <p>{leader.role}</p>
              </div>
            </article>
          ))}
          {leadershipTeam.map((leader) => (
            <article className="leader-card" key={leader.name}>
              <img src={leader.image} alt={leader.name} className="leader-image" style={leader.imagePos ? { objectPosition: leader.imagePos } : undefined} />
              <div className="leader-body">
                <h3>{leader.name}</h3>
                <p className="leader-title">{leader.title}</p>
                <p>{leader.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
