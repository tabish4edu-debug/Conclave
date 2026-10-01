import React, { useEffect, useRef, useState } from 'react';

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  distancePx?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  as?: 'div' | 'section' | 'article' | 'aside';
  id?: string;
}

/**
 * Custom hook providing native Intersection Observer visibility status
 */
export function useScrollReveal({
  threshold = 0.08,
  rootMargin = '0px 0px -60px 0px',
  triggerOnce = true,
}: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
} = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // If IntersectionObserver is not supported or prefers-reduced-motion is active
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const currentEl = elementRef.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(currentEl);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { elementRef, isVisible };
}

/**
 * ScrollReveal Component
 * Applies a cinematic fade-in and subtle upward slide when entering the viewport.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  distancePx = 28,
  threshold = 0.08,
  rootMargin = '0px 0px -60px 0px',
  triggerOnce = true,
  as: Component = 'div',
  id,
}) => {
  const { elementRef, isVisible } = useScrollReveal({
    threshold,
    rootMargin,
    triggerOnce,
  });

  return (
    <Component
      ref={elementRef as unknown as React.Ref<any>}
      id={id}
      className={`${className} ${
        isVisible ? 'reveal-visible' : 'reveal-hidden'
      }`}
      style={{
        transform: isVisible ? 'translateY(0)' : `translateY(${distancePx}px)`,
        transitionDelay: delayMs > 0 ? `${delayMs}ms` : undefined,
      }}
    >
      {children}
    </Component>
  );
};
