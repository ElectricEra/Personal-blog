import Link from 'next/link';
import Image from 'next/image';
import { FaTelegram } from "react-icons/fa";

import PageWrapper from '@/components/PageWrapper/PageWrapper';

import styles from './index.module.css';

export default function Cover() {
  return (
    <PageWrapper additionalStyles={styles['cover']}>
      <div className={styles['image-wrapper']}>
        {/* <Image src="/cropped.jpg" alt="me" width="200" height="200" /> */}
      </div>
      <p className={styles['text']}>Привіт! Це <b>My Games Corner</b>.</p>
      <p className={styles['text']}>Якщо придивитись, наше життя, має дуже багато різних ігор в надзвичайно різних формах. Головне знайти їх.</p>
      <p className={styles['text']}>Я тут хочу ділитись своїми спостереженнями і знахідкми, сподіваюсь ти знайдеш тут щось цікаве саме для тебе.</p>
      <div className={styles['social-media-links']}>
        {/* <FaGithub size={'24px'} onClick={e => window.open('https://github.com/ElectricEra', '_blank')} /> */}
        {/* <FaLinkedin size={'24px'} onClick={e => window.open('https://www.linkedin.com/in/yuriy-pankiv/', '_blank')} /> */}
        <FaTelegram size={'24px'} onClick={e => window.open('https://t.me/my_games_corner', '_blank')} />
      </div>
      <div className={styles['article-links']}>
        {/* <Link href='/posts'><b>Статті</b></Link>
        &nbsp;•&nbsp; */}
        <Link href='/projects'><b>Проекти</b></Link>
      </div>
    </PageWrapper>
  )
}
