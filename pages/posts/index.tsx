import Link from 'next/link';

import Main from './Main';
import { getPostsData } from '../../utils';

import styles from './index.module.css';

type Post = {
  url: string,
  title: string,
  date: string,
  spoiler: string,
}

const Post = ({ posts }: { posts: Post[]}) => {

  return (
    <Main>
      <Link href='/' className={styles['link']}>{'<-'} Повернутись до профілю</Link>
      <p className={styles['my-articles']}>Мої статті</p>
      {posts.map(post => {
        return (
        <div key={post.url} className={styles['article']}>
          <p className={styles['article-title']}>{post.title}</p>
          <p className={styles['article-spoiler']}>{post.spoiler}</p>
          <Link href={`/posts/${post.url}`} className={styles['link']}>
            Читати {'->'}
          </Link>
        </div>)
      })}
    </Main>
  )
}

export default Post

export async function getStaticProps() {
  const posts = await getPostsData();
  const postsMetadata = posts.map(({ metadata }) => metadata);

  return {
    props: {
      posts: postsMetadata
    }
  }
}
