import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { ArrowUp } from 'lucide-react';
import { PlaceholderBadge } from '../common/PlaceholderBadge';

export const Footer: React.FC = () => {
  const { settings } = useStudio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const instagramUrl = (settings.instagramUrl && !settings.instagramUrl.includes('conclaveinteriors'))
    ? settings.instagramUrl
    : 'https://www.instagram.com/conclave_interior?stkn=MXQ3ZmtsYWw1b2Z3OA==';
  const facebookUrl = (settings.facebookUrl && !settings.facebookUrl.includes('conclaveinteriors'))
    ? settings.facebookUrl
    : 'https://www.facebook.com/AmirulDesigner';
  const youtubeUrl = settings.youtubeUrl || 'https://youtube.com/@conclaveinteriors';
  const phone = '+918981119608';
  const email = 'conclaveinteriorexterior@gmail.com';

  return (
    <footer
      id="conclave-footer"
      aria-label="Conclave Interiors Studio Footer"
      className="bg-[#202124] text-[#F2EEE7] border-t border-[#3A3C3E] pt-24 pb-12"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 space-y-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand & Manifesto (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 border border-[#B08D57] flex items-center justify-center bg-[#2B2D2F]">
                <span className="font-serif-title text-base font-light text-[#B08D57]">C</span>
              </div>
              <div>
                <span className="font-serif-title text-2xl tracking-[0.22em] uppercase text-[#F2EEE7] block leading-none">
                  CONCLAVE
                </span>
                <span className="text-[9px] tracking-[0.35em] uppercase text-[#B08D57] font-semibold block mt-1">
                  INTERIORS
                </span>
              </div>
            </div>

            <p className="text-sm text-[#D6CBBE] max-w-sm font-light leading-relaxed">
              {settings.footerAboutText || 'An architectural interior design practice shaping spaces that speak in silence. Dedicated to raw texture, natural illumination, and enduring proportion across luxury residential and commercial environments.'}
            </p>

            <div className="pt-2">
              <PlaceholderBadge label="Client Demonstration Build · Handover Ready" />
            </div>
          </div>

          {/* Quick Links Directory (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-[#B08D57] font-semibold font-mono">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D6CBBE] uppercase tracking-wider font-light">
              <li>
                <a href="#projects" className="hover:text-[#B08D57] transition-colors">
                  Selected Works
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#B08D57] transition-colors">
                  Studio & Philosophy
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B08D57] transition-colors">
                  Design Capabilities
                </a>
              </li>
              <li>
                <a href="#approach" className="hover:text-[#B08D57] transition-colors">
                  Architectural Rigor
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-[#B08D57] transition-colors">
                  Patron Reflections
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#B08D57] transition-colors">
                  Curious Inquiries
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#B08D57] transition-colors">
                  Commence a Dialogue
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information & Social (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-[11px] uppercase tracking-[0.25em] text-[#B08D57] font-semibold font-mono">
                Contact Information
              </h4>
              <p className="text-xs text-[#D6CBBE] leading-relaxed">
                55, Canal East Road Kolkata - 700085, West Bengal, India
              </p>
              <p className="text-xs text-[#D6CBBE] font-mono">
                Phone:{' '}
                <a
                  href="tel:+918981119608"
                  className="text-[#F2EEE7] font-semibold hover:text-[#B08D57] transition-colors inline-block tracking-wider underline-offset-4 hover:underline"
                >
                  +918981119608
                </a>
              </p>
              <p className="text-xs text-[#D6CBBE] font-mono">
                Email:{' '}
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=conclaveinteriorexterior@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F2EEE7] font-semibold hover:text-[#B08D57] transition-colors inline-block tracking-wide underline-offset-4 hover:underline"
                  title="Compose message to conclaveinteriorexterior@gmail.com on Gmail"
                >
                  conclaveinteriorexterior@gmail.com
                </a>
              </p>
            </div>

            {/* Follow Us with authentic SVGs */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] uppercase tracking-[0.25em] text-[#B08D57] font-semibold font-mono">
                Follow Us
              </h4>
              <div className="flex items-center gap-4">
                {/* Instagram SVG */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Conclave Interiors on Instagram"
                  className="w-9 h-9 border border-[#3A3C3E] bg-[#2B2D2F] flex items-center justify-center text-[#D6CBBE] hover:text-[#B08D57] hover:border-[#B08D57] transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook SVG */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Conclave Interiors on Facebook"
                  className="w-9 h-9 border border-[#3A3C3E] bg-[#2B2D2F] flex items-center justify-center text-[#D6CBBE] hover:text-[#B08D57] hover:border-[#B08D57] transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* YouTube SVG */}
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Conclave Interiors on YouTube"
                  className="w-9 h-9 border border-[#3A3C3E] bg-[#2B2D2F] flex items-center justify-center text-[#D6CBBE] hover:text-[#B08D57] hover:border-[#B08D57] transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#3A3C3E] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8C8276] font-mono">
          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} {settings.footerCopyrightText || 'CONCLAVE INTERIORS ATELIER. All rights reserved.'}</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Mumbai · London · Dubai</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-[#B08D57] hover:text-[#F2EEE7] transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
