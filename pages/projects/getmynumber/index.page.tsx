import { useState } from "react";

import { ExternalLink } from "@/components/ExternalLink/ExternalLink";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { Stack } from "@/components/Stack/Stack";
import { Text } from "@/components/Text/Text";

import { InfiniteSelect } from "./components/infiniteSelect/infiniteSelect";
import { JumpingButtons } from "./components/jumpingButtons/jumpingButtons";
import styles from "./index.module.css";

const minigameOptions = [JumpingButtons, InfiniteSelect];

const generatePhone = () => {
  const phone = [];
  for (let i = 0; i < 10; i++) {
    phone.push(Math.floor(Math.random() * 10));
  }
  return phone.join("");
};

const GetMyNumber = () => {
  const [number] = useState(generatePhone);
  const [selectedGame, setSelectedGame] = useState(minigameOptions[0].name);

  const phoneCheck = (number: string, value: string) => {
    if (number === value) {
      alert("Beep... Beep... Hello, it's me! (Victory!)");
    } else {
      alert("Oops!");
    }
  };

  const Minigame = minigameOptions.find(
    (game) => game.name === selectedGame,
  ) as (typeof minigameOptions)[0];

  return (
    <PageWrapper fullScreen>
      <Stack gap={16}>
        <Text>
          Одного разу, переглядаючи різні меми, натрапив на цікаву річ. Один з
          розробників запустив ось цей{" "}
          <ExternalLink href="https://twitter.com/stelian/status/720913927639560194">
            тред.
          </ExternalLink>
        </Text>
        <Text>
          Це був реальний код, який намагався отримати телефонний номер
          користувача
        </Text>
        <Text>
          Але найцікавіше почалось у відповідях... Побачивши цей жахливий спосіб
          ввести свій номер телефону люди почали пропонувати свої, ще (як би це
          гарно сказати) оригінальніші способи.
        </Text>
        <Text>
          Я вирішив і собі зробити невеличеий челендж і поекспериментувати. До
          вашої уваги... МОЯ ТВОРЧІСТЬ
        </Text>
        <Text>
          В мене була лише одна критерія: Номер має бути реально ввести за
          відносно невеликий час. Все інше не важливо
        </Text>
      </Stack>
      <h1>Набереш мене? - {number}</h1>
      <select onChange={(e) => setSelectedGame(e.target.value)}>
        {minigameOptions.map((game) => {
          return (
            <option key={game.name} value={game.name}>
              {game.name}
            </option>
          );
        })}
      </select>
      <div className={styles["experiment-area-wrapper"]}>
        <div>
          <Minigame
            numberToDial={number}
            phoneCheck={(value) => phoneCheck(number, value)}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default GetMyNumber;
