import PageWrapper from '@/components/PageWrapper/PageWrapper';
import { BackButton } from '@/components/BackButton/BackButton';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';

// import { data, data2 } from '@/data/experience/data';

import styles from './index.module.css';


const Line = () => (
  <div className={styles['lines']}>
    <div className={styles['dot']}></div>
    <div className={styles['line']}></div>
  </div>
);

const Name = ({ name }: { name: string }) => (
  <div className={styles['name']}>
    <div className={styles['title']}>
      Проект
    </div>
    {name}
  </div>
);

const Company = ({ company }: { company: string }) => (
  <div className={styles['company']}>
    <div className={styles['title']}>
      Компанія
    </div>
    {company}
  </div>
);

const Description = ({ description }: { description: string[] }) => (
  <div className={styles['description']}>
    {description.map((descriptionLine) => (
      <div key={descriptionLine}>{descriptionLine}</div>
    ))}
  </div>
);

const Date = ({ dateStart, dateEnd }: { dateStart: string, dateEnd: string }) => (
  <div className={styles['date']}>
    <div className={styles['title']}>
      Дата
    </div>
    {dateStart}<br />{dateEnd}
  </div>
);

const Technologies = ({ technologies }: { technologies: string[] }) => (
  <div className={styles['technologies']}>
    {technologies.map((technology) => (
      <Technology key={technology} name={technology} />
    ))}
  </div>
);

const Technology = ({ name }: { name: string }) => {
  return (
    <div className={styles['technology']}>
      {name}
    </div>
  )
};

export default function Experience() {
  // TODO: Add proper data
  const data2: any = [];
  // END OF TODO

  return (
    <PageWrapper fullScreen>
      <BackButton href='/' text={'Назад'} />
      <SectionHeader text={'Досвід'}/>
      {data2.map((project: any) => (
        <div key={project.company} className={styles['project-grid']}>
          <Line />
          <div className={styles['project-col1']}>
            <Company company={project.company}/>
            <Date dateStart={project.dateStart} dateEnd={project.dateEnd} />
          </div>
          <div className={styles['project-col2']}>
            {project.details.map((detail: any) => (
              <div key={detail.title} className={styles['project-description']}>
                <div className={styles['title']}>{detail.title}</div>
                <Description description={detail.description} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </PageWrapper>
  )
}
