import ReactMarkdown from 'react-markdown';
// @ts-ignore
import MailchimpSubscribe from 'react-mailchimp-subscribe';

import PageWrapper from '@/components/PageWrapper/PageWrapper';
import { BackButton } from '@/components/BackButton/BackButton';
import { getPostsData } from '@/utils';

import styles from './[id].module.css';

type Post = {
  url: string,
  title: string,
  date: string,
  spoiler: string,
}

const Post = ({ post }: { post: { metadata: Post, data: string } }) => {
  const url = "https://gmail.us8.list-manage.com/subscribe/post?u=b784380e684164fe98825bd21&amp;id=14c232fff1&amp;f_id=00ba6be0f0";

  return (
    <PageWrapper fullScreen>
      <div className={styles['article']}>
        <BackButton href='/posts' text={'Назад'} />
        <p className={styles['date']}>{post.metadata.date}</p>
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 style={{ color: '#0c1421', paddingTop: '20px', textAlign: 'center' }} {...props} />,
            h2: ({node, ...props}) => <h2 style={{ color: '#0c1421', paddingTop: '32px' }} {...props} />,
            h3: ({node, ...props}) => <h3 style={{ color: '#0c1421', paddingTop: '20px' }} {...props} />,
            p: ({node, ...props}) => <p style={{ color: '#0c1421', textAlign: 'justify', marginTop: '32px', lineHeight: '28px', tabSize: '10px' }} {...props} />,
            ul: ({node, ...props}) => <ul style={{ color: '#0c1421', textAlign: 'justify', marginLeft: '32px', marginTop: '12px' }} {...props} />,
            ol: ({node, ...props}) => <ol style={{ color: '#0c1421', textAlign: 'justify', marginLeft: '32px', marginTop: '12px' }} {...props} />,
            li: ({node, ...props}) => <li style={{ color: '#0c1421', textAlign: 'justify', marginTop: '8px', lineHeight: '28px', }} {...props} />,
            hr: ({node, ...props}) => <hr style={{ color: '#0c1421', marginTop: '24px' }} {...props} />,
          }}
        >
          {post.data}
        </ReactMarkdown>
        <div className={styles['end']}></div>
        <div className={styles['thanks']}>
          <p>Якщо тобі сподобалось, то буду радий якщо ти підпишешся на мою розсилку, де я планую ділитись з тобою новими статтями</p>
          <MailchimpSubscribe url={url}/>
        </div>
      </div>
    </PageWrapper>
  )
}

export default Post

export async function getStaticPaths() {
  const posts = await getPostsData();

  return {
    paths: posts.map((post) => ({ params: { id: post.metadata.url } })),
    fallback: false,
  }
}

export async function getStaticProps(context : { params: { id: string } }) {
  const posts = await getPostsData();
  const currentPost = posts.find(({ metadata }) => metadata.url === context.params.id);

  return {
    props: {
      post: currentPost
    }
  }
}
