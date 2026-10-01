import { useEffect, useState, useRef, RefObject } from 'react';

export interface ParallaxOptions {
  speed?: number; // Slower or faster relative to scroll (e.g. 0.15 = 15% offset)
  scaleStart?: number; // Starting zoom on entry (e.g. 1.06)
  scaleEnd?: number; // Settle zoom (e.g. 1.0)
  clampPx?: number; // Maximum translation in px
  direction?: 'vertical' | 'horizontal';
  disabled?: boolean;
}

export interface ParallaxValues {
  translateY: number;
  scale: number;
  opacity: number;
  progress: number;
}

/**
 * High-performance, hardware-accelerated parallax hook using IntersectionObserver
 * and requestAnimationFrame. Automatically disables when prefers-reduced-motion is active.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
): [RefObject<T | null>, ParallaxValues] {
  const {
    speed = 0.15,
    scaleStart,
    scaleEnd,
    clampPx = 160,
    disabled = false,
  } = options;

  const targetRef = useRef<T | null>(null);
  const [transform, setTransform] = useState<ParallaxValues>({
    translateY: 0,
    scale: scaleStart ?? 1,
    opacity: 1,
    progress: 0,
  });

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    // Accessibility check: respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setTransform({
        translateY: 0,
        scale: 1,
        opacity: 1,
        progress: 0.5,
      });
      return;
    }

    const element = targetRef.current;
    if (!element) return;

    let isIntersecting = false;
    let ticking = false;

    const updateParallax = () => {
      if (!element || !isIntersecting) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Distance from center of viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;

      // Progress from 0 (entering bottom) to 1 (exiting top)
      const totalTravel = viewportHeight + rect.height;
      const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / totalTravel));

      // Calculate vertical offset with translate3d
      let offset = -distanceFromCenter * speed;
      if (clampPx) {
        offset = Math.max(-clampPx, Math.min(clampPx, offset));
      }

      // Smooth scale transition as element passes through the viewport
      let currentScale = 1;
      if (scaleStart !== undefined && scaleEnd !== undefined) {
        const factor = Math.sin(progress * Math.PI); // peak at center
        currentScale = scaleStart + (scaleEnd - scaleStart) * factor;
      }

      setTransform({
        translateY: Math.round(offset * 10) / 10,
        scale: Math.round(currentScale * 1000) / 1000,
        opacity: Math.min(1, Math.max(0.6, 0.4 + progress * 0.8)),
        progress,
      });
    };

    // IntersectionObserver to sleep when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            updateParallax();
          }
        });
      },
      { rootMargin: '120px 0px 120px 0px' }
    );

    observer.observe(element);

    const handleScroll = () => {
      if (!isIntersecting || ticking) return;
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateParallax();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [speed, scaleStart, scaleEnd, clampPx, disabled]);

  return [targetRef, transform];
}
