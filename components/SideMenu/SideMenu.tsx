import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { cx } from "@/utils/cx";
import { useTranslation } from "@/utils/i18n";

import styles from "./SideMenu.module.css";
import { type SideMenuTranslation, translations } from "./translations";

const SECTIONS: Array<{
  id: keyof SideMenuTranslation["sections"];
  links: Array<{ href: string; id: keyof SideMenuTranslation["pages"] }>;
}> = [
  {
    id: "games",
    links: [
      { href: "/projects/sudoku", id: "sudoku" },
      { href: "/projects/memory-path-game", id: "memoryPath" },
      { href: "/projects/scale-game", id: "scale" },
      { href: "/projects/hidden-code-game", id: "hiddenCode" },
    ],
  },
  {
    id: "projects",
    links: [{ href: "/projects/playing-cards", id: "playingCards" }],
  },
];

const MENU_ID = "side-menu";

export const SideMenu = () => {
  const copy = useTranslation(translations);
  const { pathname } = useRouter();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the drawer after every navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const siteLink = (
    <Link
      href="/"
      className={styles.site}
      aria-current={pathname === "/" ? "page" : undefined}
    >
      {copy.site}
    </Link>
  );

  return (
    <>
      <header className={styles.mobileBar}>
        <button
          ref={toggleRef}
          type="button"
          className={styles.iconButton}
          aria-label={copy.openMenu}
          aria-controls={MENU_ID}
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <HiMenu aria-hidden />
        </button>
        {siteLink}
      </header>
      <button
        type="button"
        className={cx(styles.backdrop, open && styles.backdropVisible)}
        aria-label={copy.closeMenu}
        tabIndex={-1}
        onClick={close}
      />
      <nav
        id={MENU_ID}
        className={cx(styles.menu, open && styles.open)}
        aria-label={copy.label}
      >
        <div className={styles.header}>
          {siteLink}
          <button
            ref={closeRef}
            type="button"
            className={cx(styles.iconButton, styles.closeButton)}
            aria-label={copy.closeMenu}
            onClick={close}
          >
            <HiX aria-hidden />
          </button>
        </div>
        <div className={styles.sections}>
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`side-menu-${section.id}`}
            >
              <h2 id={`side-menu-${section.id}`} className={styles.title}>
                {copy.sections[section.id]}
              </h2>
              <ul className={styles.list}>
                {section.links.map(({ href, id }) => {
                  const active = pathname === href;
                  return (
                    <li key={id}>
                      <Link
                        href={href}
                        className={cx(styles.link, active && styles.active)}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                      >
                        {copy.pages[id]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <LanguageSwitcher />
      </nav>
    </>
  );
};
