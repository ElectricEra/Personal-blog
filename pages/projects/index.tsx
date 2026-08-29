import Link from 'next/link';

import PageWrapper from '@/components/PageWrapper/PageWrapper';
import { BackButton } from '@/components/BackButton/BackButton';
import { Box } from '@/components/Box/Box';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';

import styles from './index.module.css';

import { Card } from '@/components/projects/getmynumber/card';

const Projects = () => {

  return (
    <PageWrapper fullScreen>
      <BackButton href='/' text={'Назад'} />
      <SectionHeader text={'Проекти'}/>
      <Card />
    </PageWrapper>
  )
}

export default Projects
