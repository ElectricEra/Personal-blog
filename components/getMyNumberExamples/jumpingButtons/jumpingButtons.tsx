import React, { useState, useEffect } from 'react';

import styles from './jumpingButtons.module.css';

type JumpingButtonsProps = {
  numberToDial?: string,
  phoneCheck: (a: string) => void,
};

export const JumpingButtons = ({ numberToDial, phoneCheck }: JumpingButtonsProps) => {
  const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'No', 'Yes'];
  const refreshTime = 800;

  const [number, setNumber] = useState('');
  const [_, setCoordinates] = useState(Symbol());

  useEffect(() => {
    const id = setInterval(() => {
      setCoordinates(Symbol());
    }, refreshTime);

    return () => clearInterval(id);
  }, [])

  const createJumpingButton = (value: string) => {
    return (
      <button
        key={value}
        className={styles['jumping-number']}
        style={{
          left: Math.random() * 270,
          top: Math.random() * 270,
          zIndex: Math.floor(Math.random() * 1000),
          transition: `${refreshTime}ms`,
          transitionDelay: `${Math.floor(Math.random() * 300)}ms`,
          transitionProperty: 'left, top',
        }}
        onClick={() => {
          switch (value) {
            case 'No':
              setNumber('');
              break;
            case 'Yes':
              phoneCheck(value);
              break;
            default:
              setNumber(`${number}${value}`);
              break;
          }
        }}
      >
        {value}
      </button>
    )
  }

  return (
    <>
      <h1>Jumping Buttons</h1>
      <div>Your number is: {number}</div>
      <div className={styles['area']}>
        {buttons.map(button => createJumpingButton(button.toString()))}
      </div>
    </>
  )
}