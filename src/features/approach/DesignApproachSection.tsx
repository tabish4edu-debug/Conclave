import React from 'react';
import { Compass, Layers, Ruler, Key } from 'lucide-react';

export const DesignApproachSection: React.FC = () => {
  const steps = [
    {
      phase: 'PHASE 01',
      title: 'Discovery & Spatial Analysis',
      icon: Compass,
      subtitle: 'Mapping human lifestyle, natural illumination, and site constraints.',
      details:
        'We begin by analyzing the way you move through your day. We measure sightlines, solar orientations, acoustic challenges, and structural possibilities to establish a clear architectural brief.',
      milestone: 'Deliverable: Architectural Brief & Strategic Layout Schematics',
    },
    {
      phase: 'PHASE 02',
      title: 'Materiality & Concept Architecture',
      icon: Layers,
      subtitle: 'Translating space into tactile texture, dark timber, and natural stone.',
      details:
        'We develop comprehensive 3D spatial models alongside physical material palettes. Clients experience samples under natural daylight and evening Kelvin temperatures before signing off.',
      milestone: 'Deliverable: 3D Visualization Package & Curated Material Tray',
    },
    {
      phase: 'PHASE 03',
      title: 'Technical Detailing & Documentation',
      icon: Ruler,
      subtitle: 'Millimeter-precise joinery shop drawings and lighting engineering.',
      details:
        'True architectural quiet requires obsessive engineering. We produce technical construction drawing sets, lighting schedules, custom millwork details, and contractor specifications.',
      milestone: 'Deliverable: Construction Drawing Set & Trade Procurement Schedule',
    },
    {
      phase: 'PHASE 04',
      title: 'Procurement, Execution & Handover',
      icon: Key,
      subtitle: 'On-site artisan supervision through to turnkey white-glove handover.',
      details:
        'We liaise directly with stone masons, carpenters, and metalworkers. We manage white-glove freight and conduct final art and object staging so you walk into a finished sanctuary.',
      milestone: 'Deliverable: Fully Realized Architectural Residence & Maintenance Dossier',
    },
  ];

  return (
    <section id="approach" aria-label="Design Approach" className="py-28 bg-[#F2EEE7] text-[#202124] border-t border-[#D6CBBE]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        {/* Header */}
        <div className="space-y-4 max-w-3xl pb-14 border-b border-[#D6CBBE]">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[#B08D57]" />
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold font-mono">
              RIGOR & METHODOLOGY
            </span>
          </div>
          <h2 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-light text-[#202124] leading-[1.06] tracking-tight">
            THE ARCHITECTURAL PROCESS
          </h2>
          <p className="text-sm sm:text-base text-[#8C8276] font-light leading-relaxed">
            Every Conclave Interiors commission follows a disciplined four-phase progression designed to eliminate guesswork, control budgets, and protect architectural integrity.
          </p>
        </div>

        {/* Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 pt-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#D6CBBE]/25 border border-[#D6CBBE] p-8 space-y-6 flex flex-col justify-between hover:border-[#B08D57] transition-all duration-300 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] tracking-[0.25em] uppercase text-[#B08D57] font-mono font-semibold">
                      {step.phase}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#202124] text-[#B08D57] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif-title text-2xl text-[#202124] leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs uppercase tracking-wider text-[#B08D57] font-semibold font-mono">
                    {step.subtitle}
                  </p>

                  <p className="text-xs sm:text-sm text-[#8C8276] font-light leading-relaxed">
                    {step.details}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D6CBBE]">
                  <p className="text-[10px] text-[#8C8276] font-mono leading-tight">
                    {step.milestone}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
