import type { Color } from "../logic/config";
import styles from "./colors.module.css";

export const colorClassNames: Record<Color, string> = {
  red: styles.red,
  yellow: styles.yellow,
  green: styles.green,
  blue: styles.blue,
  purple: styles.purple,
};
