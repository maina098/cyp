const featureList = document.getElementById('featureList');

if (featureList) {
  const modules = [
    { name: 'Home', note: 'Public landing page and portal overview' },
    { name: 'About', note: 'Governance, mandate, and stakeholder information' },
    { name: 'Resources', note: 'Blueprints, reports, and digital documents' },
    { name: 'News', note: 'Announcements, articles, and newsletters' },
    { name: 'Events', note: 'Upcoming forums, workshops, and program schedules' },
    { name: 'Contact', note: 'Secretariat access and partner intake forms' },
  ];

  featureList.innerHTML = modules
    .map(
      (item) => `
        <article>
          <h4>${item.name}</h4>
          <p>${item.note}</p>
        </article>
      `,
    )
    .join('');
}
