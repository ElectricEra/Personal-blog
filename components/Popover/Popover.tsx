import {
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";

import styles from "./Popover.module.css";

type TriggerProps = {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-haspopup"?: "dialog";
};

type PopoverProps = {
  trigger: ReactElement<TriggerProps>;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  className?: string;
  panelClassName?: string;
};

export const Popover = ({
  trigger,
  children,
  open,
  onOpenChange,
  label,
  className = "",
  panelClassName = "",
}: PopoverProps) => {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement;
    panelRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [open, onOpenChange]);

  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger, {
        "aria-expanded": open,
        "aria-controls": open ? panelId : undefined,
        "aria-haspopup": "dialog",
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          trigger.props.onClick?.(event);
          if (!event.defaultPrevented) {
            onOpenChange(!open);
          }
        },
      })
    : trigger;

  return (
    <div className={`${styles.root} ${className}`} ref={rootRef}>
      {triggerNode}
      {open ? (
        <div
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          className={`${styles.panel} ${panelClassName}`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};
