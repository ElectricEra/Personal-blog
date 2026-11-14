import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

import styles from "./BackButton.module.css";

type BackButtonProps = {
  href: string;
  text: string;
  className?: string;
};

export const BackButton = ({ href, text, className = "" }: BackButtonProps) => {
  return (
    <Link href={href} className={`${styles["link"]} ${className}`}>
      <HiArrowLeft aria-hidden className={styles["icon"]} />
      {text}
    </Link>
  );
};
