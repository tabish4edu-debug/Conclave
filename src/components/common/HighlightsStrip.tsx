import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { Compass, Sparkles, Clock, ShieldCheck, Users, LucideIcon } from 'lucide-react';

export const HighlightsStrip: React.FC = () => {
  const { settings } = useStudio();

  const iconMap: Record<string, LucideIcon> = {
    Compass,
    Sparkles,
    Clock,
    ShieldCheck,
    Users,
  };

  const defaultHighlights = [
    {
      iconName: 'Compass',
      title: 'Customized Design',
      subtitle: 'As per your needs',
    },
    {
      iconName: 'Sparkles',
      title: 'Quality Materials',
      subtitle: 'Lasting beauty',
    },
    {
      iconName: 'Clock',
      title: 'On-Time Delivery',
      subtitle: 'With perfect execution',
    },
    {
      iconName: 'ShieldCheck',
      title: 'Expert Team',
      subtitle: 'Skilled & experienced',
    },
  ];

  const items = (settings.trustStripItems && settings.trustStripItems.length > 0)
    ? settings.trustStripItems
    : defaultHighlights;

  return (
    <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 -mt-6 sm:-mt-8 mb-16">
      <div className="bg-[#F2EEE7]/95 backdrop-blur-md border border-[#D6CBBE] rounded-2xl md:rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {items.map((item, idx) => {
          const IconComponent = (item.iconName && iconMap[item.iconName]) ? iconMap[item.iconName] : Compass;
          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D6CBBE]/35 border border-[#D6CBBE] flex items-center justify-center shrink-0 text-[#B08D57]">
                <IconComponent className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#202124]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#8C8276] font-light mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
