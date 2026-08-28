import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';

export const metadata: Metadata = {
  title: 'Privacy Policy | Coastal Youth Parliament',
  description: 'How Coastal Youth Parliament collects, uses, protects, and manages personal information.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <SiteShell eyebrow="Trust and transparency" title="Privacy Policy" intro="This policy explains how CYP handles information shared through the website, membership services, and election platform.">
      <section className="legal-layout">
        <article className="panel-box legal-copy">
          <p><strong>Effective date: 28 August 2026</strong></p>
          <h2>Information we collect</h2>
          <p>We may collect account details, contact information, profile details, election applications, votes, participation records, uploaded files, and messages you choose to send us. We also collect limited technical information needed to secure and operate the service.</p>
          <h2>How we use information</h2>
          <p>We use information to authenticate members, administer elections, process applications, publish approved content, respond to enquiries, maintain audit records, improve the service, and protect the platform from abuse.</p>
          <h2>Election information</h2>
          <p>Application and candidate information is visible to authorized administrators. Voting records are protected from public display while aggregate results may be published according to the election rules. We do not display a member&apos;s individual vote choice publicly.</p>
          <h2>Storage and sharing</h2>
          <p>Information is stored in the platform database and related service infrastructure. We do not sell personal information. We share information only with service providers needed to operate the platform, where legally required, or where necessary to protect users and the organization.</p>
          <h2>Your rights</h2>
          <p>You may request access, correction, deletion, or clarification about your personal information, subject to legal and election-record requirements. Contact us at <a href="mailto:Coastalyouthparliament@gmail.com">Coastalyouthparliament@gmail.com</a>.</p>
          <h2>Cookies and analytics</h2>
          <p>Essential browser storage supports sign-in and privacy preferences. Optional analytics are disabled until you give consent. You can decline analytics through the privacy banner or clear your browser storage.</p>
          <h2>Updates</h2>
          <p>We may update this policy as the platform changes. The effective date above will change when a new version is published.</p>
        </article>
      </section>
    </SiteShell>
  );
}
