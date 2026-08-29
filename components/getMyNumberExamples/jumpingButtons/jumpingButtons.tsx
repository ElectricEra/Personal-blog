import React, { useState, useEffect } from 'react';

import styles from './jumpingButtons.module.css';

type JumpingButtonsProps = {
  numberToDial?: string,
  phoneCheck: (a: string) => void,
};

type ButtonPosition = {
  left: number;
  top: number;
  zIndex: number;
  transitionDelay: number;
};

const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'No', 'Yes'];
const refreshTime = 800;

const createRandomPosition = (): ButtonPosition => ({
  left: Math.random() * 270,
  top: Math.random() * 270,
  zIndex: Math.floor(Math.random() * 1000),
  transitionDelay: Math.floor(Math.random() * 300),
});

const createInitialPositions = () =>
  Object.fromEntries(buttons.map((button) => [button.toString(), createRandomPosition()]));

export const JumpingButtons = ({ numberToDial, phoneCheck }: JumpingButtonsProps) => {
  const [number, setNumber] = useState('');
  const [positions, setPositions] = useState(createInitialPositions);

  useEffect(() => {
    const id = setInterval(() => {
      setPositions(createInitialPositions());
    }, refreshTime);

    return () => clearInterval(id);
  }, []);

  return (
    <>
      <h1>Jumping Buttons</h1>
      <div>Your number is: {number}</div>
      <div className={styles['area']}>
        {buttons.map((button) => {
          const value = button.toString();
          const position = positions[value];

          return (
            <button
              key={value}
              className={styles['jumping-number']}
              style={{
                left: position.left,
                top: position.top,
                zIndex: position.zIndex,
                transition: `${refreshTime}ms`,
                transitionDelay: `${position.transitionDelay}ms`,
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
          );
        })}
      </div>
    </>
  );
};
