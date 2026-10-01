import React from 'react';
import { useParallax } from '../../hooks/useParallax';

export interface ArchitecturalTransitionProps {
  variant: 'light-to-dark' | 'dark-to-light';
  bgImage: string;
  imageAlt?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  speed?: number;
  heightClass?: string;
  className?: string;
}

export const ArchitecturalTransition: React.FC<ArchitecturalTransitionProps> = ({
  variant,
  bgImage,
  imageAlt = 'Conclave Interiors Architectural Material Transition',
  eyebrow,
  title,
  subtitle,
  speed = 0.18,
  heightClass = 'h-52 sm:h-64 md:h-80',
  className = '',
}) => {
  const [containerRef, { translateY, scale }] = useParallax<HTMLDivElement>({
    speed,
    clampPx: 120,
    scaleStart: 1.05,
    scaleEnd: 1.0,
  });

  const isLightToDark = variant === 'light-to-dark';

  return (
    <div
      ref={containerRef}
      role="presentation"
      className={`relative w-full overflow-hidden select-none pointer-events-none transition-colors duration-500 ${heightClass} ${className}`}
    >
      {/* 1. Underlying Parallax Architectural Imagery Canvas */}
      <div
        className="absolute -top-16 -bottom-16 left-0 right-0 will-change-transform"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        }}
      >
        <img
          src={bgImage}
          alt={imageAlt}
          loading="lazy"
          className="w-full h-full object-cover object-center filter grayscale-[25%] contrast-[1.05]"
        />

        {/* Atmospheric Scrim to soften image into the background */}
        <div
          className={`absolute inset-0 ${
            isLightToDark
              ? 'bg-[#202124]/45 mix-blend-multiply'
              : 'bg-[#F2EEE7]/35 mix-blend-soft-light'
          }`}
        />
      </div>

      {/* 2. Seamless Gradient Transition Layers */}
      {isLightToDark ? (
        // LIGHT (#F2EEE7) -> DARK (#202124)
        <div className="absolute inset-0 flex flex-col justify-between">
          {/* Top: Blends from warm ivory seamlessly */}
          <div className="h-1/2 w-full bg-gradient-to-b from-[#F2EEE7] via-[#F2EEE7]/85 to-transparent" />
          {/* Bottom: Blends into deep charcoal seamlessly */}
          <div className="h-1/2 w-full bg-gradient-to-b from-transparent via-[#202124]/85 to-[#202124]" />
        </div>
      ) : (
        // DARK (#202124) -> LIGHT (#F2EEE7)
        <div className="absolute inset-0 flex flex-col justify-between">
          {/* Top: Blends from deep charcoal seamlessly */}
          <div className="h-1/2 w-full bg-gradient-to-b from-[#202124] via-[#202124]/85 to-transparent" />
          {/* Bottom: Blends into warm ivory seamlessly */}
          <div className="h-1/2 w-full bg-gradient-to-b from-transparent via-[#F2EEE7]/85 to-[#F2EEE7]" />
        </div>
      )}

      {/* 3. Subtle Architectural Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#B08D57_1px,transparent_1px),linear-gradient(to_bottom,#B08D57_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* 4. Editorial Typography & Monograph Accents */}
      {(eyebrow || title || subtitle) && (
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-10 lg:px-12 flex flex-col justify-center items-center text-center">
          <div className="space-y-2 max-w-xl">
            {eyebrow && (
              <div className="flex items-center justify-center gap-3">
                <span className="w-6 h-px bg-[#B08D57]" />
                <span className="text-[10px] tracking-[0.35em] uppercase text-[#B08D57] font-semibold font-mono">
                  {eyebrow}
                </span>
                <span className="w-6 h-px bg-[#B08D57]" />
              </div>
            )}
            {title && (
              <h3
                className={`font-serif-title text-2xl sm:text-3xl md:text-4xl font-light tracking-wide ${
                  isLightToDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
                }`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={`text-xs font-light tracking-wider font-mono ${
                  isLightToDark ? 'text-[#D6CBBE]/80' : 'text-[#8C8276]'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
