'use client';

import { FormEvent, useState } from 'react';
import { SiteShell } from '@/components/site-shell';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = String(form.get('subject') || 'Website inquiry');
    const body = [
      `Name: ${form.get('name') || ''}`,
      `Email: ${form.get('email') || ''}`,
      '',
      String(form.get('message') || ''),
    ].join('\n');
    window.location.href = `mailto:Coastalyouthparliament@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <SiteShell
      eyebrow="Contact"
      title="Talk to the CYP secretariat"
      intro="We welcome partnerships, invitations, and inquiries from investors, institutions, media, and community stakeholders."
      showTopBar={false}
      bannerImage="/images/contact-cover.jpg"
      bannerCtaLabel="Get In Touch"
      bannerCtaHref="/contact"
    >
      <section className="content-layout two-column-layout contact-cover">
        <div className="panel-box wide-panel">
          <h3>Send us a message</h3>
          <form className="legacy-form" onSubmit={handleSubmit}>
            <div className="field-row">
              <label>
                Full name
                <input name="name" type="text" placeholder="Your name" required />
              </label>
            </div>
            <div className="field-row">
              <label>
                Email address
                <input name="email" type="email" placeholder="you@example.com" required />
              </label>
            </div>
            <div className="field-row">
              <label>
                Subject
                <input name="subject" type="text" placeholder="How can we help?" required />
              </label>
            </div>
            <div className="field-row">
              <label>
                Message
                <textarea name="message" rows={5} placeholder="Tell us more..." required />
              </label>
            </div>
            <button type="submit" className="primary-btn">Submit Inquiry</button>
            {submitted && <p className="form-success" role="status">Thank you. We will get in touch soonest.</p>}
          </form>
        </div>

        <aside className="panel-box side-panel">
          <h3>Contact details</h3>
          <ul className="info-list">
            <li><strong>Email:</strong> Coastalyouthparliament@gmail.com</li>
            <li><strong>Phone:</strong> +254 712 511773</li>
            <li><strong>Office:</strong> Coast Region Secretariat</li>
            <li><strong>Hours:</strong> Monday – Friday, 8:30am – 5:00pm</li>
          </ul>
        </aside>
      </section>
    </SiteShell>
  );
}
