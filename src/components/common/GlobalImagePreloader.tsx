import React, { useEffect, useState, useRef } from 'react';
import { useStudio } from '../../context/StudioContext';

const ARCHITECTURAL_ASSETS_TO_CACHE = [
  '/images/hero/contemporary-marble-kitchen.jpg',
  '/images/hero/noir-atelier-loft.jpg',
  '/images/hero/smoked-oak-library.jpg',
  '/images/projects/monolithic-travertine-pavilion.jpg',
  '/images/projects/limewash-plaster-suite.jpg',
  '/images/projects/soiree-bronze-bar.jpg',
  '/images/projects/executive-boardroom-sanctuary.jpg',
  '/images/about/principal-designer.jpg',
];

export const GlobalImagePreloader: React.FC = () => {
  const { heroSlides, settings, isHeroPreloaded, setIsHeroPreloaded } = useStudio();
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRendered, setIsRendered] = useState(true);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Build unique asset list including dynamic settings and hero slides
    const dynamicAssets: string[] = [];
    if (settings.vista1Image) dynamicAssets.push(settings.vista1Image);
    if (settings.vista2Image) dynamicAssets.push(settings.vista2Image);
    if (settings.ctaMediaUrl) dynamicAssets.push(settings.ctaMediaUrl);
    heroSlides.forEach((slide) => {
      if (slide.imageUrl) dynamicAssets.push(slide.imageUrl);
    });

    const uniqueImages = Array.from(new Set([...ARCHITECTURAL_ASSETS_TO_CACHE, ...dynamicAssets]))
      .filter((url) => typeof url === 'string' && url.trim().length > 0);

    const total = uniqueImages.length;
    let loadedCount = 0;
    const startTime = Date.now();
    const MINIMUM_DISPLAY_MS = 650;
    const MAXIMUM_TIMEOUT_MS = 3200;

    const finalizePreload = () => {
      setProgress(100);
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MINIMUM_DISPLAY_MS - elapsed);

      setTimeout(() => {
        setIsCompleted(true);
        // Signal to HeroSection to trigger entrance animations immediately
        setIsHeroPreloaded(true);

        // Remove preloader DOM completely after fade-out transition
        setTimeout(() => {
          setIsRendered(false);
        }, 750);
      }, remainingTime);
    };

    // Safety timeout in case of slow or blocked network
    const safetyTimeout = setTimeout(() => {
      finalizePreload();
    }, MAXIMUM_TIMEOUT_MS);

    // Preload and decode images in parallel
    uniqueImages.forEach((src) => {
      const img = new Image();
      img.src = src;

      const handleImageReady = () => {
        loadedCount++;
        const currentPercent = Math.min(99, Math.round((loadedCount / total) * 100));
        setProgress(currentPercent);

        if (loadedCount >= total) {
          clearTimeout(safetyTimeout);
          finalizePreload();
        }
      };

      if (img.complete && img.naturalWidth > 0) {
        // Already cached in browser memory
        if (typeof img.decode === 'function') {
          img.decode().then(handleImageReady).catch(handleImageReady);
        } else {
          handleImageReady();
        }
      } else {
        img.onload = () => {
          if (typeof img.decode === 'function') {
            img.decode().then(handleImageReady).catch(handleImageReady);
          } else {
            handleImageReady();
          }
        };
        img.onerror = () => {
          handleImageReady();
        };
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [heroSlides, settings, setIsHeroPreloaded]);

  if (!isRendered) return null;

  return (
    <div
      aria-hidden={isCompleted}
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#141517] text-[#F2EEE7] transition-all duration-700 ease-out ${
        isCompleted
          ? 'opacity-0 pointer-events-none scale-[1.015]'
          : 'opacity-100 pointer-events-auto scale-100'
      }`}
    >
      {/* Background Architectural Subtle Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#B08D57_1px,transparent_1px),linear-gradient(to_bottom,#B08D57_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />

      {/* Atmospheric Vignette Gradients */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#141517]/50 to-[#101012] pointer-events-none" />

      {/* Central Content Composition */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center space-y-6">
        {/* Monogram Crest with Patinated Bronze Ring */}
        <div className="relative w-16 h-16 rounded-full border border-[#B08D57]/40 flex items-center justify-center bg-[#18191B] shadow-2xl">
          <span className="font-serif-title text-3xl font-light text-[#B08D57] select-none tracking-tight">
            C
          </span>
          {/* Subtle animated orbital accent */}
          <div className="absolute inset-0 rounded-full border-t border-[#B08D57] animate-spin [animation-duration:3s]" />
        </div>

        {/* Studio Identity */}
        <div className="space-y-1">
          <h2 className="font-serif-title uppercase text-base sm:text-lg tracking-[0.28em] text-[#F2EEE7] font-normal">
            CONCLAVE INTERIORS
          </h2>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#B08D57] font-mono">
            Atelier Architecture & Monographs
          </p>
        </div>

        {/* High-Precision Progress Indicator */}
        <div className="w-56 space-y-2 pt-2">
          {/* Razor Hairline Track */}
          <div className="w-full h-0.5 bg-[#2B2D2F] overflow-hidden rounded-full relative">
            <div
              className="h-full bg-gradient-to-r from-[#B08D57]/60 via-[#B08D57] to-[#D8CFC1] transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Live Progress Label & Counter */}
          <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-[#8C8276] uppercase">
            <span>Caching Photography</span>
            <span className="text-[#B08D57] font-semibold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
