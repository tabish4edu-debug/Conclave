import React, { useRef, useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Project } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  ArrowUpRight,
  MapPin,
  Images,
  Filter,
  Sparkles,
} from 'lucide-react';
import { ProjectVideoModal } from './ProjectVideoModal';
import { ProjectDetailModal } from './ProjectDetailModal';

export const HorizontalProjectGallery: React.FC = () => {
  const { projects, isPreviewMode, selectedProject, setSelectedProject } = useStudio();
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeVideoProject, setActiveVideoProject] = useState<Project | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const categories = ['All', 'Residential', 'Commercial', 'Hospitality', 'Minimalist', 'Noir Penthouse'];

  // Published filter for public visitors; preview mode shows all
  const displayedProjects = isPreviewMode
    ? projects
    : projects.filter((p) => p.status === 'published');

  const filteredProjects =
    activeCategory === 'All'
      ? displayedProjects
      : displayedProjects.filter((p) => p.category === activeCategory);

  // Monitor scroll position to enable/disable arrows and update progress bar
  const checkScrollState = () => {
    const el = galleryScrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    }
  };

  useEffect(() => {
    const el = galleryScrollRef.current;
    if (!el) return;

    checkScrollState();
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);

    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [filteredProjects]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = galleryScrollRef.current;
    if (!el) return;

    // Scroll by the approximate width of one card + gap
    const scrollDelta = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollDelta : scrollDelta,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="our-works-gallery"
      aria-label="Our Works — Architectural Project Gallery"
      className="py-24 sm:py-32 bg-[#F2EEE7] text-[#202124] border-t border-[#D6CBBE] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#D6CBBE]">
          <div className="space-y-3 max-w-2xl">
            <h2 className="font-serif-title text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#202124]">
              OUR WORKS
            </h2>

            <p className="text-sm sm:text-base text-[#8C8276] font-light leading-relaxed">
              Explore our architectural commissions through horizontally arranged spatial studies, authentic materiality details, and cinematic walkthrough films.
            </p>
          </div>

          {/* Navigation Controls: Arrows on Desktop */}
          <div className="flex items-center gap-4 self-start lg:self-end">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollByAmount('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll projects left"
                className="w-10 h-10 rounded-full border border-[#D6CBBE] bg-[#F2EEE7] hover:border-[#B08D57] hover:text-[#B08D57] text-[#202124] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => scrollByAmount('right')}
                disabled={!canScrollRight}
                aria-label="Scroll projects right"
                className="w-10 h-10 rounded-full border border-[#D6CBBE] bg-[#F2EEE7] hover:border-[#B08D57] hover:text-[#B08D57] text-[#202124] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="py-6 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#8C8276] mr-1 hidden sm:inline-flex items-center gap-1.5 font-mono">
              <Filter className="w-3.5 h-3.5 text-[#B08D57]" /> Category:
            </span>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs uppercase tracking-[0.15em] font-medium transition-all whitespace-nowrap cursor-pointer rounded-xs ${
                  activeCategory === cat
                    ? 'bg-[#202124] text-[#F2EEE7] font-semibold shadow-xs'
                    : 'bg-[#D6CBBE]/35 text-[#202124] border border-[#D6CBBE] hover:border-[#B08D57]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#8C8276] font-mono hidden md:inline shrink-0">
            {filteredProjects.length} Curated Work{filteredProjects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* HORIZONTAL SWIPEABLE GALLERY VIEWPORT */}
      <div className="w-full relative mt-4">
        {filteredProjects.length > 0 ? (
          <div
            ref={galleryScrollRef}
            tabIndex={0}
            aria-label="Horizontally scrollable project list"
            className="flex gap-6 sm:gap-8 overflow-x-auto px-6 md:px-10 lg:px-12 pb-6 pt-2 scroll-smooth snap-x snap-mandatory focus:outline-hidden"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {filteredProjects.map((project, idx) => {
              const hasVideo = Boolean(project.videoUrl && project.videoUrl.trim());
              const galleryCount = project.galleryImages?.length || 0;

              return (
                <article
                  key={project.id || idx}
                  className="group shrink-0 w-[84vw] sm:w-[420px] md:w-[460px] lg:w-[490px] snap-start bg-[#F2EEE7] border border-[#D6CBBE] hover:border-[#B08D57] transition-all duration-300 shadow-sm flex flex-col justify-between overflow-hidden"
                >
                  {/* Cover Image & Video Trigger Container */}
                  <div className="relative aspect-[16/11] w-full bg-[#D6CBBE] overflow-hidden">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#202124]/65 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

                    {/* Top Status & Photography Counter Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        {project.status === 'draft' && (
                          <span className="px-2 py-0.5 text-[9px] tracking-wider uppercase font-semibold bg-amber-500 text-black font-mono">
                            Draft Preview
                          </span>
                        )}
                        {project.isFeatured && (
                          <span className="px-2 py-0.5 text-[9px] tracking-wider uppercase font-semibold bg-[#B08D57] text-[#202124] font-mono">
                            Featured
                          </span>
                        )}
                      </div>

                      {galleryCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[#F2EEE7] text-[10px] font-mono border border-white/10">
                          <Images className="w-3 h-3 text-[#B08D57]" />
                          <span>+{galleryCount} Photos</span>
                        </span>
                      )}
                    </div>

                    {/* TASTEFUL PLAY BUTTON OVER COVER IMAGE (Rendered ONLY if video is attached) */}
                    {hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVideoProject(project);
                          }}
                          aria-label={`Play video walkthrough for ${project.title}`}
                          className="group/btn relative flex items-center gap-2.5 px-4 py-2.5 bg-[#202124]/85 hover:bg-[#B08D57] text-[#F2EEE7] hover:text-[#202124] border border-[#B08D57]/70 backdrop-blur-md rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-full bg-[#B08D57] group-hover/btn:bg-[#202124] text-[#202124] group-hover/btn:text-[#B08D57] flex items-center justify-center transition-colors">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold pr-1">
                            Play Film
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Bottom Metadata Ribbon */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#F2EEE7] z-10 pointer-events-none">
                      <span className="flex items-center gap-1 font-mono drop-shadow-xs">
                        <MapPin className="w-3 h-3 text-[#B08D57]" /> {project.location || 'Conclave Atelier'}
                      </span>
                      <span className="font-mono text-[#D6CBBE] drop-shadow-xs">
                        {project.year || '2026'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Action Area */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-[#F2EEE7]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] tracking-[0.2em] uppercase text-[#B08D57] font-semibold font-mono">
                          {project.category}
                        </span>
                        {hasVideo && (
                          <span className="text-[9px] font-mono text-[#8C8276] uppercase tracking-wider">
                            Walkthrough Available
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setSelectedProject(project)}
                        className="font-serif-title text-2xl text-[#202124] group-hover:text-[#B08D57] transition-colors leading-snug cursor-pointer"
                      >
                        {project.title}
                      </h3>

                      {project.description && (
                        <p className="text-xs sm:text-sm text-[#8C8276] font-light line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Monograph Action */}
                    <div className="pt-4 border-t border-[#D6CBBE] flex items-center justify-between">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#202124] hover:text-[#B08D57] transition-colors cursor-pointer"
                      >
                        <span>Examine Monograph</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#B08D57]" />
                      </button>

                      {hasVideo && (
                        <button
                          onClick={() => setActiveVideoProject(project)}
                          className="text-[11px] font-mono text-[#B08D57] hover:underline cursor-pointer"
                        >
                          Watch Film →
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-[#8C8276] max-w-7xl mx-auto px-6">
            No projects found matching the selected category.
          </div>
        )}

        {/* Minimalist Progress Indicator */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 mt-4">
          <div className="w-full h-0.5 bg-[#D6CBBE]/40 overflow-hidden">
            <div
              className="h-full bg-[#B08D57] transition-all duration-150"
              style={{ width: `${Math.max(12, scrollProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Project Video Popup Modal */}
      {activeVideoProject && (
        <ProjectVideoModal
          project={activeVideoProject}
          onClose={() => setActiveVideoProject(null)}
        />
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};
