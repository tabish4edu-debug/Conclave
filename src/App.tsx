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
import { FadingDissolveTransition } from './components/common/FadingDissolveTransition';
import { SmoothScrollProvider } from './components/common/SmoothScrollProvider';
import { CmsPreviewDock } from './components/common/CmsPreviewDock';
import { HorizontalProjectGallery } from './features/projects/HorizontalProjectGallery';
import { StudioStorySection } from './features/about/StudioStorySection';

const PortfolioSite: React.FC = () => {
  const { settings } = useStudio();

  const isSectionVisible = (key: string) => {
    if (!settings?.sectionsConfig) return true;
    const cfg = settings.sectionsConfig[key];
    return cfg ? cfg.visible !== false : true;
  };

  return (
    <div className="min-h-screen bg-[var(--current-bg,#F2EEE7)] text-[var(--current-text,#202124)] flex flex-col selection:bg-[#B08D57] selection:text-[#202124] transition-colors duration-700 ease-in-out">
      {/* Scroll-triggered Theme Observer syncing light/dark state with scroll positions */}
      <ScrollThemeObserver />

      {/* Global Navigation (with integrated Preview Bar) */}
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

        {/* 3. Studio Story & Principal Designer Profile — LIGHT */}
        {isSectionVisible('showAbout') && (
          <ScrollThemeSection theme="light" id="about" as="div">
            <ScrollReveal distancePx={32}>
              <StudioStorySection />
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* FULL-WIDTH PARALLAX VISTA 01: Travertine Living Volume */}
        {isSectionVisible('showFeaturedProjects') && (
          <CinematicParallaxVista
            id="vista-void-travertine"
            title={
              !settings.vista1Title || settings.vista1Title === 'FLUTED LIMESTONE & BRONZE APERTURES'
                ? "THE MONUMENTAL VOID & HONED TRAVERTINE"
                : settings.vista1Title
            }
            subtitle={settings.vista1Subtitle || "Framing panoramic horizons with floor-to-ceiling architectural apertures and monolithic natural limestone surfaces."}
            materialSpecification={settings.vista1Spec || "SPECIFICATION: HONED ROMAN TRAVERTINE · UNLACQUERED BRONZE"}
            imageUrl={settings.vista1Image || "/images/projects/monolithic-travertine-pavilion.jpg"}
            imageAlt="Monolithic travertine living volume with floor-to-ceiling apertures"
            theme="light"
            speed={0.28}
            titleClassName="text-[#F3EEE5] [text-shadow:_0_2px_22px_rgba(0,0,0,0.7),_0_1px_3px_rgba(0,0,0,0.85)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
            subtitleClassName="text-[#E7E1D8] font-normal max-w-2xl leading-relaxed tracking-wide [text-shadow:_0_1px_10px_rgba(0,0,0,0.8),_0_1px_2px_rgba(0,0,0,0.9)]"
            specClassName="border-[#B08D57]/45 bg-[#18191B]/75 text-[#F3EEE5] shadow-xs"
            showExploreLink={false}
          />
        )}

        {/* 3. Horizontal Project Gallery with Video Walkthrough Popup — LIGHT */}
        {isSectionVisible('showFeaturedProjects') && (
          <ScrollThemeSection theme="light" id="projects">
            <ScrollReveal distancePx={28}>
              <div id="our-works" className="scroll-mt-24">
                <HorizontalProjectGallery />
              </div>
            </ScrollReveal>
          </ScrollThemeSection>
        )}

        {/* FULL-WIDTH PARALLAX VISTA 02: Limewash Plaster & Minimalist Master Suite */}
        <CinematicParallaxVista
          id="vista-plaster-ash"
          title={settings.vista2Title || "MINIMALIST PROPORTION & LIMEWASH PLASTER"}
          subtitle={settings.vista2Subtitle || "Textured mineral surfaces that catch the shifting daylight, creating quiet domestic environments sculpted for deep rest."}
          materialSpecification={settings.vista2Spec || "SPECIFICATION: LIMEWASH PLASTER · BLEACHED ASH · SATIN CHAMPAGNE"}
          imageUrl={settings.vista2Image || "/images/projects/limewash-plaster-suite.jpg"}
          imageAlt="Minimalist master suite with limewash plaster and ash timber"
          theme="light"
          speed={0.25}
          titleClassName="font-medium md:font-semibold text-[#0a0a0a] !leading-[1.28] sm:!leading-[1.24] md:!leading-[1.2] py-2 tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.85)] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
          overlayOpacity={0.32}
        />

        {/* GRADUAL CINEMATIC LIGHT -> DARK TRANSITION (80vh Multi-Layered Bridge) */}
        {isSectionVisible('showServices') && (
          <GradualLightingTransition
            variant="light-to-dark"
            bgImage="/images/hero/smoked-oak-library.jpg"
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
            bgImage="/images/hero/contemporary-marble-kitchen.jpg"
            imageAlt="Light-filled open living architecture with bespoke marble island"
            eyebrow="CLIENT CLARITY · FAQ"
            title="TRANSPARENT PROCUREMENT & SCOPE"
            subtitle="Definitive guidance on feasibility audits, procurement ethics, and turnkey commissioning timelines."
            titleClassName="text-[#F2EEE7] drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)]"
            subtitleClassName="text-[#F2EEE7]/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
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
            bgImage={settings.ctaMediaUrl || "/images/projects/soiree-bronze-bar.jpg"}
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

const MainContent: React.FC = () => {
  const { activePage } = useStudio();
  const isCmsAdmin = activePage === 'admin';

  return (
    <>
      <FadingDissolveTransition
        activeKey={isCmsAdmin ? 'admin' : 'portal'}
        className="min-h-screen"
      >
        {isCmsAdmin ? <AdminPanel /> : <PortfolioSite />}
      </FadingDissolveTransition>
      <CmsPreviewDock />
    </>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <ThemeProvider initialTheme="light">
        <SmoothScrollProvider>
          <MainContent />
        </SmoothScrollProvider>
      </ThemeProvider>
    </StudioProvider>
  );
}

