/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './features/hero/HeroSection';
import { HighlightsStrip } from './components/common/HighlightsStrip';
import { ContinuousImageStrip } from './features/strip/ContinuousImageStrip';
import { FeaturedProjects } from './features/projects/FeaturedProjects';
import { StudioStorySection } from './features/about/StudioStorySection';
import { ServicesSection } from './features/services/ServicesSection';
import { DesignApproachSection } from './features/approach/DesignApproachSection';
import { TestimonialsSection } from './features/testimonials/TestimonialsSection';
import { CtaSection } from './features/cta/CtaSection';
import { FaqSection } from './features/faq/FaqSection';
import { ContactSection } from './features/contact/ContactSection';
import { FloatingQueryButton } from './components/common/FloatingQueryButton';
import { QueryModal } from './components/common/QueryModal';
import { ScrollReveal } from './components/common/ScrollReveal';
import { ScrollThemeObserver } from './components/common/ScrollThemeObserver';
import { ScrollThemeSection } from './components/common/ScrollThemeSection';
import { CinematicParallaxVista } from './components/common/CinematicParallaxVista';
import { GradualLightingTransition } from './components/common/GradualLightingTransition';
import { NoirCinematicScene } from './components/common/NoirCinematicScene';
import { AdminPanel } from './features/admin/AdminPanel';
import { Eye } from 'lucide-react';

const MainContent: React.FC = () => {
  const { isPreviewMode, togglePreviewMode, settings, activePage } = useStudio();

  // If user navigates to CMS Admin Panel
  if (activePage === 'admin') {
    return <AdminPanel />;
  }

  const isSectionVisible = (key: string) => {
    if (!settings?.sectionsConfig) return true;
    const cfg = settings.sectionsConfig[key];
    return cfg ? cfg.visible !== false : true;
  };

  return (
    <div className="min-h-screen bg-[var(--current-bg,#F2EEE7)] text-[var(--current-text,#202124)] flex flex-col selection:bg-[#B08D57] selection:text-[#202124] transition-colors duration-700 ease-in-out">
      {/* Scroll-triggered Theme Observer syncing light/dark state with scroll positions */}
      <ScrollThemeObserver />

      {/* Draft Preview Bar */}
      {isPreviewMode && (
        <div className="sticky top-0 z-50 bg-[#B08D57] text-[#202124] px-4 py-2 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#202124]" />
            <span className="font-semibold uppercase tracking-wider">
              DRAFT PREVIEW ACTIVE
            </span>
            <span className="hidden md:inline text-black/70">
              — Displaying unpublished drafts & pending portfolio monographs.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePreviewMode}
              className="px-2.5 py-1 bg-[#202124] text-[#F2EEE7] hover:bg-[#2B2D2F] text-[11px] uppercase tracking-wider font-semibold cursor-pointer transition-colors"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main id="main-content" className="flex-grow">
        {/* 1. Cinematic Hero Section — LIGHT */}
        {isSectionVisible('showHero') && (
          <ScrollThemeSection theme="light" id="hero">
            <HeroSection />
            <ScrollReveal delayMs={100} distancePx={24}>
              <HighlightsStrip />
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* 2. Continuous Architectural Image Strip — LIGHT */}
        {isSectionVisible('showContinuousStrip') && (
          <ScrollThemeSection theme="light" id="strip">
            <ScrollReveal distancePx={28}>
              <ContinuousImageStrip />
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* FULL-WIDTH PARALLAX VISTA 01: Travertine Living Volume */}
        {isSectionVisible('showFeaturedProjects') && (
          <CinematicParallaxVista
            id="vista-void-travertine"
            chapterNumber={settings.vista1Chapter || "VISTA 01 · SPATIAL VOLUME"}
            title={
              !settings.vista1Title || settings.vista1Title === 'FLUTED LIMESTONE & BRONZE APERTURES'
                ? "THE MONUMENTAL VOID & HONED TRAVERTINE"
                : settings.vista1Title
            }
            subtitle={settings.vista1Subtitle || "Framing panoramic horizons with floor-to-ceiling architectural apertures and monolithic natural limestone surfaces."}
            materialSpecification={settings.vista1Spec || "SPECIFICATION: HONED ROMAN TRAVERTINE · UNLACQUERED BRONZE"}
            imageUrl={settings.vista1Image || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85"}
            imageAlt="Monolithic travertine living volume with floor-to-ceiling apertures"
            theme="light"
            speed={0.28}
            titleClassName="text-[#F3EEE5] [text-shadow:_0_2px_22px_rgba(0,0,0,0.7),_0_1px_3px_rgba(0,0,0,0.85)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
            subtitleClassName="text-[#E7E1D8] font-normal max-w-2xl leading-relaxed tracking-wide [text-shadow:_0_1px_10px_rgba(0,0,0,0.8),_0_1px_2px_rgba(0,0,0,0.9)]"
            specClassName="border-[#B08D57]/45 bg-[#18191B]/75 text-[#F3EEE5] shadow-xs"
            exploreLinkClassName="text-[#B08D57] border-[#B08D57]/60 hover:text-[#F3EEE5] hover:border-[#F3EEE5] [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]"
          />
        )}

        {/* 3. Selected Works & Portfolio Monographs — LIGHT */}
        {isSectionVisible('showFeaturedProjects') && (
          <ScrollThemeSection theme="light" id="projects">
            <ScrollReveal distancePx={32}>
              <FeaturedProjects />
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* FULL-WIDTH PARALLAX VISTA 02: Limewash Plaster & Minimalist Master Suite */}
        {isSectionVisible('showAbout') && (
          <CinematicParallaxVista
            id="vista-plaster-ash"
            chapterNumber={settings.vista2Chapter || "VISTA 02 · RESIDENTIAL SERENITY"}
            title={settings.vista2Title || "MINIMALIST PROPORTION & LIMEWASH PLASTER"}
            subtitle={settings.vista2Subtitle || "Textured mineral surfaces that catch the shifting daylight, creating quiet domestic environments sculpted for deep rest."}
            materialSpecification={settings.vista2Spec || "SPECIFICATION: LIMEWASH PLASTER · BLEACHED ASH · SATIN CHAMPAGNE"}
            imageUrl={settings.vista2Image || "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=2000&q=85"}
            imageAlt="Minimalist master suite with limewash plaster and ash timber"
            theme="light"
            speed={0.25}
            titleClassName="font-medium md:font-semibold text-[#0a0a0a] drop-shadow-[0_2px_20px_rgba(255,255,255,1)] drop-shadow-[0_1px_3px_rgba(255,255,255,1)]"
            overlayOpacity={0.32}
          />
        )}

        {/* 4. Studio Story, Manifesto & Visual Influences — LIGHT */}
        {isSectionVisible('showAbout') && (
          <ScrollThemeSection theme="light" id="about">
            <ScrollReveal distancePx={32}>
              <StudioStorySection />
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* GRADUAL CINEMATIC LIGHT -> DARK TRANSITION (80vh Multi-Layered Bridge) */}
        {isSectionVisible('showAbout') && isSectionVisible('showServices') && (
          <GradualLightingTransition
            variant="light-to-dark"
            bgImage="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=85"
            imageAlt="Smoked oak private study library with patinated bronze lighting"
            eyebrow="ATMOSPHERIC SHIFT · DAYLIGHT TO DUSK"
            title="TRANSITIONING INTO NOCTURNAL COMPOSURE"
            subtitle="As exterior daylight recedes, architectural surfaces reveal their tactile grain under disciplined low-glare illumination."
          />
        )}

        {/* MAJOR DARK CINEMATIC PARALLAX SECTION: The Noir Sanctuary Atelier (90vh) */}
        {isSectionVisible('showServices') && (
          <ScrollThemeSection theme="dark" id="noir-sanctuary">
            <NoirCinematicScene />
          </ScrollThemeSection>
        )}

        {/* 5. Architectural Services & Capabilities — DARK */}
        {isSectionVisible('showServices') && (
          <ScrollThemeSection theme="dark" id="services">
            <ScrollReveal distancePx={32}>
              <ServicesSection />
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* GRADUAL CINEMATIC DARK -> LIGHT TRANSITION (75vh Multi-Layered Bridge) */}
        {isSectionVisible('showServices') && isSectionVisible('showApproach') && (
          <GradualLightingTransition
            variant="dark-to-light"
            bgImage="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2000&q=85"
            imageAlt="Morning sunlight entering a biophilic stone courtyard"
            eyebrow="ARCHITECTURAL METHODOLOGY"
            title="MORNING ILLUMINATION & RIGOROUS DETAIL"
            subtitle="Returning to the crystalline clarity of natural daylight and our four disciplined phases of spatial execution."
          />
        )}

        {/* 6. Design Rigor & 4-Phase Process — LIGHT */}
        {isSectionVisible('showApproach') && (
          <ScrollThemeSection theme="light" id="approach">
            <ScrollReveal distancePx={32}>
              <DesignApproachSection />
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* FULL-WIDTH PARALLAX VISTA 03: Executive Corporate Sanctuary & Boardroom */}
        {isSectionVisible('showApproach') && isSectionVisible('showTestimonials') && (
          <CinematicParallaxVista
            id="vista-executive-sanctuary"
            chapterNumber="VISTA 03 · CORPORATE SANCTUARY"
            title="ACOUSTIC STILLNESS & REFINED HOSPITALITY"
            subtitle="Executive headquarters and private salons tailored for focused collaboration, acoustic quietude, and effortless entertaining."
            materialSpecification="SPECIFICATION: FLUTED AMERICAN WALNUT · NERO MARQUINA · ACOUSTIC WOOL"
            imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85"
            imageAlt="Executive boardroom salon with custom walnut table and bronze pendants"
            theme="light"
            speed={0.26}
          />
        )}

        {/* GRADUAL CINEMATIC LIGHT -> DARK TRANSITION INTO PATRON TESTIMONIALS */}
        {isSectionVisible('showApproach') && isSectionVisible('showTestimonials') && (
          <GradualLightingTransition
            variant="light-to-dark"
            bgImage="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85"
            imageAlt="Warm minimalist residential hearth and reading lounge"
            eyebrow="PATRON REFLECTIONS · REPUTATION"
            title="DISCERNING VOICES & ENDURING TRUST"
            subtitle="Authentic reflections from patrons of private residences and executive turnkey commissions."
          />
        )}

        {/* 7. Client Reflections & Public Feedback Submission — DARK */}
        {isSectionVisible('showTestimonials') && (
          <ScrollThemeSection theme="dark" id="testimonials">
            <ScrollReveal distancePx={32}>
              <TestimonialsSection />
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* 8. Dedicated High-Impact Monumental CTA Section — DARK */}
        <ScrollThemeSection theme="dark" id="cta">
          <ScrollReveal distancePx={32}>
            <CtaSection />
          </ScrollReveal>
        </ScrollThemeSection>

        {/* GRADUAL CINEMATIC DARK -> LIGHT TRANSITION INTO FAQ */}
        {isSectionVisible('showFaq') && (
          <GradualLightingTransition
            variant="dark-to-light"
            bgImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
            imageAlt="Light-filled open living architecture with bespoke marble island"
            eyebrow="CLIENT CLARITY · FAQ"
            title="TRANSPARENT PROCUREMENT & SCOPE"
            subtitle="Definitive guidance on feasibility audits, procurement ethics, and turnkey commissioning timelines."
          />
        )}

        {/* 9. Frequently Asked Inquiries — LIGHT */}
        {isSectionVisible('showFaq') && (
          <ScrollThemeSection theme="light" id="faq">
            <ScrollReveal distancePx={28}>
              <FaqSection />
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* GRADUAL CINEMATIC LIGHT -> DARK TRANSITION INTO COMMISSION DIALOGUE */}
        {isSectionVisible('showContact') && (
          <GradualLightingTransition
            variant="light-to-dark"
            bgImage={settings.ctaMediaUrl || "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=85"}
            imageAlt="Atmospheric private bronze cocktail lounge bar"
            eyebrow={settings.ctaEyebrow || "COMMISSION DIALOGUE"}
            title={settings.ctaTitle || "INITIATE YOUR ARCHITECTURAL SANCTUARY"}
            subtitle={settings.ctaSubtitle || "Connect directly with our principal design director to discuss your prospective residential or commercial space."}
          />
        )}

        {/* 10. Direct Dialogue & Commission Inquiries — DARK */}
        {isSectionVisible('showContact') && (
          <ScrollThemeSection theme="dark" id="contact">
            <ScrollReveal distancePx={32}>
              <ContactSection />
            </ScrollReveal>
          </ScrollThemeSection>
        )}
      </main>

      {/* Studio Footer — DARK */}
      <ScrollThemeSection theme="dark" id="footer" as="div">
        <ScrollReveal distancePx={20}>
          <Footer />
        </ScrollReveal>
      </ScrollThemeSection>

      {/* Continuously Visible Floating Query Button ("LET'S TALK") */}
      <FloatingQueryButton />

      {/* Interactive Query & Channel Dialogue Modal */}
      <QueryModal />
    </div>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <ThemeProvider initialTheme="light">
        <MainContent />
      </ThemeProvider>
    </StudioProvider>
  );
}

