import styles from './templateConfig.module.css';

export const ctemplateConfig = {
  h1: ({node, ...props}: any) => <h1 className={styles['h1']} {...props} />,
  h2: ({node, ...props}: any) => <h2 className={styles['h2']} {...props} />,
  h3: ({node, ...props}: any) => <h3 className={styles['h3']} {...props} />,
  ul: ({node, ...props}: any) => <ul className={styles['ul']} {...props} />,
  ol: ({node, ...props}: any) => <ol className={styles['ol']} {...props} />,
  p: ({node, ...props}: any) => <p className={styles['p']} {...props} />,
};
