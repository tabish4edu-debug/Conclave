import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStudio } from '../../context/StudioContext';
import { Project } from '../../types';
import { X, MapPin, Calendar, Maximize, ArrowUpRight, Layers, Play } from 'lucide-react';
import { ProjectVideoModal } from './ProjectVideoModal';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const { setIsQueryModalOpen, setQueryInitialTab } = useStudio();
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handleConsultClick = () => {
    onClose();
    setQueryInitialTab('enquiry');
    setIsQueryModalOpen(true);
  };

  const activeImage = project.galleryImages[activeGalleryIndex] || {
    url: project.coverImage,
    alt: project.title,
    caption: '',
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-9999 bg-[#141517]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-8 overflow-y-auto animate-cinematic-backdrop-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-5xl bg-[#202124] text-[#F2EEE7] border border-[#3A3C3E] shadow-2xl overflow-hidden flex flex-col lg:flex-row my-auto max-h-[92vh] lg:max-h-[85vh] animate-cinematic-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column: Visual Monograph & Gallery Carousel */}
        <div className="lg:w-[52%] xl:w-[54%] bg-[#18191B] flex flex-col justify-between p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#3A3C3E]">
          {/* Main Selected Photograph */}
          <div className="relative aspect-[16/11] lg:aspect-[4/3] w-full overflow-hidden bg-[#2B2D2F] border border-[#3A3C3E] shadow-sm flex items-center justify-center">
            <img
              src={activeImage.url || project.coverImage}
              alt={activeImage.alt || project.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {activeImage.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-[#18191B]/85 backdrop-blur-xs px-3.5 py-2 text-[11px] text-[#D6CBBE] font-mono border-t border-[#3A3C3E]/60 truncate">
                {activeImage.caption}
              </div>
            )}
          </div>

          {/* Interactive Thumbnail Strip */}
          <div className="pt-3">
            {project.galleryImages.length > 1 ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {project.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveGalleryIndex(idx)}
                    aria-label={`View photo ${idx + 1} of ${project.title}`}
                    className={`relative flex-shrink-0 w-20 h-13 overflow-hidden border transition-all cursor-pointer ${
                      activeGalleryIndex === idx
                        ? 'border-[#B08D57] ring-1 ring-[#B08D57]'
                        : 'border-[#3A3C3E] opacity-55 hover:opacity-100 hover:border-[#8C8276]'
                    }`}
                  >
                    <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-[11px] font-mono text-[#8C8276] uppercase tracking-wider flex items-center justify-between">
                <span>ARCHITECTURAL PHOTOGRAPHY</span>
                <span className="text-[#B08D57]">PRIMARY MONOGRAPH</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Monograph Narrative, Metrics, Materials & Studio Actions */}
        <div className="lg:w-[48%] xl:w-[46%] p-5 sm:p-6 lg:p-7 flex flex-col justify-between space-y-4 overflow-y-auto lg:overflow-visible">
          {/* Header Bar: Category, Location & Close Button */}
          <div className="flex items-center justify-between gap-3 border-b border-[#3A3C3E] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 text-[10px] tracking-[0.2em] uppercase font-semibold bg-[#2B2D2F] text-[#B08D57] border border-[#B08D57]/40 font-mono">
                {project.category}
              </span>
              <span className="text-[11px] text-[#8C8276] font-mono">
                {project.year} · {project.location}
              </span>
            </div>

            <button
              onClick={onClose}
              type="button"
              aria-label="Close monograph"
              className="p-1.5 text-[#D6CBBE] hover:text-[#F2EEE7] hover:bg-[#2B2D2F] transition-colors border border-transparent hover:border-[#3A3C3E] cursor-pointer rounded-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Core Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2
                id="project-modal-title"
                className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7] font-normal leading-tight"
              >
                {project.title}
              </h2>
            </div>

            <p className="text-xs sm:text-[13px] text-[#D6CBBE] font-light leading-relaxed line-clamp-3">
              {project.description}
            </p>

            {project.architecturalBrief && (
              <p className="text-[11px] text-[#8C8276] font-light italic border-l border-[#B08D57] pl-2.5 py-0.5 line-clamp-2">
                "{project.architecturalBrief}"
              </p>
            )}
          </div>

          {/* Compact 2x2 Spatial Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#3A3C3E]">
            <div className="p-2 bg-[#2B2D2F]/80 border border-[#3A3C3E]">
              <span className="text-[9px] tracking-widest uppercase text-[#B08D57] block font-mono">LOCATION</span>
              <span className="text-xs font-medium text-[#F2EEE7] flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-[#B08D57] flex-shrink-0" /> {project.location}
              </span>
            </div>

            <div className="p-2 bg-[#2B2D2F]/80 border border-[#3A3C3E]">
              <span className="text-[9px] tracking-widest uppercase text-[#B08D57] block font-mono">COMPLETION</span>
              <span className="text-xs font-medium text-[#F2EEE7] flex items-center gap-1 mt-0.5 truncate">
                <Calendar className="w-3 h-3 text-[#B08D57] flex-shrink-0" /> {project.year}
              </span>
            </div>

            <div className="p-2 bg-[#2B2D2F]/80 border border-[#3A3C3E]">
              <span className="text-[9px] tracking-widest uppercase text-[#B08D57] block font-mono">SPATIAL VOLUME</span>
              <span className="text-xs font-medium text-[#F2EEE7] flex items-center gap-1 mt-0.5 truncate">
                <Maximize className="w-3 h-3 text-[#B08D57] flex-shrink-0" />
                {project.areaSqFt ? `${project.areaSqFt.toLocaleString()} sq ft` : 'Bespoke Scale'}
              </span>
            </div>

            <div className="p-2 bg-[#2B2D2F]/80 border border-[#3A3C3E]">
              <span className="text-[9px] tracking-widest uppercase text-[#B08D57] block font-mono">EXECUTION</span>
              <span className="text-xs font-medium text-[#F2EEE7] flex items-center gap-1 mt-0.5 truncate">
                <Layers className="w-3 h-3 text-[#B08D57] flex-shrink-0" /> Turnkey Architecture
              </span>
            </div>
          </div>

          {/* Materials & Finishes Tags */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase tracking-widest text-[#B08D57] font-mono block">
              MATERIAL SPECIFICATION
            </span>
            <div className="flex flex-wrap gap-1.5">
              {project.materialsPalette.slice(0, 4).map((mat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] bg-[#2B2D2F] text-[#D6CBBE] border border-[#3A3C3E] font-mono"
                >
                  {mat}
                </span>
              ))}
            </div>
          </div>

          {/* Studio Actions Bar */}
          <div className="pt-3 border-t border-[#3A3C3E] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                type="button"
                className="px-3.5 py-2 border border-[#3A3C3E] hover:border-[#B08D57] text-[#D6CBBE] text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>

              {project.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#B08D57] bg-[#B08D57]/15 hover:bg-[#B08D57] text-[#B08D57] hover:text-[#202124] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-semibold"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Walkthrough Film</span>
                </button>
              )}
            </div>

            <button
              onClick={handleConsultClick}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <span>Enquire for Similar Space</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showVideo && (
        <ProjectVideoModal
          project={project}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
