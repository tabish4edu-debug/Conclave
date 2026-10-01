import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const { faqs, setIsQueryModalOpen, setQueryInitialTab } = useStudio();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const publishedFaqs = faqs
    .filter((f) => f.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" aria-label="Frequently Asked Questions" className="py-28 bg-[#F2EEE7] text-[#202124] border-t border-[#D6CBBE]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Title and Consultation Note */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold font-mono">
                CURIOUS INQUIRIES
              </span>
            </div>

            <h2 className="font-serif-title text-4xl sm:text-5xl font-light text-[#202124] leading-[1.08] tracking-tight text-balance">
              FREQUENTLY ASKED QUESTIONS
            </h2>

            <p className="text-sm text-[#8C8276] font-light leading-relaxed">
              Transparent guidance regarding our architectural scope, procurement ethics, timelines, and commission commitments.
            </p>

            <div className="p-7 bg-[#D6CBBE]/30 border border-[#D6CBBE] space-y-3 shadow-xs">
              <h4 className="font-serif-title text-xl text-[#202124]">
                Have an unlisted query?
              </h4>
              <p className="text-xs text-[#8C8276] leading-relaxed">
                Our design directors are available for bespoke feasibility consultations and site evaluations.
              </p>
              <button
                onClick={() => {
                  setQueryInitialTab('enquiry');
                  setIsQueryModalOpen(true);
                }}
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#B08D57] font-semibold hover:text-[#202124] transition-colors pt-2 cursor-pointer font-mono"
              >
                <span>Ask the Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-8 space-y-4">
            {publishedFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.id}
                  className="bg-[#D6CBBE]/25 border border-[#D6CBBE] transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full py-5 px-6 sm:px-7 flex items-center justify-between text-left focus:outline-hidden focus:ring-1 focus:ring-[#B08D57] cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-[#B08D57]">
                        0{index + 1}
                      </span>
                      <span className="font-serif-title text-xl sm:text-2xl text-[#202124] font-medium leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#202124] text-[#F2EEE7] flex items-center justify-center shrink-0 ml-4 transition-transform duration-200">
                      {isOpen ? <Minus className="w-4 h-4 text-[#B08D57]" /> : <Plus className="w-4 h-4 text-[#B08D57]" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 sm:px-7 pb-6 pt-2 border-t border-[#D6CBBE]/80 animate-in fade-in duration-200">
                      <span className="inline-block text-[10px] tracking-wider uppercase text-[#B08D57] font-semibold mb-2 font-mono">
                        {faq.category}
                      </span>
                      <p className="text-sm text-[#8C8276] font-light leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
