import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';

export const metadata: Metadata = {
  title: 'FAQ | Coastal Youth Parliament',
  description: 'Answers about CYP membership, applications, elections, voting, and support.',
  alternates: { canonical: '/faq' },
};

const questions = [
  ['How do I join CYP?', 'Create an account from the Dashboard link, verify your details, and complete your member profile.'],
  ['How do election applications work?', 'When an administrator opens a position, eligible members can submit one application for that position during the application window.'],
  ['What happens after I apply?', 'Your application remains pending until an administrator reviews it. You can see its status from your member dashboard.'],
  ['When can I vote?', 'Voting is available to authenticated members while an election is active and inside its configured voting dates.'],
  ['Can I vote more than once?', 'The platform enforces one vote per member per election.'],
  ['Why can’t I see an election position?', 'The position may still be closed, the election may not be open, or your session may need to be refreshed.'],
  ['How do I report a technical problem?', 'Send the page, action, time, and any visible error message to Coastalyouthparliament@gmail.com. Do not send your password.'],
];

export default function FaqPage() {
  return (
    <SiteShell eyebrow="Help centre" title="Frequently Asked Questions" intro="Quick answers for members, applicants, voters, and partners.">
      <section className="faq-list" aria-label="Frequently asked questions">
        {questions.map(([question, answer]) => (
          <details className="faq-item" key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </SiteShell>
  );
}
