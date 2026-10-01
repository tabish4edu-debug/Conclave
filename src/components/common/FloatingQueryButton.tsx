import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { MessageSquare, Phone, Send, X, ArrowUpRight } from 'lucide-react';

export const FloatingQueryButton: React.FC = () => {
  const { settings, setIsQueryModalOpen, setQueryInitialTab } = useStudio();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenEnquiry = () => {
    setIsExpanded(false);
    setQueryInitialTab('enquiry');
    setIsQueryModalOpen(true);
  };

  const cleanWhatsapp = '918981119608';
  const cleanPhone = '+918981119608';

  return (
    <div
      ref={containerRef}
      id="floating-query-container"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto"
    >
      {/* Expanded Quick Options Menu */}
      {isExpanded && (
        <div className="mb-3 w-64 bg-[#202124] border border-[#3A3C3E] p-3 shadow-2xl space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-2 py-1 border-b border-[#3A3C3E] flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold font-mono">
              DIRECT STUDIO DIALOGUE
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#8C8276] hover:text-[#F2EEE7] p-0.5 cursor-pointer"
              aria-label="Close options"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. WhatsApp Action */}
          <a
            href={`https://wa.me/${cleanWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-3 p-2.5 hover:bg-[#2B2D2F] text-[#F2EEE7] transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#2B2D2F] text-[#B08D57] group-hover:bg-[#B08D57] group-hover:text-[#202124] flex items-center justify-center transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold block">
                WhatsApp
              </span>
              <span className="text-[10px] text-[#8C8276] block font-mono">
                Instant Chat Atelier
              </span>
            </div>
          </a>

          {/* 2. Call Action */}
          <a
            href={`tel:${cleanPhone}`}
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-3 p-2.5 hover:bg-[#2B2D2F] text-[#F2EEE7] transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#2B2D2F] text-[#B08D57] group-hover:bg-[#B08D57] group-hover:text-[#202124] flex items-center justify-center transition-colors">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold block">
                Direct Call
              </span>
              <span className="text-[10px] text-[#D6CBBE] block font-mono font-medium tracking-wide">
                +918981119608
              </span>
            </div>
          </a>

          {/* 3. Enquiry Modal Action */}
          <button
            onClick={handleOpenEnquiry}
            className="w-full flex items-center gap-3 p-2.5 hover:bg-[#2B2D2F] text-[#F2EEE7] transition-colors group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#2B2D2F] text-[#B08D57] group-hover:bg-[#B08D57] group-hover:text-[#202124] flex items-center justify-center transition-colors">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold block">
                Enquiry Dossier
              </span>
              <span className="text-[10px] text-[#8C8276] block font-mono">
                Submit Spatial Brief
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        id="floating-query-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Open Studio Consultation Options – Let's Talk"
        aria-expanded={isExpanded}
        className="relative flex items-center gap-2.5 px-5 py-3.5 bg-[#202124] hover:bg-[#2B2D2F] text-[#F2EEE7] border border-[#B08D57] shadow-2xl transition-all duration-300 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-[#B08D57] cursor-pointer"
      >
        {/* Bronze accent dot */}
        <span className="w-2 h-2 rounded-full bg-[#B08D57] animate-pulse" />

        {/* Text */}
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F2EEE7]">
          LET'S TALK
        </span>

        {/* Icon */}
        <div className={`w-5 h-5 rounded-full bg-[#B08D57] text-[#202124] flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'group-hover:rotate-45'}`}>
          {isExpanded ? <X className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
        </div>
      </button>
    </div>
  );
};
