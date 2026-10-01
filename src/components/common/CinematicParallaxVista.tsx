import React from 'react';
import { useParallax } from '../../hooks/useParallax';
import { ArrowUpRight } from 'lucide-react';

export interface CinematicParallaxVistaProps {
  id?: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  materialSpecification?: string;
  imageUrl: string;
  imageAlt: string;
  heightClass?: string;
  theme?: 'light' | 'dark';
  speed?: number;
  focalPosition?: string;
  overlayOpacity?: number;
  showExploreLink?: boolean;
  exploreLinkText?: string;
  exploreHref?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  specClassName?: string;
  exploreLinkClassName?: string;
  backdropClassName?: string;
}

export const CinematicParallaxVista: React.FC<CinematicParallaxVistaProps> = ({
  id,
  chapterNumber,
  title,
  subtitle,
  materialSpecification,
  imageUrl,
  imageAlt,
  heightClass = 'h-[65vh] sm:h-[75vh] lg:h-[85vh]',
  theme = 'light',
  speed = 0.26,
  focalPosition = 'object-center',
  overlayOpacity,
  showExploreLink = true,
  exploreLinkText = 'Examine Architectural Monograph',
  exploreHref = '#projects',
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  specClassName = '',
  exploreLinkClassName = '',
  backdropClassName = '',
}) => {
  const isDark = theme === 'dark';

  const [containerRef, { translateY, scale }] = useParallax<HTMLDivElement>({
    speed,
    clampPx: 160,
    scaleStart: 1.08,
    scaleEnd: 1.0,
  });

  const defaultOverlay = isDark ? 0.48 : 0.22;
  const activeOverlay = overlayOpacity !== undefined ? overlayOpacity : defaultOverlay;

  return (
    <section
      id={id}
      ref={containerRef}
      aria-label={`${chapterNumber}: ${title}`}
      className={`relative w-full overflow-hidden select-none flex items-center justify-center ${heightClass} ${
        isDark ? 'bg-[#202124] text-[#F2EEE7]' : 'bg-[#F2EEE7] text-[#202124]'
      } ${className}`}
    >
      {/* 1. Underlying Monumental Parallax Architectural Imagery Canvas */}
      <div
        className="absolute -top-24 -bottom-24 left-0 right-0 will-change-transform pointer-events-none"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        }}
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          className={`w-full h-full object-cover ${focalPosition} filter ${
            isDark
              ? 'grayscale-[20%] contrast-[1.12] brightness-[0.88]'
              : 'grayscale-[10%] contrast-[1.04]'
          }`}
        />

        {/* Cinematic Scrim & Lighting Vignette */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isDark
              ? 'bg-radial from-transparent via-[#202124]/40 to-[#202124]/80'
              : 'bg-radial from-transparent via-[#F2EEE7]/30 to-[#F2EEE7]/70'
          }`}
          style={{ opacity: activeOverlay }}
        />
      </div>

      {/* 2. Soft Edge Feathering (Dissolves top and bottom into adjacent sections without hard cuts) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
        <div
          className={`h-28 sm:h-36 w-full ${
            isDark
              ? 'bg-gradient-to-b from-[#202124] via-[#202124]/70 to-transparent'
              : 'bg-gradient-to-b from-[#F2EEE7] via-[#F2EEE7]/70 to-transparent'
          }`}
        />
        <div
          className={`h-28 sm:h-36 w-full ${
            isDark
              ? 'bg-gradient-to-t from-[#202124] via-[#202124]/70 to-transparent'
              : 'bg-gradient-to-t from-[#F2EEE7] via-[#F2EEE7]/70 to-transparent'
          }`}
        />
      </div>

      {/* 3. Subtle Hairline Architectural Grid Pattern */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none z-10 ${
          isDark
            ? 'opacity-[0.04] bg-[linear-gradient(to_right,#B08D57_1px,transparent_1px),linear-gradient(to_bottom,#B08D57_1px,transparent_1px)] bg-[size:5rem_5rem]'
            : 'opacity-[0.035] bg-[linear-gradient(to_right,#202124_1px,transparent_1px),linear-gradient(to_bottom,#202124_1px,transparent_1px)] bg-[size:5rem_5rem]'
        }`}
      />

      {/* 4. Layered Editorial Foreground Typography */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 sm:px-10 text-center flex flex-col items-center justify-center space-y-6">
        {/* Subtle Dark Translucent Ambient Backdrop: creates smooth, filmic contrast across both light and dark imagery without visible boxes or borders */}
        <div
          aria-hidden="true"
          className={`absolute -inset-x-6 sm:-inset-x-14 -inset-y-10 sm:-inset-y-14 -z-10 rounded-[48px] bg-radial from-[#121316]/50 via-[#121316]/20 to-transparent blur-2xl pointer-events-none ${
            backdropClassName || ''
          }`}
        />

        {/* Chapter / Material Kicker */}
        <div className="inline-flex items-center gap-3 px-3 py-1 bg-black/25 backdrop-blur-md rounded-xs border border-[#B08D57]/40 shadow-xs">
          <span className="w-4 h-px bg-[#B08D57]" />
          <span className="text-[10px] sm:text-[11px] tracking-[0.35em] uppercase font-mono font-semibold text-[#B08D57]">
            {chapterNumber}
          </span>
          <span className="w-4 h-px bg-[#B08D57]" />
        </div>

        {/* Hero Architectural Title */}
        <h2
          className={`font-serif-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal md:font-medium tracking-tight leading-[1.06] text-balance ${
            titleClassName
              ? titleClassName
              : isDark
              ? 'text-[#F2EEE7] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]'
              : 'text-[#0D0E10] drop-shadow-[0_2px_16px_rgba(255,255,255,0.95)] drop-shadow-[0_1px_3px_rgba(255,255,255,1)]'
          }`}
        >
          {title}
        </h2>

        {/* Supporting Editorial Prose */}
        <p
          className={`text-xs sm:text-sm md:text-base font-light max-w-2xl leading-relaxed tracking-wide ${
            subtitleClassName
              ? subtitleClassName
              : isDark
              ? 'text-[#D6CBBE]/90'
              : 'text-[#202124]/85'
          }`}
        >
          {subtitle}
        </p>

        {/* Material Specification Badge & Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pointer-events-auto">
          {materialSpecification && (
            <div
              className={`px-4 py-1.5 border text-[10px] tracking-[0.2em] uppercase font-mono backdrop-blur-sm ${
                specClassName
                  ? specClassName
                  : isDark
                  ? 'border-[#3A3C3E] bg-[#202124]/80 text-[#D6CBBE]'
                  : 'border-[#D6CBBE] bg-[#F2EEE7]/80 text-[#202124]'
              }`}
            >
              {materialSpecification}
            </div>
          )}

          {showExploreLink && (
            <a
              href={exploreHref}
              className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold transition-colors duration-300 group py-1 border-b ${
                exploreLinkClassName
                  ? exploreLinkClassName
                  : isDark
                  ? 'text-[#B08D57] border-[#B08D57]/50 hover:text-[#F2EEE7] hover:border-[#F2EEE7]'
                  : 'text-[#202124] border-[#202124]/40 hover:text-[#B08D57] hover:border-[#B08D57]'
              }`}
            >
              <span>{exploreLinkText}</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
