'use client';

import { motion } from 'framer-motion';
import type { BezierDefinition } from 'framer-motion';
import { EtherOrb } from '@/components/EtherOrb/EtherOrb';
import { FogLayer } from '@/components/ScrollTheater/FogLayer';
import { hero } from '@/lib/data';
import styles from './Hero.module.css';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

export function Hero() {
  return (
    <section
      id="hero"
      data-scroll-section
      className={`section-full snap-strong ${styles.hero}`}
    >
      <EtherOrb
        size={700}
        color="ether"
        reactToMouse
        parallaxSpeed={0.025}
        scrollParallax={0.28}
        className={styles.orb1}
      />
      <EtherOrb
        size={400}
        color="spectral"
        reactToMouse
        parallaxSpeed={0.015}
        scrollParallax={0.22}
        className={styles.orb2}
      />

      <FogLayer>
        <div className={`container ${styles.content}`}>
          <motion.div
            className={`section-label ${styles.label}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            Available for work
          </motion.div>

          <motion.h1
            className={styles.heading}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: EASE }}
          >
            {hero.name}
          </motion.h1>

          <motion.p
            className={styles.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            className={styles.ctas}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
          >
            <a href={hero.cta.href} className="btn btn-primary" data-cursor-hover>
              {hero.cta.label}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </a>
            <a href={hero.contact.href} className="btn btn-ghost" data-cursor-hover>
              {hero.contact.label}
            </a>
          </motion.div>
        </div>

        <motion.div
          className={`scroll-indicator ${styles.scrollIndicator}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          Scroll
        </motion.div>
      </FogLayer>
    </section>
  );
}
