import React, { useState, useEffect, useRef } from 'react';
import { useStudio } from '../../context/StudioContext';
import { ArrowRight, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { heroSlides, isPreviewMode, settings, setIsQueryModalOpen, setQueryInitialTab } = useStudio();

  // Published slides or all slides in preview mode
  const slides = (isPreviewMode ? heroSlides : heroSlides.filter((s) => s.isPublished)).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);

  // Fallback slide if slides array is empty
  const currentSlide = slides[currentIndex] || slides[0] || {
    id: 'hero-1',
    label: 'INTERIOR DESIGN & BUILD',
    headline: 'Beautiful Interiors For Modern Living',
    supportingText:
      'We create functional and aesthetic spaces that reflect your personality and lifestyle. From concept to completion, with quality, durability and timely execution.',
    primaryCtaText: 'View Projects',
    primaryCtaLink: '#projects',
    secondaryCtaText: 'Watch Our Video',
    secondaryCtaLink: '#about',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Luxury warm contemporary kitchen interior with marble island and bar stools',
    projectTag: 'Residential & Commercial | Turnkey Projects',
  };

  // Subtle background parallax: Image moves at ~78% speed of page movement (slower by 22%)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            // Only update when hero is near or in viewport
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
              const scrolled = Math.max(0, -rect.top);
              // ~22% translation offset gives an effective ~78% relative movement
              setParallaxY(Math.min(scrolled * 0.22, 180));
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance hero slides (pauses on hover or when video modal is open)
  useEffect(() => {
    if (slides.length <= 1 || isHovered || isVideoModalOpen) return;
    const intervalSeconds = settings.heroIntervalSeconds || 6;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [slides.length, isHovered, isVideoModalOpen, settings.heroIntervalSeconds]);

  const handlePrevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleCtaClick = (link: string) => {
    if (link === '#contact') {
      setQueryInitialTab('enquiry');
      setIsQueryModalOpen(true);
    } else {
      const el = document.querySelector(link);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const videoUrl = currentSlide.videoUrl || settings.youtubeUrl;

  return (
    <section
      ref={sectionRef}
      id="hero-cinematic"
      aria-label="Conclave Interior Hero Showcase"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full overflow-hidden bg-[#F2EEE7] text-[#202124] pt-28 lg:pt-36 pb-20 lg:pb-28 min-h-[88vh] flex items-center"
    >
      {/* ========================================================================= */}
      {/* 1. BACKGROUND: LARGE PREMIUM INTERIOR PHOTOGRAPHY WITH RESTING PARALLAX */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
      >
        {/* Parallax Image Canvas with generous buffer to prevent edge-clipping */}
        <div
          className="absolute -top-12 -left-6 -right-6 -bottom-16 transition-transform duration-100 ease-out will-change-transform"
          style={{
            transform: `translate3d(0, ${parallaxY}px, 0)`,
          }}
        >
          {slides.map((slide, idx) => {
            const isSlideActive = idx === currentIndex;
            return (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isSlideActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.imageAlt || slide.headline}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover object-center scale-102"
                />
              </div>
            );
          })}
        </div>

        {/* Sophisticated Architectural Editorial Scrim:
            Ensures text readability while allowing interior architecture to breathe */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F2EEE7]/98 via-[#F2EEE7]/90 to-[#F2EEE7]/45 lg:via-[#F2EEE7]/85 lg:to-[#F2EEE7]/35" />

        {/* Subtle Bottom Section Blending Scrim */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#F2EEE7] via-[#F2EEE7]/80 to-transparent" />

        {/* Architectural Grid Watermark / Subtle Texture */}
        <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#202124_1px,transparent_1px),linear-gradient(to_bottom,#202124_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]" />
      </div>

      {/* ========================================================================= */}
      {/* 2. FOREGROUND: VISUALLY STABLE TYPOGRAPHY, CTAS, STATS & SLIDER CONTROLS  */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Headline, Subtitle, CTAs & Proof Bar */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-7">
            {/* Eyebrow with Champagne Bronze line */}
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-8 bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.25em] uppercase text-[#B08D57] font-bold font-mono">
                {currentSlide.label || 'INTERIOR DESIGN & BUILD'}
              </span>
            </div>

            {/* High-Contrast Serif Headline: Beautiful Interiors For Modern Living */}
            <h1 className="font-serif-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-normal tracking-tight text-[#202124] leading-[1.06] text-balance">
              {currentSlide.headline.includes('Modern Living') ? (
                <>
                  Beautiful Interiors <br />
                  <span className="text-[#B08D57] italic font-normal">
                    For Modern Living
                  </span>
                </>
              ) : (
                currentSlide.headline
              )}
            </h1>

            {/* Subtitle Tagline */}
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#2B2D2F] uppercase font-mono">
              {currentSlide.projectTag || 'Residential & Commercial  |  Turnkey Projects'}
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#8C8276] font-light leading-relaxed max-w-xl">
              {currentSlide.supportingText}
            </p>

            {/* Action Buttons: View Projects & Watch Our Video */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleCtaClick(currentSlide.primaryCtaLink || '#projects')}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#202124] hover:bg-[#2B2D2F] text-[#F2EEE7] font-semibold text-xs rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>{currentSlide.primaryCtaText || 'View Projects'}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-[#B08D57]" />
              </button>

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#D6CBBE]/45 hover:bg-[#D6CBBE]/70 text-[#202124] font-semibold text-xs rounded-full border border-[#D6CBBE] transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#B08D57] shadow-xs group-hover:scale-105 transition-transform">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Watch Our Video</span>
              </button>
            </div>

            {/* Proof Bar: 3 Avatars + 250+ Happy Clients | 10+ Years Experience | 20+ Turnkey Projects */}
            <div className="pt-6 border-t border-[#D6CBBE] flex flex-wrap items-center gap-6 sm:gap-8">
              {/* Avatars + Clients */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Client"
                    className="w-8 h-8 rounded-full border-2 border-[#F2EEE7] object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Client"
                    className="w-8 h-8 rounded-full border-2 border-[#F2EEE7] object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                    alt="Client"
                    className="w-8 h-8 rounded-full border-2 border-[#F2EEE7] object-cover"
                  />
                </div>
                <div>
                  <span className="font-serif-title text-xl font-bold text-[#202124] block leading-none">
                    250+
                  </span>
                  <span className="text-[10px] text-[#8C8276] font-medium block mt-0.5">
                    Happy Clients
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-[#D6CBBE] hidden sm:block" />

              {/* 10+ Years */}
              <div>
                <span className="font-serif-title text-xl font-bold text-[#202124] block leading-none">
                  10+
                </span>
                <span className="text-[10px] text-[#8C8276] font-medium block mt-0.5">
                  Years Experience
                </span>
              </div>

              <div className="h-8 w-px bg-[#D6CBBE] hidden sm:block" />

              {/* 20+ Turnkey */}
              <div>
                <span className="font-serif-title text-xl font-bold text-[#202124] block leading-none">
                  20+
                </span>
                <span className="text-[10px] text-[#8C8276] font-medium block mt-0.5">
                  Turnkey Projects
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Monograph Showcase Frame with Slide Carousel Navigation */}
          <div
            className="lg:col-span-5 xl:col-span-5 relative transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `translate3d(0, ${-parallaxY * 0.32}px, 0)`,
            }}
          >
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[1.12/1] w-full overflow-hidden rounded-l-[120px] sm:rounded-l-[180px] lg:rounded-l-[210px] rounded-r-3xl shadow-xl border-4 border-[#F2EEE7] bg-[#D6CBBE] group">
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.imageAlt || currentSlide.headline}
                loading="eager"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104"
              />

              {/* Subtle vignette scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#202124]/75 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Right Floating Atelier Seal: "Design Build Live Better" + Video Play Button */}
              <div className="absolute bottom-5 right-6 flex items-center gap-3 z-10 text-white">
                <div className="text-right">
                  <span className="block font-serif-title text-sm sm:text-base font-semibold leading-tight text-[#F2EEE7]">
                    Design
                  </span>
                  <span className="block font-serif-title text-sm sm:text-base font-semibold leading-tight text-[#F2EEE7]">
                    Build
                  </span>
                  <span className="block text-[10px] sm:text-xs text-[#D6CBBE] font-light mt-0.5">
                    Live Better
                  </span>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  aria-label="Play Atelier Film"
                  className="w-10 h-10 rounded-full border border-[#B08D57]/70 bg-[#202124]/80 backdrop-blur-xs flex items-center justify-center hover:scale-105 hover:border-[#B08D57] transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-[#B08D57] text-[#B08D57] ml-0.5" />
                </button>
              </div>

              {/* Live Slide Index Badge */}
              {slides.length > 1 && (
                <div className="absolute top-4 right-5 z-10">
                  <span className="px-2.5 py-1 text-[10px] font-mono font-semibold tracking-widest text-[#F2EEE7] bg-[#202124]/80 backdrop-blur-xs border border-[#3A3C3E]">
                    0{currentIndex + 1} / 0{slides.length}
                  </span>
                </div>
              )}
            </div>

            {/* Slider Navigation Controls (Refined Architectural Arrows & Indicators) */}
            {slides.length > 1 && (
              <div className="mt-5 flex items-center justify-between px-2">
                {/* Slide indicator dots / lines */}
                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Jump to slide 0${idx + 1}`}
                      className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                        currentIndex === idx
                          ? 'w-8 bg-[#B08D57]'
                          : 'w-2 bg-[#D6CBBE] hover:bg-[#8C8276]'
                      }`}
                    />
                  ))}
                </div>

                {/* Previous & Next Chevron Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSlide}
                    aria-label="Previous Slide"
                    className="w-8 h-8 rounded-full border border-[#D6CBBE] bg-[#F2EEE7] hover:border-[#B08D57] hover:text-[#B08D57] text-[#202124] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    aria-label="Next Slide"
                    className="w-8 h-8 rounded-full border border-[#D6CBBE] bg-[#F2EEE7] hover:border-[#B08D57] hover:text-[#B08D57] text-[#202124] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal (Conclave Atelier Film) */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#202124] border border-[#2B2D2F] max-w-3xl w-full p-6 space-y-4 shadow-2xl relative rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#2B2D2F] pb-3">
              <h3 className="font-serif-title text-sm tracking-wider text-[#F2EEE7]">
                Conclave Interior Atelier Film
              </h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-[#D6CBBE] hover:text-[#B08D57] p-1 cursor-pointer"
                aria-label="Close Video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-[#2B2D2F] relative flex items-center justify-center overflow-hidden rounded-lg">
              {videoUrl && videoUrl.includes('youtube.com') ? (
                <iframe
                  src={videoUrl.replace('watch?v=', 'embed/')}
                  title="Conclave Interior Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm')) ? (
                <video src={videoUrl} controls autoPlay className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <Play className="w-12 h-12 text-[#B08D57] mx-auto animate-pulse" />
                  <p className="font-serif-title text-lg text-[#F2EEE7]">
                    Conclave Studio Cinematic Reel
                  </p>
                  <p className="text-xs text-[#8C8276] max-w-md mx-auto">
                    Atmospheric architectural walkthroughs and turnkey design executions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
