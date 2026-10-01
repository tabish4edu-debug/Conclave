import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { Star, MessageSquarePlus, ShieldCheck, Quote } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { useParallax } from '../../hooks/useParallax';

export const TestimonialsSection: React.FC = () => {
  const { testimonials, isFeedbackModalOpen, setIsFeedbackModalOpen } = useStudio();

  // Subtle atmospheric background parallax
  const [bgRef, { translateY }] = useParallax<HTMLDivElement>({
    speed: 0.14,
    clampPx: 80,
  });

  // ONLY APPROVED feedback can appear publicly!
  const approvedTestimonials = testimonials.filter((t) => t.status === 'APPROVED');

  return (
    <section
      id="testimonials"
      aria-label="Client Testimonials"
      className="relative py-28 bg-[#202124] text-[#F2EEE7] border-t border-[#3A3C3E] overflow-hidden"
    >
      {/* Underlying Atmospheric Architectural Parallax Background Canvas */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="absolute -top-20 -bottom-20 left-0 right-0 overflow-hidden pointer-events-none select-none will-change-transform opacity-25"
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80"
          alt="Atmospheric architectural atelier backdrop"
          loading="lazy"
          className="w-full h-full object-cover object-center filter grayscale contrast-125"
        />
        {/* Softening Gradient Scrims ensuring high contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#202124] via-[#202124]/90 to-[#202124]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#3A3C3E]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold font-mono">
                PATRON TESTIMONIALS
              </span>
            </div>
            <h2 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#F2EEE7]">
              CLIENT REFLECTIONS
            </h2>
            <p className="text-sm sm:text-base text-[#D6CBBE] max-w-xl font-light">
              Voices of discerning patrons, estate owners, and hospitality founders who trusted Conclave Interiors to shape their physical world.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2B2D2F] hover:bg-[#B08D57] text-[#F2EEE7] hover:text-[#202124] text-xs font-semibold uppercase tracking-[0.16em] transition-all border border-[#B08D57]/40 shadow-xs cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#B08D57]" />
              <span>Leave Feedback</span>
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {approvedTestimonials.length > 0 ? (
            approvedTestimonials.map((item) => (
              <div
                key={item.id}
                className="bg-[#2B2D2F] border border-[#3A3C3E] p-8 flex flex-col justify-between space-y-6 relative hover:border-[#B08D57]/70 transition-all duration-300 shadow-sm"
              >
                <div className="space-y-4">
                  {/* Rating & Quote icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-[#B08D57] fill-[#B08D57]" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-[#3A3C3E]" />
                  </div>

                  {/* Message */}
                  <p className="font-serif-title text-lg sm:text-xl text-[#F2EEE7] font-light leading-relaxed italic">
                    "{item.feedbackMessage}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-[#3A3C3E] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-[#F2EEE7]">
                      {item.clientName}
                    </h4>
                    {item.clientRole && (
                      <p className="text-[11px] text-[#8C8276] font-light">
                        {item.clientRole}
                      </p>
                    )}
                    {item.projectReference && (
                      <p className="text-[10px] text-[#B08D57] tracking-wider uppercase mt-0.5 font-mono">
                        Ref: {item.projectReference}
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] uppercase tracking-wider text-[#B08D57] flex items-center gap-1 font-mono" title="Verified Studio Review">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Verified</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-[#8C8276]">
              No approved client reviews currently published. Reviews submitted are moderated via the Studio CMS.
            </div>
          )}
        </div>

        {/* Security & Moderation Transparency Note */}
        <div className="mt-12 p-4 bg-[#2B2D2F]/60 border border-[#3A3C3E] flex flex-wrap items-center justify-between gap-4 text-xs text-[#8C8276]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
            Strict Studio Quality Policy: All client reviews undergo moderation to ensure authentic project references.
          </span>
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="text-[#B08D57] hover:underline uppercase tracking-wider text-[11px] font-mono cursor-pointer"
          >
            Submit your feedback &rarr;
          </button>
        </div>
      </div>

      {/* Public Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </section>
  );
};
