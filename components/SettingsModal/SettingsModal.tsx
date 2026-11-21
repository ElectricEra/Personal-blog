import type { ReactNode } from "react";

import { Modal } from "@/components/Modal/Modal";

import styles from "./SettingsModal.module.css";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
};

export const SettingsModal = ({
  open,
  onClose,
  title,
  closeLabel,
  children,
}: SettingsModalProps) => (
  <Modal open={open} onClose={onClose} title={title} closeLabel={closeLabel}>
    {children}
  </Modal>
);

type SettingsCheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const SettingsCheckbox = ({
  label,
  checked,
  onChange,
}: SettingsCheckboxProps) => (
  <label className={styles.checkbox}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
    {label}
  </label>
);
