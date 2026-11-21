import type { ComponentProps } from "react";

import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";
import { Popover } from "@/components/Popover/Popover";

import styles from "./GameControls.module.css";

type ConfirmPopoverProps = {
  trigger: ComponentProps<typeof Popover>["trigger"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
};

export const ConfirmPopover = ({
  trigger,
  open,
  onOpenChange,
  prompt,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: ConfirmPopoverProps) => (
  <Popover
    className={styles.anchor}
    panelClassName={styles.confirmPanel}
    open={open}
    onOpenChange={onOpenChange}
    label={prompt}
    trigger={trigger}
  >
    <p className={styles.prompt}>{prompt}</p>
    <PhysicalButton onClick={onConfirm}>{confirmLabel}</PhysicalButton>
    <PhysicalButton variant="secondary" onClick={() => onOpenChange(false)}>
      {cancelLabel}
    </PhysicalButton>
  </Popover>
);
