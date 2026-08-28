import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';

export const metadata: Metadata = {
  title: 'Terms of Service | Coastal Youth Parliament',
  description: 'Terms governing use of the Coastal Youth Parliament website and election services.',
  alternates: { canonical: '/terms-of-service' },
};

export default function TermsPage() {
  return (
    <SiteShell eyebrow="Responsible participation" title="Terms of Service" intro="These terms set the rules for using CYP public services, member accounts, and election features.">
      <section className="legal-layout">
        <article className="panel-box legal-copy">
          <p><strong>Effective date: 28 August 2026</strong></p>
          <h2>Acceptable use</h2>
          <p>Use the platform lawfully and provide accurate information. Do not impersonate another person, interfere with an election, submit fraudulent applications, upload harmful material, or attempt unauthorized access.</p>
          <h2>Accounts</h2>
          <p>Keep your credentials private and notify CYP if you believe your account has been compromised. You are responsible for activity performed through your account.</p>
          <h2>Applications and voting</h2>
          <p>Applications must represent your own information. Eligibility, application windows, candidate approval, voting windows, and election decisions are governed by the relevant election rules. Votes may be limited to one per member per election.</p>
          <h2>Content and uploads</h2>
          <p>You must have the right to submit material and must not upload malware, unlawful content, or private information belonging to someone else. CYP may remove material that threatens users, the service, or the integrity of an election.</p>
          <h2>Service availability</h2>
          <p>We work to keep the service available, but maintenance, network failures, and third-party infrastructure may cause interruptions. Do not rely on the platform as the sole location for critical records.</p>
          <h2>Contact</h2>
          <p>Questions about these terms can be sent to <a href="mailto:Coastalyouthparliament@gmail.com">Coastalyouthparliament@gmail.com</a>.</p>
        </article>
      </section>
    </SiteShell>
  );
}
