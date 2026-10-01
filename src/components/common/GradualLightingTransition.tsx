import React from 'react';
import { useParallax } from '../../hooks/useParallax';

export interface GradualLightingTransitionProps {
  variant: 'light-to-dark' | 'dark-to-light';
  bgImage: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  heightClass?: string;
  speed?: number;
}

/**
 * GradualLightingTransition physically connects light and dark environments with a 65-80vh
 * multi-stop gradient bridge over a full-width parallax architectural photograph.
 */
export const GradualLightingTransition: React.FC<GradualLightingTransitionProps> = ({
  variant,
  bgImage,
  imageAlt,
  eyebrow,
  title,
  subtitle,
  heightClass = 'h-[60vh] sm:h-[72vh] md:h-[80vh]',
  speed = 0.24,
}) => {
  const isLightToDark = variant === 'light-to-dark';

  const [containerRef, { translateY, scale }] = useParallax<HTMLDivElement>({
    speed,
    clampPx: 140,
    scaleStart: 1.07,
    scaleEnd: 1.0,
  });

  return (
    <div
      ref={containerRef}
      role="presentation"
      className={`relative w-full overflow-hidden select-none flex items-center justify-center ${heightClass}`}
      style={{
        backgroundColor: isLightToDark ? '#202124' : '#F2EEE7',
      }}
    >
      {/* 1. Underlying Architectural Parallax Imagery Canvas */}
      <div
        className="absolute -top-24 -bottom-24 left-0 right-0 will-change-transform pointer-events-none"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        }}
      >
        <img
          src={bgImage}
          alt={imageAlt}
          loading="lazy"
          className="w-full h-full object-cover object-center filter grayscale-[18%] contrast-[1.08]"
        />

        {/* Atmospheric Scrim */}
        <div
          className={`absolute inset-0 ${
            isLightToDark
              ? 'bg-[#202124]/40 mix-blend-multiply'
              : 'bg-[#F2EEE7]/30 mix-blend-soft-light'
          }`}
        />
      </div>

      {/* 2. Multi-Stop Seamless Gradient Dissolve Layers */}
      {isLightToDark ? (
        // LIGHT (#F2EEE7) -> DARK (#202124)
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
          {/* Top third: Solid warm ivory fading to transparent */}
          <div className="h-[40%] w-full bg-gradient-to-b from-[#F2EEE7] via-[#F2EEE7]/90 to-transparent" />
          {/* Middle band: Atmospheric tint */}
          <div className="h-[20%] w-full bg-[#202124]/15" />
          {/* Bottom third: Transparent fading to deep charcoal */}
          <div className="h-[40%] w-full bg-gradient-to-t from-[#202124] via-[#202124]/90 to-transparent" />
        </div>
      ) : (
        // DARK (#202124) -> LIGHT (#F2EEE7)
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
          {/* Top third: Solid deep charcoal fading to transparent */}
          <div className="h-[40%] w-full bg-gradient-to-b from-[#202124] via-[#202124]/90 to-transparent" />
          {/* Middle band: Atmospheric tint */}
          <div className="h-[20%] w-full bg-[#F2EEE7]/15" />
          {/* Bottom third: Transparent fading to warm ivory */}
          <div className="h-[40%] w-full bg-gradient-to-t from-[#F2EEE7] via-[#F2EEE7]/90 to-transparent" />
        </div>
      )}

      {/* 3. Hairline Grid Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-10 bg-[linear-gradient(to_right,#B08D57_1px,transparent_1px),linear-gradient(to_bottom,#B08D57_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]"
      />

      {/* 4. Layered Editorial Text Monologue */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-4">
        {eyebrow && (
          <div className="inline-flex items-center justify-center gap-3">
            <span className="w-6 h-px bg-[#B08D57]" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-[#B08D57] font-semibold font-mono">
              {eyebrow}
            </span>
            <span className="w-6 h-px bg-[#B08D57]" />
          </div>
        )}

        <h3
          className={`font-serif-title text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-snug drop-shadow-sm ${
            isLightToDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
          }`}
        >
          {title}
        </h3>

        {subtitle && (
          <p
            className={`text-xs sm:text-sm font-light tracking-wide max-w-xl mx-auto leading-relaxed ${
              isLightToDark ? 'text-[#D6CBBE]/85' : 'text-[#202124]/80'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
