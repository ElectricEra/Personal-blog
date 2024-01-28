import styles from './SectionHeader.module.css';

type SectionHeaderProps = {
  text: string,
};

export const SectionHeader = ({ text }: SectionHeaderProps) => {
  return (<p className={styles['section-header']}>{text}</p>)
};
