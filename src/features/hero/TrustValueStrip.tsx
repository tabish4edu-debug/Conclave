import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { Compass, Sparkles, Clock, ShieldCheck, Award, CheckCircle } from 'lucide-react';

export const TrustValueStrip: React.FC = () => {
  const { settings } = useStudio();

  // Dynamic CMS items or refined studio defaults
  const items = settings.trustStripItems && settings.trustStripItems.length > 0
    ? settings.trustStripItems
    : [
        {
          title: 'Customized Design',
          subtitle: 'Tailored to your spatial needs',
          iconName: 'Compass',
        },
        {
          title: 'Quality Materials',
          subtitle: 'Built for lasting architectural beauty',
          iconName: 'Sparkles',
        },
        {
          title: 'On-Time Delivery',
          subtitle: 'Disciplined turnkey execution',
          iconName: 'Clock',
        },
        {
          title: 'Expert Team',
          subtitle: 'Skilled architects & master artisans',
          iconName: 'ShieldCheck',
        },
      ];

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#B08D57]" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-[#B08D57]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#B08D57]" />;
      case 'Award':
        return <Award className="w-5 h-5 text-[#B08D57]" />;
      case 'Compass':
      default:
        return <Compass className="w-5 h-5 text-[#B08D57]" />;
    }
  };

  return (
    <section
      id="trust-value-strip"
      aria-label="Studio Commitments & Core Values"
      className="bg-[#202124] border-y border-[#3A3C3E] text-[#F2EEE7] py-6 sm:py-7 relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#3A3C3E]/60">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 ${idx > 0 ? 'pt-4 sm:pt-0 sm:pl-6 lg:pl-8' : ''}`}
            >
              <div className="w-11 h-11 rounded-sm border border-[#3A3C3E] bg-[#2B2D2F] flex items-center justify-center shrink-0 shadow-xs">
                {getIcon(item.iconName)}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-serif-title text-base sm:text-lg text-[#F2EEE7] tracking-wide leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-[#D6CBBE] font-light leading-snug">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
