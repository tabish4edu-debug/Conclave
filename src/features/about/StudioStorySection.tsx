import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { PlaceholderBadge } from '../../components/common/PlaceholderBadge';
import { useParallax } from '../../hooks/useParallax';

export const StudioStorySection: React.FC = () => {
  const { about, projects, stripItems, mediaItems, setIsQueryModalOpen, setQueryInitialTab } = useStudio();

  // Background architectural interior parallax layer in the back
  const [bgRef, { translateY: bgTranslateY, scale: bgScale }] = useParallax<HTMLDivElement>({
    speed: 0.22,
    clampPx: 110,
    scaleStart: 1.12,
    scaleEnd: 1.0,
  });

  // Secondary midground architectural parallax layer fetched from the CMS repository
  const [secondaryRef, { translateY: secondaryY, scale: secondaryScale }] = useParallax<HTMLDivElement>({
    speed: 0.32,
    clampPx: 65,
    scaleStart: 1.08,
    scaleEnd: 1.0,
  });

  // Subtle vertical parallax and scale for designer portrait
  const [photoRef, { translateY: photoY, scale: photoScale }] = useParallax<HTMLDivElement>({
    speed: 0.12,
    clampPx: 35,
    scaleStart: 1.07,
    scaleEnd: 1.0,
  });

  // Secondary image fetched from existing CMS image repository
  const secondaryCmsImage =
    mediaItems[0]?.url ||
    stripItems[1]?.imageUrl ||
    projects[1]?.coverImage ||
    stripItems[0]?.imageUrl ||
    projects[0]?.coverImage ||
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85';

  return (
    <section
      id="about"
      aria-label="About Conclave Interiors"
      className="relative overflow-hidden py-28 bg-[#EFEBE4] text-[#202124] border-t border-[#D6CBBE]"
    >
      {/* Prominent Architectural Interior Parallax Layer in the back */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="absolute -top-32 -bottom-32 left-0 right-0 pointer-events-none will-change-transform z-0"
        style={{
          transform: `translate3d(0, ${bgTranslateY}px, 0) scale(${bgScale})`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=85"
          alt="Architectural interior volume with double-height timber ceilings and natural light"
          className="w-full h-full object-cover object-center opacity-65 filter contrast-[1.08] brightness-[0.98]"
        />
        {/* Subtle luminous tint to maintain editorial contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F2EEE7]/70 via-[#EFEBE4]/50 to-[#F2EEE7]/75" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 space-y-24">
        {/* Top Editorial Introduction & Designer Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Philosophy & Statement */}
          <div className="lg:col-span-6 space-y-7 bg-[#F2EEE7]/90 backdrop-blur-md p-8 sm:p-10 border border-[#D6CBBE] shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold font-mono">
                STUDIO MANIFESTO & PHILOSOPHY
              </span>
            </div>

            <h2 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-light text-[#202124] leading-[1.06] tracking-tight text-balance">
              SPACES DESIGNED TO DECOMPRESS THE MIND.
            </h2>

            <p className="text-base sm:text-lg text-[#202124]/90 font-light leading-relaxed">
              {about.studioIntro}
            </p>

            <p className="text-sm sm:text-base text-[#8C8276] font-light leading-relaxed">
              {about.philosophyBody}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => {
                  setQueryInitialTab('enquiry');
                  setIsQueryModalOpen(true);
                }}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#202124] hover:bg-[#2B2D2F] text-[#F2EEE7] text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-sm cursor-pointer"
              >
                <span>Request Studio Monograph</span>
                <ArrowUpRight className="w-4 h-4 text-[#B08D57] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Designer Portrait & Bio Box with Midground Parallax Depth Plate */}
          <div className="lg:col-span-6 relative">
            {/* Secondary Midground Parallax Layer from CMS Image Repository */}
            <div
              ref={secondaryRef}
              aria-hidden="true"
              className="hidden sm:block absolute -top-10 -right-4 lg:-top-14 lg:-right-8 w-56 sm:w-64 lg:w-76 aspect-3/4 pointer-events-none will-change-transform z-0 overflow-hidden shadow-2xl border border-[#B08D57]/60 bg-[#202124]"
              style={{
                transform: `translate3d(0, ${secondaryY}px, 0) scale(${secondaryScale})`,
              }}
            >
              <img
                src={secondaryCmsImage}
                alt="CMS Architectural Study Reference"
                className="w-full h-full object-cover object-center filter contrast-[1.08] brightness-[0.95]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#202124]/75 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] font-mono text-[#D6CBBE]">
                <span className="text-[#B08D57]">CMS MONOGRAPH REF</span>
                <span>ARCHITECTURAL DEPTH</span>
              </div>
            </div>

            <div className="relative z-10 bg-[#F2EEE7] border border-[#D6CBBE] p-6 sm:p-8 space-y-6 shadow-sm">
              <div
                ref={photoRef}
                className="relative aspect-[4/3] w-full overflow-hidden bg-[#D6CBBE]"
              >
                <div
                  className="absolute -top-4 -bottom-4 left-0 right-0 will-change-transform"
                  style={{
                    transform: `translate3d(0, ${photoY}px, 0) scale(${photoScale})`,
                  }}
                >
                  <img
                    src={about.designerPhoto}
                    alt={about.designerName}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale contrast-105"
                  />
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <PlaceholderBadge label="Designer Biography Placeholder — Replace in CMS" variant="compact" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#D6CBBE] pb-3">
                  <h3 className="font-serif-title text-2xl text-[#202124]">
                    {about.designerName}
                  </h3>
                  <span className="text-[11px] tracking-widest uppercase text-[#B08D57] font-semibold font-mono">
                    {about.designerRole}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#8C8276] font-light leading-relaxed">
                  {about.designerBio}
                </p>

                <div className="pt-2 text-[10px] tracking-wider uppercase text-[#B08D57] flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
                  <span>Verified Architectural Studio Framework</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Architectural Influences */}
        <div className="pt-12 border-t border-[#D6CBBE]">
          <div className="space-y-3 mb-12 text-center md:text-left">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold font-mono">
                VISUAL GENOME & AESTHETIC HARMONY
              </span>
            </div>
            <h3 className="font-serif-title text-3xl sm:text-4xl text-[#202124] font-light">
              Four Pillars of Conclave Interiors
            </h3>
            <p className="text-sm text-[#8C8276] max-w-2xl font-light">
              We do not impose repetitive templates. Our language synthesizes four atmospheric poles into a unified architectural expression for each client commission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.influences.map((inf, idx) => (
              <div
                key={idx}
                className="bg-[#F2EEE7] hover:bg-[#F2EEE7] border border-[#D6CBBE] hover:border-[#B08D57] p-7 space-y-4 transition-all duration-300 group shadow-xs"
              >
                <div className="w-10 h-10 border border-[#B08D57] flex items-center justify-center bg-[#202124] text-[#B08D57] group-hover:bg-[#B08D57] group-hover:text-[#202124] transition-colors">
                  <span className="font-serif-title text-sm font-semibold">0{idx + 1}</span>
                </div>

                <h4 className="font-serif-title text-xl text-[#202124]">
                  {inf.title}
                </h4>

                <p className="text-xs sm:text-sm text-[#8C8276] font-light leading-relaxed">
                  {inf.description}
                </p>

                <div className="pt-3 border-t border-[#D6CBBE] text-[11px] text-[#B08D57] font-mono">
                  {inf.paletteNotes}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Studio Precision Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-y border-[#D6CBBE] bg-[#F2EEE7] p-8 shadow-xs">
          {about.studioStats.map((stat, idx) => (
            <div key={idx} className="space-y-1 text-center md:text-left">
              <span className="font-serif-title text-4xl sm:text-5xl font-light text-[#B08D57] block">
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#202124] block">
                {stat.label}
              </span>
              <span className="text-[11px] text-[#8C8276] block font-mono">
                {stat.sublabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
