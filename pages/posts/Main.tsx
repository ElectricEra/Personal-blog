import styles from './Main.module.css';

const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className={styles['main']}>
      {children}
    </main>
  )
}

export default Main
