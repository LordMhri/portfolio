'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { projects, type Project } from '@/lib/data';
import { EtherOrb } from '@/components/EtherOrb/EtherOrb';
import { FogLayer } from '@/components/ScrollTheater/FogLayer';
import { GhostTrail } from '@/components/ScrollTheater/GhostTrail';
import {
  QueueScene,
  ServerScene,
  WaveformScene,
  VaultScene,
} from '@/components/ProjectScenes/scenes';
import styles from './Projects.module.css';

const SCENES: Record<Project['scene'], () => ReactNode> = {
  queue: () => <QueueScene />,
  server: () => <ServerScene />,
  waveform: () => <WaveformScene />,
  vault: () => <VaultScene />,
};

function ProjectShowcase({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-12%' });
  const Scene = SCENES[project.scene];
  const reverse = index % 2 === 1;

  return (
    <GhostTrail className={styles.showcaseWrap}>
      <motion.article
        ref={ref}
        className={`${styles.showcase} ${reverse ? styles.reverse : ''}`}
        initial={{ opacity: 0, y: 48 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.85, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.visual} data-cursor-hover>
          <Scene />
        </div>

        <div className={styles.copy}>
          <div className={styles.meta}>
            <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
            <div className={styles.links}>
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.iconLink}
                  data-cursor-hover
                  aria-label="GitHub"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.iconLink}
                  data-cursor-hover
                  aria-label="Live demo"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.desc}>{project.description}</p>
          <div className={styles.stack}>
            {project.stack.map((tech) => (
              <span key={tech} className={styles.techTag}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    </GhostTrail>
  );
}

export function Projects() {
  return (
    <section
      id="projects"
      data-scroll-section
      className={`section snap-strong ${styles.projects}`}
    >
      <EtherOrb size={500} color="ether" scrollParallax={0.3} className={styles.orb} />

      <FogLayer>
        <div className="container">
          <motion.p
            className="section-label"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Selected Work
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Things I&apos;ve <span className="gradient-text">built.</span>
          </motion.h2>

          <div className={styles.list}>
            {projects.map((project, i) => (
              <ProjectShowcase key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </FogLayer>
    </section>
  );
}
