import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { ArrowUpRight } from 'lucide-react';
import { useParallax } from '../../hooks/useParallax';

export const CtaSection: React.FC = () => {
  const { setIsQueryModalOpen, setQueryInitialTab } = useStudio();

  // Slow cinematic background parallax
  const [bgRef, { translateY: bgTranslateY, scale: bgScale }] = useParallax<HTMLDivElement>({
    speed: 0.18,
    clampPx: 120,
    scaleStart: 1.08,
    scaleEnd: 1.0,
  });

  // Foreground image frame counter-depth parallax
  const [frameRef, { translateY: frameTranslateY }] = useParallax<HTMLDivElement>({
    speed: -0.10,
    clampPx: 35,
  });

  const handleBeginProject = () => {
    setQueryInitialTab('enquiry');
    setIsQueryModalOpen(true);
  };

  return (
    <section
      id="cta-section"
      aria-label="Begin Your Project with Conclave Interiors"
      className="relative py-28 md:py-36 bg-[#202124] text-[#F2EEE7] overflow-hidden border-t border-[#3A3C3E]"
    >
      {/* 1. Underlying Large Architectural Parallax Background Canvas */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="absolute -top-24 -bottom-24 left-0 right-0 overflow-hidden pointer-events-none select-none will-change-transform opacity-30"
        style={{
          transform: `translate3d(0, ${bgTranslateY}px, 0) scale(${bgScale})`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
          alt="Architectural interior sanctuary backdrop"
          loading="lazy"
          className="w-full h-full object-cover object-center filter grayscale-[30%] contrast-[1.1]"
        />
        {/* Softening Gradient Scrims ensuring monumental depth without sacrificing contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#202124] via-[#202124]/90 to-[#202124]/75" />
      </div>

      {/* Decorative Hairline Grid Element */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#F2EEE7_1px,transparent_1px),linear-gradient(to_bottom,#F2EEE7_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Monumental Editorial Statement */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold font-mono">
                COMMISSION INITIATION
              </span>
            </div>

            <h2 className="font-serif-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-[#F2EEE7] leading-[1.04] tracking-tight text-balance">
              READY TO TRANSFORM <br />
              <span className="italic font-light text-[#B08D57]">YOUR SPACE?</span>
            </h2>

            <p className="text-base sm:text-lg text-[#D6CBBE] font-light max-w-xl leading-relaxed">
              We accept a limited number of private residential and executive commissions each season to ensure obsessive detailing, raw materiality, and quiet architectural luxury.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-5">
              <button
                onClick={handleBeginProject}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Begin Your Project</span>
                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-4 border border-[#3A3C3E] hover:border-[#B08D57] text-[#D6CBBE] hover:text-[#F2EEE7] text-xs uppercase tracking-[0.18em] transition-all bg-[#2B2D2F]/60 backdrop-blur-xs"
              >
                <span>Explore Portfolio</span>
              </a>
            </div>

            {/* Architectural Reassurance Points */}
            <div className="pt-8 border-t border-[#3A3C3E] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#8C8276]">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-mono">
                  TURNKEY SCOPE
                </span>
                <span className="mt-0.5 block text-xs font-light text-[#F2EEE7]">
                  Concept to White-Glove Handover
                </span>
              </div>
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-mono">
                  MATERIAL FIDELITY
                </span>
                <span className="mt-0.5 block text-xs font-light text-[#F2EEE7]">
                  Authentic Timber, Stone & Brass
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-mono">
                  PRIVATE ATELIER
                </span>
                <span className="mt-0.5 block text-xs font-light text-[#F2EEE7]">
                  Direct Director Engagement
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Large Architectural Interior Photograph with Sculptural Frame and Parallax */}
          <div
            ref={frameRef}
            className="lg:col-span-5 relative will-change-transform"
            style={{
              transform: `translate3d(0, ${frameTranslateY}px, 0)`,
            }}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden shadow-2xl border border-[#3A3C3E] bg-[#2B2D2F] group">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
                alt="Conclave Interiors Architectural Residence"
                loading="lazy"
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#202124]/90 via-[#202124]/30 to-transparent" />

              {/* Floating Architectural Annotation Card */}
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-[#2B2D2F]/90 backdrop-blur-md border border-[#3A3C3E] space-y-1">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold block font-mono">
                  ATELIER MONOGRAPH REF. 04
                </span>
                <h4 className="font-serif-title text-xl text-[#F2EEE7] font-light">
                  Bespoke Architectural Residence
                </h4>
                <p className="text-[11px] text-[#8C8276] font-light">
                  Natural limestone, fumed oak joinery, and shadowline reveals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
