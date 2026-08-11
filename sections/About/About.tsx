'use client';

import { motion } from 'framer-motion';
import type { BezierDefinition } from 'framer-motion';
import { about } from '@/lib/data';
import { EtherOrb } from '@/components/EtherOrb/EtherOrb';
import { FogLayer } from '@/components/ScrollTheater/FogLayer';
import styles from './About.module.css';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: EASE },
  }),
};

export function About() {
  return (
    <section id="about" data-scroll-section className={`section snap ${styles.about}`}>
      <EtherOrb size={400} color="spectral" scrollParallax={0.26} className={styles.orb} />

      <FogLayer>
      <div className="container">
        <motion.p
          className="section-label"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          About Me
        </motion.p>

        <div className={styles.grid}>
          {/* Avatar */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className={styles.avatarWrap}
          >
            <div className={`glass ${styles.avatarCard}`}>
              <div className={styles.avatarGradient} />
              <div className={styles.avatarInner}>
                <span className={styles.avatarInitial}>
                  {about.bio[0]}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className={styles.contentCol}>
            <motion.h2
              variants={fadeUp}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              Building systems that <span className="gradient-text">matter.</span>
            </motion.h2>

            <motion.p
              className={styles.bio}
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              {about.bio}
            </motion.p>

            {/* Terminal block */}
            <motion.div
              className={`glass ${styles.terminal}`}
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <div className={styles.terminalHeader}>
                <span className={`${styles.dot} ${styles.red}`} />
                <span className={`${styles.dot} ${styles.yellow}`} />
                <span className={`${styles.dot} ${styles.green}`} />
                <span className={styles.terminalTitle}>whoami</span>
              </div>
              <ul className={styles.terminalBody}>
                {about.terminal.map(({ key, value }) => (
                  <li key={key} className={styles.terminalLine}>
                    <span className={styles.termKey}>{key}</span>
                    <span className={styles.termSep}> → </span>
                    <span className={styles.termVal}>{value}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
      </FogLayer>
    </section>
  );
}
