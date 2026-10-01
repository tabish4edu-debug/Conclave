import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Project } from '../../types';
import { X, MapPin, Calendar, Maximize, ArrowUpRight, Layers } from 'lucide-react';
import { PlaceholderBadge } from '../../components/common/PlaceholderBadge';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const { setIsQueryModalOpen, setQueryInitialTab } = useStudio();
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const handleConsultClick = () => {
    onClose();
    setQueryInitialTab('enquiry');
    setIsQueryModalOpen(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 bg-[#202124]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-[#202124] text-[#F2EEE7] border border-[#3A3C3E] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A3C3E] bg-[#2B2D2F]/80">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase font-semibold bg-[#202124] text-[#B08D57] border border-[#B08D57]/40 font-mono">
              {project.category}
            </span>
            <span className="text-xs text-[#8C8276] font-mono tracking-wider">
              {project.year} · {project.location}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close project monograph"
            className="p-2 text-[#D6CBBE] hover:text-[#F2EEE7] hover:bg-[#2B2D2F] transition-colors border border-transparent hover:border-[#3A3C3E] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 md:p-10 space-y-10">
          {/* Title & Spatial Specs */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 id="project-modal-title" className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-light text-[#F2EEE7]">
                {project.title}
              </h2>
              <PlaceholderBadge label="Client Placeholder Project" variant="subtle" />
            </div>

            <p className="text-base sm:text-lg text-[#D6CBBE] max-w-3xl font-light leading-relaxed">
              {project.description}
            </p>

            {/* Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#3A3C3E]">
              <div className="p-3 bg-[#2B2D2F] border border-[#3A3C3E]">
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-mono">Location</span>
                <span className="text-sm font-medium text-[#F2EEE7] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B08D57]" /> {project.location}
                </span>
              </div>
              <div className="p-3 bg-[#2B2D2F] border border-[#3A3C3E]">
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-mono">Year Completed</span>
                <span className="text-sm font-medium text-[#F2EEE7] flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-[#B08D57]" /> {project.year}
                </span>
              </div>
              <div className="p-3 bg-[#2B2D2F] border border-[#3A3C3E]">
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-mono">Spatial Volume</span>
                <span className="text-sm font-medium text-[#F2EEE7] flex items-center gap-1 mt-1">
                  <Maximize className="w-3.5 h-3.5 text-[#B08D57]" /> {project.areaSqFt ? `${project.areaSqFt.toLocaleString()} sq ft` : 'Bespoke Scale'}
                </span>
              </div>
              <div className="p-3 bg-[#2B2D2F] border border-[#3A3C3E]">
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-mono">Curation Type</span>
                <span className="text-sm font-medium text-[#F2EEE7] flex items-center gap-1 mt-1">
                  <Layers className="w-3.5 h-3.5 text-[#B08D57]" /> Turnkey Architecture
                </span>
              </div>
            </div>
          </div>

          {/* Featured Image Showcase */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#2B2D2F] border border-[#3A3C3E]">
              <img
                src={project.galleryImages[activeGalleryIndex]?.url || project.coverImage}
                alt={project.galleryImages[activeGalleryIndex]?.alt || project.title}
                className="w-full h-full object-cover"
              />
              {project.galleryImages[activeGalleryIndex]?.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-[#202124]/85 backdrop-blur-xs p-3 text-xs text-[#D6CBBE] font-mono">
                  {project.galleryImages[activeGalleryIndex].caption}
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {project.galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {project.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGalleryIndex(idx)}
                    className={`relative flex-shrink-0 w-24 aspect-[16/10] overflow-hidden border transition-all cursor-pointer ${
                      activeGalleryIndex === idx
                        ? 'border-[#B08D57] scale-105'
                        : 'border-[#3A3C3E] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Architectural Brief & Materials Palette */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 border-t border-[#3A3C3E]">
            <div className="md:col-span-7 space-y-3">
              <h3 className="font-serif-title text-2xl text-[#F2EEE7]">Architectural Brief</h3>
              <p className="text-sm sm:text-base text-[#D6CBBE] font-light leading-relaxed">
                {project.architecturalBrief}
              </p>
            </div>

            <div className="md:col-span-5 space-y-3">
              <h3 className="font-serif-title text-xl text-[#F2EEE7]">Materials & Finishes</h3>
              <div className="flex flex-wrap gap-2">
                {project.materialsPalette.map((mat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-xs bg-[#2B2D2F] text-[#D6CBBE] border border-[#3A3C3E] flex items-center gap-1.5 font-mono"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" />
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-4 border-t border-[#3A3C3E] bg-[#2B2D2F]/80 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-[#8C8276] font-mono">
            Conclave Interiors Architectural Monograph · Case Reference
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#3A3C3E] text-[#D6CBBE] text-xs uppercase tracking-wider hover:border-[#B08D57] cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleConsultClick}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Enquire for Similar Space</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
