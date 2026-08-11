'use client';

import { motion } from 'framer-motion';
import type { BezierDefinition } from 'framer-motion';
import { skills } from '@/lib/data';
import { FogLayer } from '@/components/ScrollTheater/FogLayer';
import styles from './Skills.module.css';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE } },
};

export function Skills() {
  return (
    <section id="skills" data-scroll-section className={`section snap ${styles.skills}`}>
      <FogLayer>
        <div className="container">
          <motion.p
            className="section-label"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Skills & Tech Stack
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Tools of the <span className="gradient-text">trade.</span>
          </motion.h2>

          <div className={styles.groups}>
            {Object.entries(skills).map(([group, items], groupIndex) => (
              <motion.div
                key={group}
                className={`glass ${styles.group}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: groupIndex * 0.1 }}
              >
                <h3 className={styles.groupTitle}>{group}</h3>
                <motion.div
                  className={styles.chips}
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  {items.map((skill) => (
                    <motion.span key={skill} className="chip" variants={itemVariants} data-cursor-hover>
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </FogLayer>
    </section>
  );
}
