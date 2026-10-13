import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useStudio } from '../../context/StudioContext';

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activePage } = useStudio();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Disable smooth scrolling when viewing the CMS admin panel
    if (activePage === 'admin') {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis with editorial weighted momentum
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
      infinite: false,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Smoothly scroll to in-page hash anchors
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        if (href === '#top') {
          e.preventDefault();
          lenis.scrollTo(0, { duration: 1.4 });
        } else {
          const targetElement = document.querySelector(href);
          if (targetElement) {
            e.preventDefault();
            lenis.scrollTo(targetElement as HTMLElement, {
              offset: -75,
              duration: 1.4,
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [activePage]);

  return <>{children}</>;
};
