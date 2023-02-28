import fsPromises from 'fs/promises';
import path from 'path';

type Post = {
  url: string,
  title: string,
  date: string,
  spoiler: string,
}

export const getPostsData = async () => {
  const getDirFolders = await fsPromises.readdir(path.join(process.cwd(), './blogPosts'));
  const dirPosts = getDirFolders.map(async (folder) => {
    const filePath = path.join(process.cwd(), `./blogPosts/${folder}/markdown.md`);

    return fsPromises.readFile(filePath, 'utf-8');
  });

  const posts = await Promise.all(dirPosts);
  const postsData = posts.map(post => {
    const markdownMetadata = post.split('---')[1];

    console.log('--->', markdownMetadata,'--\n--' , markdownMetadata.trim(), '---<');
    const parsedMetadata = markdownMetadata
      .trim()
      // .replaceAll('\r\n', '\n')
      .split('\n')
      .reduce((acc, el) => {
        const [key, value] = el.split(':');

        return { ...acc, [key]: value.trim() };
      }, {});

    return { metadata: parsedMetadata as Post, data: post.split('---')[2] };
  });

  return postsData;
}
