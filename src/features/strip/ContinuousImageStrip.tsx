import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { ContinuousStripItem } from '../../types';
import { Eye, X } from 'lucide-react';
import { PlaceholderBadge } from '../../components/common/PlaceholderBadge';
import { useParallax } from '../../hooks/useParallax';

export const ContinuousImageStrip: React.FC = () => {
  const { stripItems, projects, setSelectedProject } = useStudio();
  const [activeLightboxItem, setActiveLightboxItem] = useState<ContinuousStripItem | null>(null);

  const [sectionRef, { translateY }] = useParallax<HTMLElement>({
    speed: 0.08,
    clampPx: 35,
  });

  // Published strip items sorted by order
  const items = stripItems
    .filter((item) => item.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Duplicate items for a seamless marquee loop
  const marqueeItems = [...items, ...items];

  const handleItemClick = (item: ContinuousStripItem) => {
    if (item.projectId) {
      const proj = projects.find((p) => p.id === item.projectId);
      if (proj) {
        setSelectedProject(proj);
        return;
      }
    }
    setActiveLightboxItem(item);
  };

  return (
    <section
      ref={sectionRef}
      id="continuous-strip-section"
      aria-label="Continuous Architectural Gallery Strip"
      className="relative py-16 bg-[#F2EEE7] text-[#202124] overflow-hidden border-y border-[#D6CBBE]"
    >
      {/* Header Eyebrow */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-[#B08D57]" />
          <span className="text-[11px] tracking-[0.28em] uppercase text-[#202124] font-semibold font-mono">
            CONTINUOUS ARCHITECTURAL REPERTOIRE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] tracking-widest text-[#8C8276] uppercase font-mono hidden sm:inline">
            Hover to Pause · Click to Inspect Monograph
          </span>
          <PlaceholderBadge variant="compact" />
        </div>
      </div>

      {/* Marquee Track with Subtle Depth Translation (Smooth right-to-left infinite motion) */}
      <div
        className="pause-marquee relative w-full overflow-hidden will-change-transform"
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
        }}
      >
        <div className="animate-continuous-strip flex items-center gap-6 py-2">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => handleItemClick(item)}
              tabIndex={0}
              role="button"
              aria-label={`View architectural detail: ${item.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleItemClick(item);
                }
              }}
              className="group relative flex-shrink-0 w-72 sm:w-80 md:w-96 aspect-[16/11] overflow-hidden bg-[#D6CBBE] cursor-pointer border border-[#D6CBBE] hover:border-[#B08D57] transition-all duration-300 focus:outline-hidden focus:ring-1 focus:ring-[#B08D57] shadow-xs"
            >
              <img
                src={item.imageUrl}
                alt={item.altText}
                loading="lazy"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Hover Dark Overlay & Caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#202124]/90 via-[#202124]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#B08D57] font-semibold font-mono">
                  {item.category}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <h4 className="font-serif-title text-lg text-[#F2EEE7] font-light">
                    {item.title}
                  </h4>
                  <div className="w-8 h-8 rounded-full bg-[#B08D57] text-[#202124] flex items-center justify-center transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Permanent discreet label */}
              <div className="absolute bottom-2.5 left-2.5 z-10 opacity-80 group-hover:opacity-0 transition-opacity">
                <span className="px-2.5 py-1 text-[9px] uppercase tracking-wider bg-[#202124]/85 text-[#F2EEE7] backdrop-blur-xs font-mono">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible Lightbox Modal */}
      {activeLightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxItem.title}
          className="fixed inset-0 z-50 bg-[#202124]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
        >
          <div className="relative max-w-4xl w-full bg-[#2B2D2F] border border-[#B08D57]/40 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A3C3E] bg-[#202124]">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-mono">
                  {activeLightboxItem.category}
                </span>
                <h3 className="font-serif-title text-xl text-[#F2EEE7]">
                  {activeLightboxItem.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveLightboxItem(null)}
                className="p-2 text-[#D6CBBE] hover:text-white bg-[#202124] border border-[#3A3C3E] hover:border-[#B08D57] cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image */}
            <div className="relative max-h-[70vh] overflow-hidden bg-[#202124]">
              <img
                src={activeLightboxItem.imageUrl}
                alt={activeLightboxItem.altText}
                className="w-full h-full max-h-[70vh] object-contain mx-auto"
              />
              <div className="absolute bottom-4 left-4">
                <span className="text-xs text-[#D6CBBE]/80 font-mono bg-[#202124]/85 px-3 py-1">
                  {activeLightboxItem.altText}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
