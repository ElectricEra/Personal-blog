import React from 'react';
import Link from 'next/link';

import styles from './Box.module.css';

type BoxProps = {
  linkUrl: string,
  children: React.ReactNode,
  withImage?: boolean,
  image?: React.ReactNode,
};

export const Box = ({ children, linkUrl}: BoxProps) => {
  return (
    <Link href={linkUrl} className={styles['link']}>
      <div className={styles['box']}>
        {children}
      </div>
    </Link>
  )
};
