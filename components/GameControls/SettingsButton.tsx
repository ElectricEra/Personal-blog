import { FaGear } from "react-icons/fa6";

import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";

import styles from "./GameControls.module.css";

type SettingsButtonProps = {
  label: string;
  expanded: boolean;
  onClick: () => void;
};

export const SettingsButton = ({
  label,
  expanded,
  onClick,
}: SettingsButtonProps) => (
  <PhysicalButton
    variant="secondary"
    className={styles.iconButton}
    aria-label={label}
    aria-haspopup="dialog"
    aria-expanded={expanded}
    onClick={onClick}
  >
    <FaGear aria-hidden="true" />
    <span className={styles.settingsText}>{label}</span>
  </PhysicalButton>
);
