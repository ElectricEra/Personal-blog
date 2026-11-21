import { useEffect, useRef, useState } from "react";

/**
 * Scrolls an element to the top of the window after the next render.
 * Calling `scrollIntoView` in the same handler that mounts the element is
 * fine: the scroll runs once the element exists, and only for that request.
 */
export const useScrollIntoView = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [request, setRequest] = useState(0);

  useEffect(() => {
    if (request === 0 || !ref.current) {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    ref.current.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [request]);

  const scrollIntoView = () => setRequest((current) => current + 1);

  return { ref, scrollIntoView };
};
