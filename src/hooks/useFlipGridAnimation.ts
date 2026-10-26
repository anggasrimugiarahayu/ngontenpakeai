"use client";

import { useLayoutEffect, useEffect, useRef } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface FlipOptions {
  duration?: number;
  easing?: string;
}

export function useFlipGridAnimation<T extends { id: string }>(
  items: T[],
  options: FlipOptions = {}
) {
  const { duration = 380, easing = "cubic-bezier(0.2, 0, 0, 1)" } = options;
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const prevPositions = useRef<Map<string, DOMRect>>(new Map());

  const registerCard = (id: string) => (el: HTMLElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  };

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const currentPositions = new Map<string, DOMRect>();

    // 1. Measure all current positions in DOM (Last)
    cardRefs.current.forEach((el, id) => {
      currentPositions.set(id, el.getBoundingClientRect());
    });

    // 2. Identify elements that shifted position
    const elementsToAnimate: {
      el: HTMLElement;
      deltaX: number;
      deltaY: number;
    }[] = [];

    currentPositions.forEach((currentRect, id) => {
      const prevRect = prevPositions.current.get(id);
      const el = cardRefs.current.get(id);

      if (prevRect && el) {
        const deltaX = prevRect.left - currentRect.left;
        const deltaY = prevRect.top - currentRect.top;

        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
          elementsToAnimate.push({ el, deltaX, deltaY });
        }
      }
    });

    if (elementsToAnimate.length > 0) {
      // INVERT: Immediately move elements to their previous positions
      elementsToAnimate.forEach(({ el, deltaX, deltaY }) => {
        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
        el.style.transition = "none";
        el.style.zIndex = "20";
        el.style.willChange = "transform";
      });

      // Force a reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      document.body.offsetHeight;

      // PLAY: Animate to natural (0, 0) position
      requestAnimationFrame(() => {
        elementsToAnimate.forEach(({ el }) => {
          el.style.transition = `transform ${duration}ms ${easing}`;
          el.style.transform = "translate3d(0, 0, 0)";

          const onTransitionEnd = () => {
            el.style.transition = "";
            el.style.transform = "";
            el.style.zIndex = "";
            el.style.willChange = "";
            el.removeEventListener("transitionend", onTransitionEnd);
          };

          el.addEventListener("transitionend", onTransitionEnd, { once: true });
        });
      });
    }

    // Save positions for the next render
    prevPositions.current = currentPositions;
  }, [items, duration, easing]);

  return { registerCard };
}
