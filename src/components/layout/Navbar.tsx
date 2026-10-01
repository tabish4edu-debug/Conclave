import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X, ArrowUpRight, Phone, MessageSquare } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    settings,
    activePage,
    setActivePage,
    setIsQueryModalOpen,
    setQueryInitialTab,
  } = useStudio();
  const { isDark } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      const sections = ['home', 'about', 'services', 'projects', 'testimonials', 'contact'];
      for (const sectionId of [...sections].reverse()) {
        const el = document.getElementById(sectionId === 'home' ? 'hero-cinematic' : sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#top', section: 'home' },
    { label: 'About', href: '#about', section: 'about' },
    { label: 'Services', href: '#services', section: 'services' },
    { label: 'Projects', href: '#projects', section: 'projects' },
    { label: 'Approach', href: '#approach', section: 'approach' },
    { label: 'Contact', href: '#contact', section: 'contact' },
  ];

  const handleNavClick = (href: string, section: string) => {
    setMobileMenuOpen(false);
    setActiveSection(section);
    if (activePage !== 'home') {
      setActivePage('home');
      setTimeout(() => {
        if (href === '#top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      if (href === '#top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const phoneNumber = '+918981119608';
  const quoteText = settings.quoteButtonText || 'Get a Quote';

  const handleQuoteClick = () => {
    if (settings.quoteButtonLink && settings.quoteButtonLink.startsWith('#') && settings.quoteButtonLink !== '#contact') {
      const el = document.querySelector(settings.quoteButtonLink);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    setQueryInitialTab('enquiry');
    setIsQueryModalOpen(true);
  };

  return (
    <>
      <header
        id="conclave-main-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
          isScrolled
            ? isDark
              ? 'bg-[#202124]/92 backdrop-blur-md py-3.5 border-b border-[#3A3C3E] shadow-lg text-[#F2EEE7]'
              : 'bg-[#F2EEE7]/95 backdrop-blur-md py-3.5 border-b border-[#D6CBBE] shadow-xs text-[#202124]'
            : isDark
            ? 'bg-transparent py-5 text-[#F2EEE7]'
            : 'bg-transparent py-5 text-[#202124]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 flex items-center justify-between">
          {/* Brand Logo matching layout: Square with "C" + CONCLAVE / — INTERIOR — */}
          <a
            id="brand-logo-link"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#top', 'home');
            }}
            className="group flex items-center gap-3 text-left focus:outline-hidden"
          >
            <div className={`w-9 h-9 border flex items-center justify-center rounded-xs shadow-xs transition-all duration-500 group-hover:scale-105 ${
              isDark ? 'border-[#3A3C3E] bg-[#2B2D2F]' : 'border-[#2B2D2F] bg-[#202124]'
            }`}>
              <span className="font-serif-title text-base font-semibold text-[#F2EEE7]">
                C
              </span>
            </div>
            <div>
              <span className={`block font-serif-title text-lg md:text-xl tracking-[0.16em] uppercase font-bold leading-none transition-colors duration-700 ${
                isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
              }`}>
                CONCLAVE
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-px w-2 bg-[#B08D57]" />
                <span className="text-[8px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold leading-none">
                  INTERIOR
                </span>
                <span className="h-px w-2 bg-[#B08D57]" />
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            id="desktop-navigation"
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-7 xl:gap-8 text-xs tracking-wider font-medium"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.section;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href, link.section);
                  }}
                  className={`relative py-1 transition-colors duration-500 group ${
                    isActive
                      ? isDark ? 'text-[#F2EEE7] font-semibold' : 'text-[#202124] font-semibold'
                      : isDark ? 'text-[#D6CBBE] hover:text-[#B08D57]' : 'text-[#2B2D2F] hover:text-[#B08D57]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B08D57] rounded-full transition-all" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Cluster: Phone & "Get a Quote →" */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Phone Number with Phone Icon */}
            <a
              href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
              className={`hidden sm:inline-flex items-center gap-2 text-xs font-semibold transition-colors duration-500 py-1.5 font-sans ${
                isDark ? 'text-[#F2EEE7] hover:text-[#B08D57]' : 'text-[#202124] hover:text-[#B08D57]'
              }`}
              title="Call Conclave Interior"
            >
              <Phone className={`w-3.5 h-3.5 transition-colors duration-500 ${isDark ? 'text-[#B08D57]' : 'text-[#202124]'}`} />
              <span className="tracking-wide">{phoneNumber}</span>
            </a>

            {/* Get a Quote Button in Rounded Champagne Bronze Pill */}
            <button
              id="header-quote-cta-btn"
              onClick={handleQuoteClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs rounded-full shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>{quoteText}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors duration-500 hover:text-[#B08D57] focus:outline-hidden ${
                isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className={`fixed inset-0 z-40 backdrop-blur-xl flex flex-col justify-between pt-24 pb-10 px-8 lg:hidden animate-in fade-in duration-200 ${
            isDark ? 'bg-[#202124]/98 text-[#F2EEE7]' : 'bg-[#F2EEE7]/98 text-[#202124]'
          }`}
        >
          <div className="space-y-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold border-b border-[#D6CBBE] pb-2 font-mono">
              Navigation
            </p>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href, link.section);
                  }}
                  className={`font-serif-title text-2xl tracking-wider hover:text-[#B08D57] transition-colors py-1 flex items-center justify-between ${
                    isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#B08D57]" />
                </a>
              ))}
            </div>
          </div>

          <div className={`border-t pt-6 space-y-3 ${isDark ? 'border-[#3A3C3E]' : 'border-[#D6CBBE]'}`}>
            <a
              href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
              className={`flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold rounded-full border transition-colors ${
                isDark
                  ? 'bg-[#2B2D2F] text-[#F2EEE7] border-[#3A3C3E]'
                  : 'bg-[#D6CBBE]/40 text-[#202124] border-[#D6CBBE]'
              }`}
            >
              <Phone className={`w-4 h-4 ${isDark ? 'text-[#B08D57]' : 'text-[#202124]'}`} />
              <span>Call: {phoneNumber}</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleQuoteClick();
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#B08D57] text-[#202124] text-xs font-semibold rounded-full shadow-sm"
            >
              <span>{quoteText} →</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setQueryInitialTab('whatsapp');
                setIsQueryModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-[#8C8276] hover:text-[#202124] text-[11px] uppercase tracking-wider"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>WhatsApp Studio Direct</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
