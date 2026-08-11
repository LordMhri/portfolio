'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import styles from './NavBar.module.css';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );

    NAV_LINKS.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={`${styles.inner} container`}>
        {/* Logo */}
        <Link href="#hero" className={styles.logo} data-cursor-hover>
          <span className={styles.logoMark}>&lt;/&gt;</span>
          <span className={styles.logoName}>yn</span>
        </Link>

        {/* Links */}
        <ul className={styles.links}>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className={`${styles.link} ${activeSection === href.slice(1) ? styles.active : ''}`}
                data-cursor-hover
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Controls */}
        <div className={styles.controls}>
          <ThemeToggle />
          <a href="#contact" className={`btn btn-primary ${styles.ctaBtn}`} data-cursor-hover>
            Hire Me
          </a>
        </div>
      </nav>
    </header>
  );
}
