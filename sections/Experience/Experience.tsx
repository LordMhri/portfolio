'use client';

import { motion } from 'framer-motion';
import type { BezierDefinition } from 'framer-motion';
import { experience } from '@/lib/data';
import { FogLayer } from '@/components/ScrollTheater/FogLayer';
import styles from './Experience.module.css';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

export function Experience() {
  return (
    <section id="experience" data-scroll-section className={`section snap ${styles.experience}`}>
      <FogLayer>
      <div className="container">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Experience
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Where I&apos;ve <span className="gradient-text">worked.</span>
        </motion.h2>

        <div className={styles.timeline}>
          {experience.map((exp, i) => (
            <motion.div
              key={exp.id}
              className={styles.item}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: i * 0.12, ease: EASE }}
            >
              {/* Timeline node */}
              <div className={styles.node}>
                <div className={styles.dot} />
                {i < experience.length - 1 && <div className={styles.line} />}
              </div>

              {/* Card */}
              <article className={`glass ${styles.card}`}>
                <div className={styles.meta}>
                  <span className={styles.period}>{exp.period}</span>
                </div>
                <h3 className={styles.role}>{exp.role}</h3>
                <p className={styles.company}>{exp.company}</p>
                <p className={styles.desc}>{exp.description}</p>
                <div className={styles.techList}>
                  {exp.tech.map((t) => (
                    <span key={t} className="chip" data-cursor-hover>{t}</span>
                  ))}
                </div>
              </article>
            </motion.div>
          ))}
        </div>
      </div>
      </FogLayer>
    </section>
  );
}
