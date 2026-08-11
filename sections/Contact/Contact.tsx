'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { contact } from '@/lib/data';
import { FogLayer } from '@/components/ScrollTheater/FogLayer';
import styles from './Contact.module.css';
import React from 'react';

const socialIcons: Record<string, React.ReactNode> = {
  github: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  linkedin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const pull = useSpring(useTransform(scrollYProgress, [0, 1], [56, 0]), {
    stiffness: 90,
    damping: 22,
  });
  const scaleIn = useSpring(useTransform(scrollYProgress, [0, 1], [0.88, 1]), {
    stiffness: 90,
    damping: 22,
  });
  const ringScale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);
  const ringOpacity = useTransform(scrollYProgress, [0, 1], [0.15, 0.55]);
  const ring2Scale = useTransform(ringScale, (s) => s * 1.15);
  const ring2Opacity = useTransform(ringOpacity, (o) => o * 0.6);
  const socialY = useTransform(pull, (v) => v * 0.45);
  const contentY = useTransform(pull, (v) => v * 0.35);
  const subtextY = useTransform(pull, (v) => v * 0.25);

  return (
    <section
      ref={sectionRef}
      id="contact"
      data-scroll-section
      className={`section snap-strong ${styles.contact}`}
    >
      <div className={styles.void} aria-hidden="true">
        <motion.div className={styles.ring} style={{ scale: ringScale, opacity: ringOpacity }} />
        <motion.div
          className={`${styles.ring} ${styles.ring2}`}
          style={{ scale: ring2Scale, opacity: ring2Opacity }}
        />
        <div className={styles.horizon} />
      </div>

      <FogLayer>
        <motion.div
          className={`container ${styles.inner}`}
          style={{ scale: scaleIn, y: contentY }}
        >
          <motion.p
            className="section-label"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Contact
          </motion.p>

          <motion.h2
            className={styles.heading}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
          >
            Let&apos;s build something{' '}
            <span className="gradient-text">remarkable.</span>
          </motion.h2>

          <motion.p className={styles.subtext} style={{ y: subtextY }}>
            Open to backend roles, ML infra challenges, and interesting problems.
            <br />
            If you have one, drop me a line.
          </motion.p>

          <motion.a
            href={`mailto:${contact.email}`}
            className={`btn btn-primary ${styles.emailBtn}`}
            data-cursor-hover
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Say Hello
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.a>

          <motion.div className={styles.socials} style={{ y: socialY }}>
            {contact.socials.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`glass ${styles.socialLink}`}
                aria-label={label}
                data-cursor-hover
              >
                {socialIcons[icon]}
              </a>
            ))}
          </motion.div>

          <motion.p className={styles.footer}>
            Built with Next.js · Framer Motion · Obsidian Ether Design System
            <br />
            <span>© {new Date().getFullYear()} Meheret Alemu</span>
          </motion.p>
        </motion.div>
      </FogLayer>
    </section>
  );
}
