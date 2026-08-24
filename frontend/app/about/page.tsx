import { SiteShell } from '@/components/site-shell';

const topLeadership = [
  {
    name: 'Hon. Kibwana',
    title: 'Pioneer and President',
    role: 'Founder and visionary patron of the Coastal Youth Parliament, shaping the movement around youth inclusion, public participation, and economic transformation.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/Hon.Kibwana.jpeg.jpeg',
  },
  {
    name: 'Hon. Nassib Juma',
    title: 'Prime Cabinet Secretary',
    role: 'Executive founding committee member supporting Hon. Kibwana in coordinating key cabinet functions and strategic leadership across the movement.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2011.56.41%20AM.jpeg',
    imagePos: 'center 5%',
  },
  {
    name: 'Hon. Ali Kubo',
    title: 'Speaker of the House',
    role: 'A principled and visionary leader entrusted with maintaining the dignity and order of parliamentary proceedings. Hon. Ali Kubo brings a wealth of experience in youth advocacy, governance, and legislative oversight, ensuring every voice in the coastal youth assembly is heard and represented with fairness and integrity.',
    image: 'https://scontent.fnbo19-1.fna.fbcdn.net/v/t39.30808-6/651008717_26756158403990576_5081908159047801026_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1920&ctp=s590x590&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeECitwe0yXozk4lHW-pZuVvokYZOj-z7ZKiRhk6P7Ptkp60CIeqdIvfWmI1rMH38xW-v8ECCBOPedsvlipdNOXe&_nc_ohc=qeN4cDtJGbAQ7kNvwHNd_s4&_nc_oc=Adrz1zg0WX2pJCW9ZPC3Jw3vMjEb7kn9VRTyTyqqX49tDi7sI06Xu4z4UNk56HIBhsk&_nc_zt=23&_nc_ht=scontent.fnbo19-1.fna&_nc_gid=DaF-8Pd9WzeIikNFGaGJ-Q&_nc_ss=7b2a8&oh=00_AQG0zZyOfVABZqVGA304eta2Kqq5Quvav2w4Rz2O-MKh2Q&oe=6A86424C',
  },
];

const leadershipTeam = [
  {
    name: 'Hon. Dulla',
    title: 'Secretary General',
    role: 'Acts as the bridge between Parliament and the Executive, ensuring policy alignment, communication, and effective coordination among leadership structures.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%202.19.38%20AM.jpeg',
  },
  {
    name: 'Hon. EMMANUEL MAINGI',
    title: 'Cabinet Secretary for Economic and National Planning',
    role: 'Leads planning, policy direction, and economic development strategies that strengthen youth participation in national and regional growth.',
    image: 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2012.12.22%20PM.jpeg',
    imagePos: 'center 5%',
  },
  {
    name: 'Hon. Anderson Maina',
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
