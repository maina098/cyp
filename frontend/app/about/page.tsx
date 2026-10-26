import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Coastal Youth Parliament, its mission, vision, and regional development mandate.',
  alternates: { canonical: '/about' },
};

const topLeadership = [
  {
    name: 'KIBWANA H. JUMA',
    title: 'Pioneer and President',
    role: 'As founder and President, Hon. Kibwana sets the Parliament’s vision and strategic priorities, convenes leadership around shared goals, and champions youth inclusion and public participation. The President guides the executive team, builds partnerships that advance coastal development, and helps ensure the Parliament remains accountable to the young people it represents.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/Hon.Kibwana.jpeg.jpeg',
  },
  {
    name: 'HON. KHADIJA JILLO',
    title: 'Deputy President',
    role: 'The Deputy President works closely with the President to turn shared priorities into practical plans and coordinate follow-through across the executive and parliamentary teams. The office monitors progress on decisions, helps resolve coordination gaps, and encourages accountability among leaders. When delegated, the Deputy President represents the President and helps maintain continuity of leadership so ongoing work continues effectively.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-10-21%20at%204.06.09%20AM.jpeg',
  },
  {
    name: 'HON. NASSIB JUMA',
    title: 'Prime Cabinet Secretary',
    role: 'The Prime Cabinet Secretary coordinates work across the Cabinet, helps translate the President’s priorities into aligned plans, and follows up on decisions that involve multiple departments. The office supports clear communication between Cabinet Secretaries, tracks progress on shared commitments, and helps resolve coordination gaps so programmes move forward consistently.',
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
    role: 'The Secretary General serves as the administrative link between Parliament and the Executive, coordinating official communication and keeping leadership records and decisions organized. The office supports meeting preparation, tracks agreed actions, and helps ensure information reaches the right teams so parliamentary and executive work stays aligned.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%202.19.38%20AM.jpeg',
  },
  {
    name: 'HON. AISHA YUSUF',
    title: 'Attorney General',
    role: 'The Attorney General advises the Parliament on legal and constitutional questions, reviews policies and proposed decisions for consistency with applicable rules, and helps leaders understand their obligations. The office promotes fair procedures, supports the development of sound governance frameworks, and helps address legal concerns transparently.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-10-21%20at%204.06.11%20AM.jpeg',
  },
  {
    name: 'HON. EMMANUEL MAINGI',
    title: 'CABINET SECRETARY FOR TREASURY',
    role: 'The Cabinet Secretary for Treasury leads financial planning for Parliament programmes, prepares budget priorities with the leadership team, and monitors how approved funds are allocated. The office promotes responsible financial management, provides clear updates on expenditure and resource needs, and supports sustainable initiatives that strengthen youth participation and regional development.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2012.12.22%20PM.jpeg',
    imagePos: 'center 5%',
  },
  {
    name: 'HON. BARKE RASHID',
    title: 'Cabinet Secretary for Mining, Blue Economy and Maritime Affairs',
    role: 'The Cabinet Secretary promotes responsible development of mineral resources and sustainable use of coastal and marine assets. The office advances blue-economy and maritime opportunities, supports sector partnerships, and encourages investment and livelihoods while safeguarding the region’s natural resources.',
    image: '/images/barke-rashid.jpg',
  },
  {
    name: 'HON. MKASI HAMISI',
    title: 'Deputy Cabinet Secretary for Finance',
    role: 'The Deputy Cabinet Secretary for Finance supports the Treasury with budget preparation, expenditure tracking, and accurate financial records. The office helps monitor approved spending, prepare timely financial updates, identify funding needs, and strengthen transparent, accountable planning for Parliament programmes.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-10-18%20at%208.52.20%20PM.jpeg',
  },
  {
    name: 'HON. ANDERSON MAINA',
    title: 'Cabinet Secretary for ICT',
    role: 'The Cabinet Secretary for ICT oversees the digital tools and systems that support the Parliament’s work, from internal communication to public engagement. The office promotes secure, reliable access to information, supports digital skills and innovation, and identifies practical technology improvements that make coordination and service delivery more effective.',
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
              {leader.image ? (
                <img src={leader.image} alt={leader.name} className="leader-image" style={leader.imagePos ? { objectPosition: leader.imagePos } : undefined} />
              ) : (
                <div className="leader-image leader-image-placeholder" role="img" aria-label={leader.name}>
                  {leader.name.replace(/^HON\.\s*/, '').split(/\s+/).map((part) => part[0]).join('')}
                </div>
              )}
              <div className="leader-body">
                <h3>{leader.name}</h3>
                <p className="leader-title">{leader.title}</p>
                <p>{leader.role}</p>
              </div>
            </article>
          ))}
          {leadershipTeam.map((leader) => (
            <article className="leader-card" key={leader.name}>
              {leader.image ? (
                <img src={leader.image} alt={leader.name} className="leader-image" style={leader.imagePos ? { objectPosition: leader.imagePos } : undefined} />
              ) : (
                <div className="leader-image leader-image-placeholder" role="img" aria-label={leader.name}>
                  {leader.name.replace(/^HON\.\s*/, '').split(/\s+/).map((part) => part[0]).join('')}
                </div>
              )}
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
