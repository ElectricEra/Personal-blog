import { useState, useEffect } from 'react';
import Link from 'next/link';

import PageWrapper from '@/components/PageWrapper/PageWrapper';
import { BackButton } from '@/components/BackButton/BackButton';
import { JumpingButtons } from '@/components/getMyNumberExamples/jumpingButtons/jumpingButtons';
import { InfiniteSelect } from '@/components/getMyNumberExamples/infiniteSelect/infiniteSelect';

import styles from './index.module.css';

const minigameOptions = [JumpingButtons, InfiniteSelect];

const GetMyNumber = () => {
  const [number, setNumber] = useState('');
  const [selectedGame, setSelectedGame] = useState(minigameOptions[0].name);

  useEffect(() => {
    setNumber(generatePhone());
  }, []);

  const phoneCheck = (number: string, value: string) => {
    if (number === value) {
      alert('Beep... Beep... Hello, it\'s me! (Victory!)');
    } else {
      alert('Oops!');
    }
  }

  const generatePhone = () => {
    const phone = [];
    for (let i = 0; i < 10; i++) {
      phone.push(Math.floor(Math.random() * 10));
    }
    return phone.join('');
  }

  const Minigame = minigameOptions.find(game => game.name === selectedGame) as typeof minigameOptions[0];

  return (
    <PageWrapper fullScreen>
      <BackButton href='/projects' text={'Назад'} />
      <p>Одного разу, переглядаючи різні меми, натрапив на цікаву річ. Один з розробників запустив ось цей <a href='https://twitter.com/stelian/status/720913927639560194' rel="noreferrer" target='_blank'>тред.</a></p>
      <br />
      <p>Це був реальний код, який намагався отримати телефонний номер користувача</p>
      <br />
      <p>Але найцікавіше почалось у відповідях... Побачивши цей жахливий спосіб ввести свій номер телефону люди почали пропонувати свої, ще (як би це гарно сказати) оригінальніші способи.</p>
      <br />
      <p>Я вирішив і собі зробити невеличеий челендж і поекспериментувати. До вашої уваги... МОЯ ТВОРЧІСТЬ</p>
      <br />
      <p>В мене була лише одна критерія: Номер має бути реально ввести за відносно невеликий час. Все інше не важливо</p>
      <h1>Набереш мене? - {number}</h1>
      <select onChange={(e) => setSelectedGame(e.target.value)}>
        {minigameOptions.map(game => {
          return <option key={game.name} value={game.name}>{game.name}</option>
        })}
      </select>
      <div className={styles['experiment-area-wrapper']}>
        <div>
          <Minigame numberToDial={number} phoneCheck={value => phoneCheck(number, value)}/>
        </div>
      </div>
    </PageWrapper>
  )
}

export default GetMyNumber
