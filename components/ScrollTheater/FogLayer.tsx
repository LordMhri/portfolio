'use client';

import type { ReactNode } from 'react';
import styles from './FogLayer.module.css';

/** Applies scroll-driven fog styles from ScrollTheater onto section content. */
export function FogLayer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.layer} ${className}`.trim()}>{children}</div>;
}
