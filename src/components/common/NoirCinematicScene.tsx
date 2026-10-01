import React from 'react';
import { useParallax } from '../../hooks/useParallax';
import { useStudio } from '../../context/StudioContext';
import { ArrowUpRight, Compass, Sparkles, ShieldCheck } from 'lucide-react';

export const NoirCinematicScene: React.FC = () => {
  const { setIsQueryModalOpen, setQueryInitialTab } = useStudio();

  const [containerRef, { translateY, scale }] = useParallax<HTMLElement>({
    speed: 0.28,
    clampPx: 180,
    scaleStart: 1.10,
    scaleEnd: 1.0,
  });

  const handleConsultation = () => {
    setQueryInitialTab('enquiry');
    setIsQueryModalOpen(true);
  };

  return (
    <section
      id="noir-cinematic-sanctuary"
      ref={containerRef}
      aria-label="The Noir Atelier — Monumental Dark Architectural Scene"
      className="relative w-full min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#18191B] text-[#F2EEE7] select-none py-28"
    >
      {/* 1. Underlying Monumental Architectural Canvas with Parallax & Subtle Zoom */}
      <div
        className="absolute -top-32 -bottom-32 left-0 right-0 will-change-transform pointer-events-none"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2200&q=85"
          alt="Atmospheric double-height loft with blackened steel and warm stone neutrals"
          loading="lazy"
          className="w-full h-full object-cover object-center filter grayscale-[15%] contrast-[1.18] brightness-[0.78]"
        />

        {/* Deep Chiaroscuro Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#18191B] via-transparent to-[#18191B] opacity-80" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#18191B]/60 to-[#18191B]/95" />
      </div>

      {/* 2. Top and Bottom Atmospheric Transition Dissolves */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#202124] to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#202124] to-transparent pointer-events-none z-10" />

      {/* 3. Hairline Grid Overlay in Patinated Bronze */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-10 bg-[linear-gradient(to_right,#B08D57_1px,transparent_1px),linear-gradient(to_bottom,#B08D57_1px,transparent_1px)] bg-[size:5rem_5rem]"
      />

      {/* 4. Foreground Content Composition */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 md:px-10 lg:px-12 text-center flex flex-col items-center space-y-10">
        {/* Kicker badge */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#202124]/80 backdrop-blur-md rounded-xs border border-[#B08D57]/50 shadow-md">
          <span className="w-6 h-px bg-[#B08D57]" />
          <span className="text-[10px] sm:text-xs tracking-[0.35em] uppercase font-mono font-semibold text-[#B08D57]">
            ATMOSPHERIC SPECIALIZATION · NOIR ATELIER
          </span>
          <span className="w-6 h-px bg-[#B08D57]" />
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl">
          <h2 className="font-serif-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-[#F2EEE7] leading-[1.04] text-balance">
            THE ARCHITECTURE <br className="hidden sm:inline" />
            <span className="italic font-serif font-light text-[#D6CBBE]">OF SHADOW & STONE</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#D6CBBE]/85 max-w-2xl mx-auto font-light leading-relaxed">
            Shadow is not the absence of illumination, but its disciplined framing. We curate private residences where smoked European timber, charred steel, and honed travertine cultivate an aura of acoustic stillness.
          </p>
        </div>

        {/* Tri-Column Specification Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-4 text-left">
          <div className="p-6 bg-[#202124]/75 backdrop-blur-md border border-[#3A3C3E] space-y-2">
            <span className="text-[10px] tracking-widest text-[#B08D57] font-mono uppercase block">
              MATERIAL DISCIPLINE
            </span>
            <h4 className="font-serif-title text-xl text-[#F2EEE7]">Charred Shou Sugi Ban</h4>
            <p className="text-xs text-[#D6CBBE]/70 leading-relaxed font-light">
              Traditional flame-patinated wood shutters that absorb unwanted reflections and ground the spatial envelope.
            </p>
          </div>

          <div className="p-6 bg-[#202124]/75 backdrop-blur-md border border-[#3A3C3E] space-y-2">
            <span className="text-[10px] tracking-widest text-[#B08D57] font-mono uppercase block">
              LUMINOUS ARCHITECTURE
            </span>
            <h4 className="font-serif-title text-xl text-[#F2EEE7]">2700K Low-Glare Optic</h4>
            <p className="text-xs text-[#D6CBBE]/70 leading-relaxed font-light">
              Concealed warm cove illumination engineered to emulate natural twilight and quiet the human nervous system.
            </p>
          </div>

          <div className="p-6 bg-[#202124]/75 backdrop-blur-md border border-[#3A3C3E] space-y-2">
            <span className="text-[10px] tracking-widest text-[#B08D57] font-mono uppercase block">
              TACTILE ACCENTS
            </span>
            <h4 className="font-serif-title text-xl text-[#F2EEE7]">Unlacquered Bronze</h4>
            <p className="text-xs text-[#D6CBBE]/70 leading-relaxed font-light">
              Living architectural hardware that acquires a bespoke patina through decades of gentle domestic touch.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-5">
          <button
            onClick={handleConsultation}
            className="px-8 py-4 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs tracking-widest uppercase transition-all duration-300 shadow-xl cursor-pointer flex items-center gap-3"
          >
            <span>Commission A Noir Sanctuary</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <a
            href="#projects"
            className="px-6 py-4 bg-transparent hover:bg-[#F2EEE7]/10 text-[#F2EEE7] border border-[#3A3C3E] text-xs tracking-widest uppercase transition-all duration-300 font-mono"
          >
            View Noir Monograph Projects
          </a>
        </div>
      </div>
    </section>
  );
};
