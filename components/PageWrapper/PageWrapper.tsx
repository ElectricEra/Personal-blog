import styles from './PageWrapper.module.css';

type Options = {
  fullScreen?: boolean,
  additionalStyles?: string,
  children: React.ReactNode,
}

const PageWrapper = ({ fullScreen = false, additionalStyles = '', children }: Options) => {
  return (
    <div className={styles['page-wrapper']}>
      <div className={`${styles['page']} ${additionalStyles} ${fullScreen ? styles['page-full-screen'] : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default PageWrapper
