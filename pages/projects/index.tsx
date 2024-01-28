import Link from 'next/link';

import PageWrapper from '@/components/PageWrapper/PageWrapper';
import { BackButton } from '@/components/BackButton/BackButton';
import { Box } from '@/components/Box/Box';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';

import styles from './index.module.css';

const Projects = () => {

  return (
    <PageWrapper fullScreen>
      <BackButton href='/' text={'Назад'} />
      <SectionHeader text={'Проекти'}/>
      <Box linkUrl={'/projects/getmynumber'}>
        <p>Я вирішив і собі зробити невеличеий челендж і поекспериментувати. До вашої уваги... НАЙГІРШІ ІНПУТИ</p>
      </Box>
    </PageWrapper>
  )
}

export default Projects
