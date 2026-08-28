'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'cyp-analytics-consent';

export function PrivacyConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(CONSENT_KEY) === null);
  }, []);

  const choose = (value: 'granted' | 'denied') => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
    window.dispatchEvent(new CustomEvent('cyp-consent-change', { detail: value }));
  };

  if (!visible) return null;

  return (
    <aside className="consent-banner" role="dialog" aria-labelledby="consent-title" aria-describedby="consent-description">
      <div>
        <h2 id="consent-title">Your privacy matters</h2>
        <p id="consent-description">CYP uses essential storage to keep the site working. Optional analytics help us improve the public experience and only load with your permission.</p>
      </div>
      <div className="consent-actions">
        <button type="button" className="consent-secondary" onClick={() => choose('denied')}>Decline analytics</button>
        <button type="button" className="consent-primary" onClick={() => choose('granted')}>Allow analytics</button>
      </div>
    </aside>
  );
}
