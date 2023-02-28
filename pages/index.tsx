import Link from 'next/link';
import Image from 'next/image';
import { FaGithub, FaLinkedin } from "react-icons/fa";

import styles from './index.module.css';

export default function Cover() {
  return (
    <div className={styles['cover-wrapper']}>
      <div className={styles['cover']}>
        <div className={styles['image-wrapper']}>
          <Image src="/cropped.jpg" alt="me" width="200" height="200" />
        </div>
        <div className={styles['text-wrapper']}>
          <p className={styles['text']}>Привіт! Мене звати <b>Юрій Паньків</b>, я <b>JS FullStack</b> розробник, з досвідом роботи із 2016 року.</p>
          <p className={styles['text']}>За цей час назбирав багато різного досвіду, тут буду ділитись своїми знаннями на різні теми. Сподіваюсь ти знайдеш тут щось цікаве саме для тебе.</p>
        </div>
        <div className={styles['social-media-links']}>
          <FaGithub size={'24px'} onClick={e => window.open('https://github.com/ElectricEra', '_blank')} />
          <FaLinkedin size={'24px'} onClick={e => window.open('https://www.linkedin.com/in/yuriy-pankiv/', '_blank')} />
        </div>
        <div className={styles['article-links']}>
          <Link href='/posts'><b>Мої статті</b></Link>
        </div>
      </div>
    </div>
  )
}
