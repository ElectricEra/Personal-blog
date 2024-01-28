import Link from 'next/link';

import styles from './BackButton.module.css';

type BackButtonProps = {
  href: string,
  text: string,
};

export const BackButton = ({ href, text }: BackButtonProps) => {
  return (<Link href={href} className={styles['link']}>{'<-'} {text}</Link>)
};
