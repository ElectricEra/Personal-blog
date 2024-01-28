import PageWrapper from '@/components/PageWrapper/PageWrapper';
import { BackButton } from '@/components/BackButton/BackButton';
import { Box } from '@/components/Box/Box';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';

import { getPostsData } from '@/utils';

import styles from './index.module.css';

type Post = {
  url: string,
  title: string,
  date: string,
  spoiler: string,
}

const Post = ({ posts }: { posts: Post[]}) => {
  return (
    <PageWrapper fullScreen>
      <BackButton href='/' text={'Назад'} />
      <SectionHeader text={'Статті'}/>
      {posts.map(post => {
        return (
          <Box key={post.url} linkUrl={`/posts/${post.url}`}>
            <p className={styles['article-title']}>{post.title}</p>
            <p className={styles['article-spoiler']}>{post.spoiler}</p>
          </Box>
        );
      })}
    </PageWrapper>
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
