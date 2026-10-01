import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Project } from '../../types';
import { ArrowUpRight, MapPin, Filter } from 'lucide-react';
import { PlaceholderBadge } from '../../components/common/PlaceholderBadge';
import { ProjectDetailModal } from './ProjectDetailModal';
import { useParallax } from '../../hooks/useParallax';

interface SecondaryProjectCardProps {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
}

const SecondaryProjectCard: React.FC<SecondaryProjectCardProps> = ({ project, index, onSelect }) => {
  // Staggered, visibly distinct parallax speeds per column
  const speeds = [0.18, -0.12, 0.22, 0.14, -0.10, 0.20];
  const speed = speeds[index % speeds.length];

  // Card elevation parallax (gentle staggered vertical movement per column)
  const [cardRef, { translateY: cardY }] = useParallax<HTMLElement>({
    speed: speed * 0.45,
    clampPx: 45,
  });

  // Inner image depth parallax (smooth vertical scroll & scale within masked viewport)
  const [imageRef, { translateY: imageY, scale: imageScale }] = useParallax<HTMLDivElement>({
    speed: speed * 0.95,
    clampPx: 70,
    scaleStart: 1.10,
    scaleEnd: 1.0,
  });

  return (
    <article
      ref={cardRef}
      onClick={() => onSelect(project)}
      style={{
        transform: `translate3d(0, ${cardY}px, 0)`,
      }}
      className="group cursor-pointer flex flex-col justify-between bg-[#D6CBBE]/25 border border-[#D6CBBE] hover:border-[#B08D57] transition-[border-color,box-shadow] duration-300 overflow-hidden shadow-xs focus-within:ring-1 focus-within:ring-[#B08D57] will-change-transform"
    >
      {/* Image Container with Deep Parallax Canvas and Hover Zoom */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#D6CBBE]">
        <div
          ref={imageRef}
          className="absolute -top-16 -bottom-16 left-0 right-0 will-change-transform pointer-events-none"
          style={{
            transform: `translate3d(0, ${imageY}px, 0) scale(${imageScale})`,
          }}
        >
          <img
            src={project.coverImage}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#202124]/70 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
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

        {/* Bottom Overlay Specs */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#F2EEE7] z-10">
          <span className="flex items-center gap-1 font-mono">
            <MapPin className="w-3 h-3 text-[#B08D57]" /> {project.location}
          </span>
          <span className="font-mono text-[#D6CBBE]">{project.year}</span>
        </div>
      </div>

      {/* Card Meta Content */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-[#F2EEE7]">
        <div>
          {/* Unboxed category label */}
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#B08D57] font-semibold block mb-1.5 font-mono">
            {project.category}
          </span>

          <h3 className="font-serif-title text-2xl text-[#202124] group-hover:text-[#B08D57] transition-colors leading-snug">
            {project.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#8C8276] font-light mt-2 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Materials preview */}
        <div className="pt-4 border-t border-[#D6CBBE] space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {project.materialsPalette.slice(0, 3).map((mat, i) => (
              <span
                key={i}
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#D6CBBE]/30 text-[#202124] border border-[#D6CBBE] font-mono"
              >
                {mat}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] uppercase tracking-[0.16em] text-[#202124] font-semibold group-hover:text-[#B08D57] transition-colors">
            <span>Explore Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </article>
  );
};

export const FeaturedProjects: React.FC = () => {
  const { projects, isPreviewMode, selectedProject, setSelectedProject, setIsQueryModalOpen, setQueryInitialTab } = useStudio();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Parallax for the main featured monograph
  const [featuredRef, { translateY: featuredY, scale: featuredScale }] = useParallax<HTMLElement>({
    speed: 0.22,
    clampPx: 85,
    scaleStart: 1.10,
    scaleEnd: 1.0,
  });

  // Parallax for the secondary grid container (selected element)
  const [gridRef, { translateY: gridTranslateY }] = useParallax<HTMLDivElement>({
    speed: 0.14,
    clampPx: 60,
  });

  // Categories present in projects
  const categories = ['All', 'Residential', 'Commercial', 'Minimalist', 'Noir Penthouse', 'Hospitality'];

  const displayedProjects = isPreviewMode ? projects : projects.filter((p) => p.status === 'published');

  const filteredProjects =
    selectedCategory === 'All'
      ? displayedProjects
      : displayedProjects.filter((p) => p.category === selectedCategory);

  const featuredMonograph = filteredProjects[0];
  const gridMonographs = filteredProjects.slice(1);

  return (
    <section id="projects" aria-label="Selected Projects" className="py-28 bg-[#F2EEE7] text-[#202124]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#D6CBBE]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold font-mono">
                PORTFOLIO MONOGRAPHS
              </span>
            </div>
            <h2 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#202124]">
              SELECTED WORKS
            </h2>
            <p className="text-sm sm:text-base text-[#8C8276] max-w-xl font-light leading-relaxed">
              Disciplined architectural volumes, refined materiality, and sensory stillness. Each monograph represents an uncompromised spatial response.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PlaceholderBadge label="Client Placeholder Projects" variant="subtle" />
          </div>
        </div>

        {/* Category Filters (Clean Segmented Architecture Controls) */}
        <div className="py-8 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#8C8276] mr-2 hidden sm:inline-flex items-center gap-1.5 font-mono">
              <Filter className="w-3.5 h-3.5 text-[#B08D57]" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.16em] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#202124] text-[#F2EEE7] font-semibold shadow-xs'
                    : 'bg-[#D6CBBE]/40 text-[#202124] border border-[#D6CBBE] hover:border-[#B08D57]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#8C8276] font-mono hidden md:inline">
            Showing {filteredProjects.length} Curated Cases
          </span>
        </div>

        {/* ASYMMETRIC EDITORIAL PORTFOLIO GRID */}
        {filteredProjects.length > 0 ? (
          <div className="space-y-12 pt-4">
            {/* 1. Large Hero Feature Project Card with Deep Parallax */}
            {featuredMonograph && (
              <article
                ref={featuredRef}
                onClick={() => setSelectedProject(featuredMonograph)}
                className="group cursor-pointer bg-[#D6CBBE]/25 border border-[#D6CBBE] hover:border-[#B08D57] transition-all duration-400 overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm"
              >
                {/* Left/Main Image with Parallax Canvas */}
                <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto w-full overflow-hidden bg-[#D6CBBE]">
                  <div
                    className="absolute -top-14 -bottom-14 left-0 right-0 will-change-transform pointer-events-none"
                    style={{
                      transform: `translate3d(0, ${featuredY}px, 0) scale(${featuredScale})`,
                    }}
                  >
                    <img
                      src={featuredMonograph.coverImage}
                      alt={featuredMonograph.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-104"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#202124]/60 via-transparent to-transparent lg:hidden" />
                  
                  {featuredMonograph.status === 'draft' && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-2.5 py-1 text-[10px] tracking-wider uppercase font-semibold bg-amber-500 text-black font-mono">
                        Draft Preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Editorial Story & Specs */}
                <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Unboxed Metadata adhering to zero-pill rule */}
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#B08D57] font-semibold font-mono">
                      <span>{featuredMonograph.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{featuredMonograph.location}</span>
                      <span aria-hidden="true">·</span>
                      <span>{featuredMonograph.year}</span>
                    </div>

                    <h3 className="font-serif-title text-3xl sm:text-4xl text-[#202124] group-hover:text-[#B08D57] transition-colors leading-tight">
                      {featuredMonograph.title}
                    </h3>

                    <p className="text-sm text-[#8C8276] font-light leading-relaxed">
                      {featuredMonograph.description}
                    </p>

                    {featuredMonograph.architecturalBrief && (
                      <p className="text-xs text-[#8C8276] font-light italic border-l-2 border-[#B08D57] pl-3 py-1 line-clamp-2">
                        "{featuredMonograph.architecturalBrief}"
                      </p>
                    )}
                  </div>

                  {/* Materials & Action */}
                  <div className="pt-6 border-t border-[#D6CBBE] space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {featuredMonograph.materialsPalette.slice(0, 4).map((mat, i) => (
                        <span
                          key={i}
                          className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-[#F2EEE7] text-[#202124] border border-[#D6CBBE] font-mono"
                        >
                          {mat}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs uppercase tracking-[0.18em] text-[#202124] font-semibold group-hover:text-[#B08D57] transition-colors">
                      <span>Inspect Complete Monograph</span>
                      <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* 2. Grid of Secondary Monographs with Staggered Parallax Movement */}
            {gridMonographs.length > 0 && (
              <div
                ref={gridRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 will-change-transform"
                style={{
                  transform: `translate3d(0, ${gridTranslateY}px, 0)`,
                }}
              >
                {gridMonographs.map((project, index) => (
                  <SecondaryProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    onSelect={setSelectedProject}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-[#8C8276]">
            No projects available under this category.
          </div>
        )}

        {/* Bottom Architectural Consultation Banner (Graphite #2B2D2F & Charcoal #202124) */}
        <div className="mt-16 p-8 md:p-12 bg-[#2B2D2F] text-[#F2EEE7] border border-[#3A3C3E] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7] font-light">
              Have a distinct residential or commercial brief?
            </h4>
            <p className="text-sm text-[#D6CBBE] font-light max-w-xl">
              Our studio reviews blueprints, floorplans, and spatial queries by private atelier appointment.
            </p>
          </div>

          <button
            onClick={() => {
              setQueryInitialTab('enquiry');
              setIsQueryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-sm cursor-pointer"
          >
            <span>Request Studio Evaluation</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Active Project Detail Modal if selected */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};
