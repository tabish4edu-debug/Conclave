import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { ServiceItem } from '../../types';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { useParallax } from '../../hooks/useParallax';

interface ServiceCardItemProps {
  service: ServiceItem;
  index: number;
  imageUrl: string;
  onSelect: (service: ServiceItem) => void;
}

const ServiceCardItem: React.FC<ServiceCardItemProps> = ({ service, index, imageUrl, onSelect }) => {
  // Stagger movement ranges: different speed per card
  const parallaxSpeeds = [0.09, -0.07, 0.08, -0.06];
  const speed = parallaxSpeeds[index % parallaxSpeeds.length];

  const [cardRef, { translateY, scale }] = useParallax<HTMLDivElement>({
    speed,
    clampPx: 28,
    scaleStart: 1.05,
    scaleEnd: 1.0,
  });

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(service)}
      className="group bg-[#2B2D2F] border border-[#3A3C3E] hover:border-[#B08D57] flex flex-col justify-between transition-all duration-400 overflow-hidden cursor-pointer relative shadow-sm"
    >
      {/* Image Container with Subtle Zoom and Independent Vertical Parallax */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#202124]">
        <div
          className="absolute -top-3 -bottom-3 left-0 right-0 will-change-transform"
          style={{
            transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          }}
        >
          <img
            src={imageUrl}
            alt={service.title}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2D2F] via-transparent to-transparent opacity-85" />

        {/* Numerical index watermark */}
        <span className="absolute top-3 left-3 font-serif-title text-sm font-light text-[#B08D57] px-2.5 py-0.5 bg-[#202124]/90 backdrop-blur-xs border border-[#3A3C3E] font-mono">
          0{index + 1}
        </span>
      </div>

      {/* Content Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-serif-title text-xl text-[#F2EEE7] group-hover:text-[#B08D57] transition-colors leading-snug">
            {service.title}
          </h3>

          {service.tagline && (
            <p className="text-[11px] text-[#B08D57] uppercase tracking-wider font-mono">
              {service.tagline}
            </p>
          )}

          <p className="text-xs text-[#D6CBBE]/80 font-light leading-relaxed line-clamp-3">
            {service.description}
          </p>
        </div>

        {/* Circular Arrow Button */}
        <div className="pt-3 border-t border-[#3A3C3E] flex items-center justify-between">
          <span className="text-[10px] text-[#8C8276] font-mono tracking-wider">
            {service.scopeDuration || 'Turnkey Scope'}
          </span>

          <div className="w-8 h-8 rounded-full border border-[#B08D57]/40 bg-[#202124] group-hover:bg-[#B08D57] group-hover:border-[#B08D57] flex items-center justify-center transition-all duration-300">
            <ArrowUpRight className="w-4 h-4 text-[#B08D57] group-hover:text-[#202124] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ServicesSection: React.FC = () => {
  const { services, setIsQueryModalOpen, setQueryInitialTab } = useStudio();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Background architectural interior parallax layer in the back
  const [bgRef, { translateY: bgTranslateY, scale: bgScale }] = useParallax<HTMLDivElement>({
    speed: 0.20,
    clampPx: 100,
    scaleStart: 1.12,
    scaleEnd: 1.0,
  });

  const publishedServices = services
    .filter((s) => s.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleEnquireService = (serviceTitle: string) => {
    setSelectedService(null);
    setQueryInitialTab('enquiry');
    setIsQueryModalOpen(true);
  };

  // Curated architectural imagery fallback mapped by domain keyword
  const getServiceImage = (service: ServiceItem, index: number) => {
    if (service.imageUrl) return service.imageUrl;
    const titleLower = service.title.toLowerCase();
    if (titleLower.includes('kitchen')) {
      return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
    }
    if (titleLower.includes('wardrobe') || titleLower.includes('closet')) {
      return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80';
    }
    if (titleLower.includes('commercial') || titleLower.includes('corporate') || titleLower.includes('office')) {
      return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
    }
    if (titleLower.includes('styling') || titleLower.includes('art') || titleLower.includes('furniture')) {
      return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
    }
    const defaultImages = [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    ];
    return defaultImages[index % defaultImages.length];
  };

  return (
    <section
      id="services"
      aria-label="Interior Design Services"
      className="relative overflow-hidden py-28 bg-[#202124] text-[#F2EEE7] border-t border-[#3A3C3E]"
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
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=85"
          alt="Architectural smoked timber and ambient interior lighting"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-[1.10] brightness-[0.88]"
        />
        {/* Subtle luminous tint to maintain editorial contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#202124]/85 via-[#202124]/60 to-[#202124]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#202124_75%)] opacity-60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#3A3C3E]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold font-mono">
                ARCHITECTURAL CAPABILITIES
              </span>
            </div>
            <h2 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#F2EEE7]">
              OUR SERVICES
            </h2>
            <p className="text-sm sm:text-base text-[#D6CBBE] max-w-xl font-light leading-relaxed">
              From modular architectural kitchens and bespoke millwork to turnkey residential estates and commercial headquarters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#B08D57] font-mono uppercase tracking-widest px-3.5 py-1.5 bg-[#2B2D2F] border border-[#3A3C3E]">
              {publishedServices.length} Design Disciplines
            </span>
          </div>
        </div>

        {/* Services Grid (Large photography with independent parallax + minimal information + bronze accents) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {publishedServices.map((service, index) => (
            <ServiceCardItem
              key={service.id}
              service={service}
              index={index}
              imageUrl={getServiceImage(service, index)}
              onSelect={setSelectedService}
            />
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#2B2D2F] border border-[#3A3C3E] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-[#3A3C3E] pb-4">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold block mb-1 font-mono">
                  ARCHITECTURAL SCOPE SPECIFICATION
                </span>
                <h3 className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7]">
                  {selectedService.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-[#D6CBBE] hover:text-[#B08D57] p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#D6CBBE] font-light leading-relaxed">
              {selectedService.description}
            </p>

            {selectedService.deliverables && selectedService.deliverables.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase tracking-widest text-[#B08D57] block font-mono">
                  Commission Deliverables Included:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedService.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#D6CBBE]">
                      <Check className="w-3.5 h-3.5 text-[#B08D57] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#3A3C3E] flex items-center justify-between">
              <span className="text-xs text-[#8C8276] font-mono">
                Duration: {selectedService.scopeDuration || 'Turnkey Timeline'}
              </span>

              <button
                onClick={() => handleEnquireService(selectedService.title)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>Commission This Scope</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
