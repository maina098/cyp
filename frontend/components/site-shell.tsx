'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function DropdownMenu({ label, links }: { label: string; links: { href: string; label: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        if (e.target === buttonRef.current) {
          e.preventDefault();
          setIsOpen(!isOpen);
          setFocusIndex(0);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusIndex(0);
        } else {
          setFocusIndex((prev) => (prev < links.length - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusIndex((prev) => (prev > 0 ? prev - 1 : links.length - 1));
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusIndex(-1);
        break;
    }
  }

  return (
    <div 
      ref={dropdownRef}
      className="nav-item dropdown"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        ref={buttonRef}
        className="drop-btn"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onKeyDown={handleKeyDown}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>
      <div 
        className={`dropdown-menu ${isOpen ? 'open' : ''}`}
        role="menu"
        aria-hidden={!isOpen}
      >
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className={`dropdown-link ${focusIndex === index ? 'focused' : ''}`}
            role="menuitem"
            tabIndex={isOpen ? 0 : -1}
            onKeyDown={handleKeyDown}
            onClick={() => {
              setIsOpen(false);
              setFocusIndex(-1);
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SiteShell({ children, eyebrow, title, intro, showTopBar = true, bannerImage, bannerCtaLabel = 'Partner With Us', bannerCtaHref = '/contact' }: { children: React.ReactNode; eyebrow?: string; title: string; intro?: string; showTopBar?: boolean; bannerImage?: string; bannerCtaLabel?: string; bannerCtaHref?: string }) {
  return (
    <>
      <header className="site-header">
        {showTopBar && (
          <div className="top-bar">
            <div className="container d-flex justify-between">
              <div className="top-contact">
              <a href="tel:+254712511773">+254 712 511773</a>
              <a href="mailto:Coastalyouthparliament@gmail.com">
                Coastalyouthparliament@gmail.com</a>
              <span>Mon – Fri: 8:30am – 5:00pm</span>
            </div>
            <div className="social-links">
              <span>Follow on:</span>
              <a href="https://www.facebook.com/JKPKE/" target="_blank" rel="noreferrer" aria-label="Facebook">Facebook</a>
              <a href="https://x.com/JumuiyaBloc" target="_blank" rel="noreferrer" aria-label="Twitter">Twitter</a>
              <a href="https://www.linkedin.com/company/jumuiya-ya-kaunti-za-pwani-economic-development-bloc/" target="_blank" rel="noreferrer" aria-label="LinkedIn">LinkedIn</a>
              <a href="https://www.instagram.com/jumuiyapwani/" target="_blank" rel="noreferrer" aria-label="Instagram">Instagram</a>
            </div>
          </div>
        </div>
        )}

        <nav className="main-nav container" aria-label="Main navigation">
          <Link href="/" className="brand-wrap" aria-label="Coastal Youth Parliament - Home">
            <img src="/images/cyp-logo.svg" alt="Coastal Youth Parliament emblem" className="brand-logo" />
            <div>
              <strong>COASTAL</strong>
              <small>YOUTH PARLIAMENT</small>
            </div>
          </Link>

          <div className="nav-menu" role="menubar">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="nav-item" role="menuitem">
                {item.label}
              </Link>
            ))}

            <DropdownMenu 
              label="Media" 
              links={[
                { href: '/resources', label: 'Resources' },
                { href: '/news', label: 'Media Center' },
                { href: '/events', label: 'Events' },
              ]} 
            />
          </div>

          <div className="nav-cta">
            <Link href="/elections" className="election-btn">Elections</Link>

            <DropdownMenu 
              label="Dashboard" 
              links={[
                { href: '/signin', label: 'Login / Register' },
              ]} 
            />

            <Link href="/contact" className="partner-btn">Partner With Us</Link>
          </div>
        </nav>
      </header>

      <main className="container page-shell">
        <section className={`page-banner${bannerImage ? ' page-banner-cover' : ''}`} style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined}>
          <div className="page-banner-copy">
            <p className="section-kicker">{eyebrow || 'Coastal Youth Parliament'}</p>
            <h1>{title}</h1>
            {intro && <p>{intro}</p>}
            {bannerImage && (
              <div className="banner-actions">
                <a href={bannerCtaHref} className="banner-btn">
                  {bannerCtaLabel}
                </a>
              </div>
            )}
          </div>
        </section>

        {children}
      </main>

      <footer className="site-footer">
        <div className="container footer-newsletter">
          <div className="footer-newsletter-copy">
            <h3>Subscribe To Newsletter</h3>
            <p>Get updates on CYP projects, events, and investment opportunities across the Coast region.</p>
          </div>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter Your Email Address" aria-label="Email address" />
            <button type="button">Subscribe</button>
          </div>
        </div>

        <div className="container footer-main">
          <div className="footer-column footer-brand">
            <div className="brand-wrap footer-brand-wrap">
              <img src="/images/cyp-logo.svg" alt="Coastal Youth Parliament emblem" className="brand-logo" />
              <div>
                <strong>COASTAL</strong>
                <small>YOUTH PARLIAMENT</small>
              </div>
            </div>
            <p>The Coastal Youth Parliament is the regional economic development body for Kenya’s coastal counties, driving shared prosperity and sustainable growth.</p>
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
            <Link href="/terms-of-service">Terms</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
