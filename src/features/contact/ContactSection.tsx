import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { useTheme } from '../../context/ThemeContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { PlaceholderBadge } from '../../components/common/PlaceholderBadge';
import { useParallax } from '../../hooks/useParallax';

export const ContactSection: React.FC = () => {
  const { settings, submitEnquiry } = useStudio();
  const { isDark } = useTheme();

  // Atelier background parallax
  const [bgRef, { translateY }] = useParallax<HTMLDivElement>({
    speed: 0.12,
    clampPx: 60,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'Private Residence Renovation',
    location: '',
    budget: '₹150,000 – ₹300,000',
    preferredContact: 'whatsapp' as 'phone' | 'whatsapp' | 'email',
    message: '',
  });

  const [showVoiceOptions, setShowVoiceOptions] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isFormDismissed, setIsFormDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const projectTypes = [
    'Private Residence Architectural Overhaul',
    'Penthouse Interior Architecture',
    'Commercial / Executive Headquarters',
    'Hospitality Lounge & Private Club',
    'Space Planning & Technical Joinery',
    'Interior Styling & Art Curation',
    'Other Bespoke Commission',
  ];

  const budgetTiers = [
    'Under ₹150,000',
    '₹150,000 – ₹300,000',
    '₹300,000 – ₹600,000',
    '₹600,000 – ₹1,200,000',
    '₹1,200,000+',
    'To be determined during feasibility study',
  ];

  const handleWhatsAppClick = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setFormData((prev) => ({ ...prev, preferredContact: 'whatsapp' }));
    setShowVoiceOptions(false);
    window.open('https://wa.me/918981119608', '_blank', 'noopener,noreferrer');
  };

  const handleVoiceCallClick = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFormData((prev) => ({ ...prev, preferredContact: 'phone' }));
    setShowVoiceModal(true);
    setIsFormDismissed(true);
  };

  const handleEmailDossierClick = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setFormData((prev) => ({ ...prev, preferredContact: 'email' }));
    setShowVoiceOptions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setError('Please complete all required fields marked with *.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      submitEnquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        projectType: formData.projectType,
        location: formData.location.trim() || 'Undisclosed',
        budget: formData.budget,
        preferredContact: formData.preferredContact,
        message: formData.message.trim(),
      });

      // Email filled credentials to conclaveinteriorexterior@gmail.com
      const emailSubject = encodeURIComponent(`Architectural Commission Dossier: ${formData.name.trim()}`);
      const emailBody = encodeURIComponent(
`CONCLAVE INTERIORS COMMISSION DOSSIER
=====================================
Client Name: ${formData.name.trim()}
Email Address: ${formData.email.trim()}
Phone / WhatsApp: ${formData.phone.trim()}
Project Typology: ${formData.projectType}
Project Location: ${formData.location.trim() || 'Undisclosed'}
Estimated Budget Bracket: ${formData.budget}
Preferred Studio Dialogue Channel: ${formData.preferredContact}

Project Vision & Spatial Scope:
-------------------------------
${formData.message.trim()}
=====================================`
      );

      // Trigger email client dispatch to conclaveinteriorexterior@gmail.com
      const mailtoUrl = `mailto:conclaveinteriorexterior@gmail.com?subject=${emailSubject}&body=${emailBody}`;
      const mailLink = document.createElement('a');
      mailLink.href = mailtoUrl;
      mailLink.click();

      setIsSuccess(true);
      setIsSubmitting(false);
    } catch {
      setError('An unexpected error occurred while transmitting your dossier. Please try direct WhatsApp.');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      projectType: 'Private Residence Renovation',
      location: '',
      budget: '₹150,000 – ₹300,000',
      preferredContact: 'whatsapp',
      message: '',
    });
    setShowVoiceOptions(false);
    setShowVoiceModal(false);
    setIsFormDismissed(false);
    setIsSuccess(false);
    setError('');
  };

  return (
    <section
      id="contact"
      aria-label="Contact and Commission"
      className={`relative py-28 transition-colors duration-700 ease-in-out border-t overflow-hidden ${
        isDark
          ? 'bg-[#202124] text-[#F2EEE7] border-[#3A3C3E]'
          : 'bg-[#D6CBBE]/25 text-[#202124] border-[#D6CBBE]'
      }`}
    >
      {/* Underlying Atelier Parallax Backdrop Canvas */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className={`absolute -top-16 -bottom-16 left-0 right-0 overflow-hidden pointer-events-none select-none will-change-transform transition-opacity duration-700 ${
          isDark ? 'opacity-[0.14]' : 'opacity-[0.07]'
        }`}
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=80"
          alt="Atelier drafting table backdrop"
          loading="lazy"
          className="w-full h-full object-cover object-center filter grayscale"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 space-y-16">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b transition-colors duration-700 ${
          isDark ? 'border-[#3A3C3E]' : 'border-[#D6CBBE]'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold font-mono">
                COMMISSION INITIATION
              </span>
            </div>
            <h2 className={`font-serif-title text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight transition-colors duration-700 ${
              isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
            }`}>
              COMMENCE A DIALOGUE
            </h2>
            <p className={`text-sm sm:text-base max-w-xl font-light transition-colors duration-700 ${
              isDark ? 'text-[#D6CBBE]/80' : 'text-[#8C8276]'
            }`}>
              We welcome private residences, urban penthouses, and select hospitality environments. Tell us about your spatial aspirations.
            </p>
          </div>

          <PlaceholderBadge label="Client Contact Data Placeholder — Replace via CMS" />
        </div>

        {/* Form and Contact Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Studio Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div className={`p-8 border space-y-6 shadow-xs transition-colors duration-700 ${
              isDark ? 'bg-[#2B2D2F] border-[#3A3C3E]' : 'bg-[#F2EEE7] border-[#D6CBBE]'
            }`}>
              <h3 className={`font-serif-title text-2xl transition-colors duration-700 ${
                isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
              }`}>
                Studio Channels
              </h3>

              <div className={`space-y-6 text-xs transition-colors duration-700 ${
                isDark ? 'text-[#D6CBBE]' : 'text-[#8C8276]'
              }`}>
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#202124] text-[#B08D57] flex items-center justify-center shrink-0 border border-[#3A3C3E]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-semibold font-mono">
                      Telephone
                    </span>
                    <a href="tel:+918981119608" className={`text-sm hover:text-[#B08D57] transition-colors font-mono ${
                      isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
                    }`}>
                      +918981119608
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#202124] text-[#B08D57] flex items-center justify-center shrink-0 border border-[#3A3C3E]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-semibold font-mono">
                      Studio Correspondence
                    </span>
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=conclaveinteriorexterior@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm hover:text-[#B08D57] transition-colors font-mono ${
                        isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
                      }`}
                    >
                      conclaveinteriorexterior@gmail.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#202124] text-[#B08D57] flex items-center justify-center shrink-0 border border-[#3A3C3E]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-semibold font-mono">
                      Atelier Address
                    </span>
                    <p className={`text-xs font-light leading-relaxed ${
                      isDark ? 'text-[#D6CBBE]' : 'text-[#202124]'
                    }`}>
                      {settings.address || '55, Canal East Road Kolkata - 700085, West Bengal, India'}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#202124] text-[#B08D57] flex items-center justify-center shrink-0 border border-[#3A3C3E]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-[#B08D57] block font-semibold font-mono">
                      Studio Consultation Hours
                    </span>
                    <p className={`text-xs font-mono font-medium ${
                      isDark ? 'text-[#D6CBBE]' : 'text-[#202124]'
                    }`}>
                      {(settings.workingHours || 'Monday – Saturday: 10:00 to 20:00 IST').replaceAll('18:00', '20:00').replaceAll('18:30', '20:00')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Box */}
              <div className={`pt-6 border-t ${isDark ? 'border-[#3A3C3E]' : 'border-[#D6CBBE]'}`}>
                <a
                  href="https://wa.me/918981119608"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-4 border transition-all group ${
                    isDark
                      ? 'bg-[#202124] hover:bg-[#202124]/70 border-[#3A3C3E]'
                      : 'bg-[#D6CBBE]/30 hover:bg-[#D6CBBE]/50 border-[#D6CBBE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-[#B08D57]" />
                    <div>
                      <span className={`text-xs uppercase tracking-wider font-semibold block ${
                        isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'
                      }`}>
                        Direct WhatsApp Atelier
                      </span>
                      <span className={`text-[11px] font-mono ${isDark ? 'text-[#D6CBBE]/70' : 'text-[#8C8276]'}`}>
                        +91 89811 19608 · Instant dialogue
                      </span>
                    </div>
                  </div>
                  <Send className="w-4 h-4 text-[#B08D57] transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-7">
            <div className={`p-8 md:p-10 border shadow-xs transition-colors duration-700 ${
              isDark ? 'bg-[#2B2D2F] border-[#3A3C3E]' : 'bg-[#F2EEE7] border-[#D6CBBE]'
            }`}>
              {isSuccess ? (
                <div className="text-center py-12 space-y-4 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#B08D57]/20 border border-[#B08D57] flex items-center justify-center mx-auto text-[#B08D57]">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <h3 className={`font-serif-title text-3xl ${isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'}`}>
                    Dossier Transmitted & Emailed
                  </h3>

                  <p className={`text-sm max-w-md mx-auto font-light leading-relaxed ${
                    isDark ? 'text-[#D6CBBE]/80' : 'text-[#8C8276]'
                  }`}>
                    Thank you, {formData.name}. Your commission credentials have been transmitted to{' '}
                    <strong className="text-[#B08D57] font-mono">conclaveinteriorexterior@gmail.com</strong> and recorded in our atelier ledger. Our design directors will contact you promptly.
                  </p>

                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <a
                      href="https://wa.me/918981119608"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-[#25D366] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#1ebd5b] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat On WhatsApp</span>
                    </a>
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 bg-[#B08D57] text-[#202124] text-xs uppercase tracking-widest font-semibold hover:bg-[#9A7844] transition-all cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : isFormDismissed ? (
                <div className="text-center py-12 space-y-6 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#B08D57]/20 border border-[#B08D57] flex items-center justify-center mx-auto text-[#B08D57]">
                    <Phone className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] tracking-[0.25em] uppercase text-[#B08D57] font-mono font-semibold block">
                      Direct Voice Consultation Desk
                    </span>
                    <h3 className={`font-serif-title text-3xl ${isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'}`}>
                      Calling Conclave Interiors
                    </h3>
                    <p className={`text-sm max-w-md mx-auto font-light leading-relaxed ${
                      isDark ? 'text-[#D6CBBE]/80' : 'text-[#8C8276]'
                    }`}>
                      The form has been dismissed for direct voice connection with our studio at <strong className="text-[#B08D57] font-mono">+91 89811 19608</strong>:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
                    {/* Option 1: Call Via WhatsApp */}
                    <a
                      href="https://wa.me/918981119608"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 px-5 py-4 bg-[#25D366] hover:bg-[#1ebd5b] text-[#202124] text-xs uppercase tracking-wider font-semibold font-mono transition-all cursor-pointer shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Call Via WhatsApp</span>
                    </a>

                    {/* Option 2: Call Normally */}
                    <a
                      href="tel:+918981119608"
                      className="flex items-center justify-center gap-2.5 px-5 py-4 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] text-xs uppercase tracking-wider font-semibold font-mono transition-all cursor-pointer shadow-md"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Normally</span>
                    </a>
                  </div>

                  <div className="pt-4 border-t border-[#3A3C3E]/50">
                    <button
                      onClick={() => {
                        setIsFormDismissed(false);
                        setShowVoiceModal(false);
                      }}
                      className="text-xs uppercase tracking-widest text-[#D6CBBE] hover:text-[#B08D57] font-mono underline underline-offset-4 cursor-pointer transition-colors"
                    >
                      ← Reopen Written Commission Form
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className={`border-b pb-4 ${isDark ? 'border-[#3A3C3E]' : 'border-[#D6CBBE]'}`}>
                    <h3 className={`font-serif-title text-2xl sm:text-3xl ${isDark ? 'text-[#F2EEE7]' : 'text-[#202124]'}`}>
                      Project Commission Dossier
                    </h3>
                    <p className={`text-xs font-light mt-1 ${isDark ? 'text-[#D6CBBE]/70' : 'text-[#8C8276]'}`}>
                      Provide initial architectural context. All inquiries are held in strict confidence.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className={`text-xs uppercase tracking-wider block font-mono ${
                        isDark ? 'text-[#D6CBBE]' : 'text-[#8C8276]'
                      }`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your Name"
                        className={`w-full px-4 py-3 border focus:border-[#B08D57] text-sm focus:outline-hidden transition-colors ${
                          isDark
                            ? 'bg-[#202124] border-[#3A3C3E] text-[#F2EEE7] placeholder-[#8C8276]/70'
                            : 'bg-[#D6CBBE]/30 border-[#D6CBBE] text-[#202124] placeholder-[#8C8276]/70'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className={`text-xs uppercase tracking-wider block font-mono ${
                        isDark ? 'text-[#D6CBBE]' : 'text-[#8C8276]'
                      }`}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="youremail@example.com"
                        className={`w-full px-4 py-3 border focus:border-[#B08D57] text-sm focus:outline-hidden transition-colors ${
                          isDark
                            ? 'bg-[#202124] border-[#3A3C3E] text-[#F2EEE7] placeholder-[#8C8276]/70'
                            : 'bg-[#D6CBBE]/30 border-[#D6CBBE] text-[#202124] placeholder-[#8C8276]/70'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className={`text-xs uppercase tracking-wider block font-mono ${
                        isDark ? 'text-[#D6CBBE]' : 'text-[#8C8276]'
                      }`}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 XXXXXX7521"
                        className={`w-full px-4 py-3 border focus:border-[#B08D57] text-sm focus:outline-hidden transition-colors ${
                          isDark
                            ? 'bg-[#202124] border-[#3A3C3E] text-[#F2EEE7] placeholder-[#8C8276]/70'
                            : 'bg-[#D6CBBE]/30 border-[#D6CBBE] text-[#202124] placeholder-[#8C8276]/70'
                        }`}
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                      <label className={`text-xs uppercase tracking-wider block font-mono ${
                        isDark ? 'text-[#D6CBBE]' : 'text-[#8C8276]'
                      }`}>
                        Project Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Worli, South Mumbai"
                        className={`w-full px-4 py-3 border focus:border-[#B08D57] text-sm focus:outline-hidden transition-colors ${
                          isDark
                            ? 'bg-[#202124] border-[#3A3C3E] text-[#F2EEE7] placeholder-[#8C8276]/60'
                            : 'bg-[#D6CBBE]/30 border-[#D6CBBE] text-[#202124] placeholder-[#8C8276]/60'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Project Type */}
                    <div className="space-y-1.5">
                      <label className={`text-xs uppercase tracking-wider block font-mono ${
                        isDark ? 'text-[#D6CBBE]' : 'text-[#8C8276]'
                      }`}>
                        Typology
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className={`w-full px-4 py-3 border focus:border-[#B08D57] text-sm focus:outline-hidden cursor-pointer transition-colors ${
                          isDark
                            ? 'bg-[#202124] border-[#3A3C3E] text-[#F2EEE7]'
                            : 'bg-[#D6CBBE]/30 border-[#D6CBBE] text-[#202124]'
                        }`}
                      >
                        {projectTypes.map((type, i) => (
                          <option key={i} value={type} className={isDark ? 'bg-[#202124] text-[#F2EEE7]' : 'bg-[#F2EEE7] text-[#202124]'}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Budget Range */}
                    <div className="space-y-1.5">
                      <label className={`text-xs uppercase tracking-wider block font-mono ${
                        isDark ? 'text-[#D6CBBE]' : 'text-[#8C8276]'
                      }`}>
                        Estimated Budget Bracket
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className={`w-full px-4 py-3 border focus:border-[#B08D57] text-sm focus:outline-hidden cursor-pointer transition-colors ${
                          isDark
                            ? 'bg-[#202124] border-[#3A3C3E] text-[#F2EEE7]'
                            : 'bg-[#D6CBBE]/30 border-[#D6CBBE] text-[#202124]'
                        }`}
                      >
                        {budgetTiers.map((tier, i) => (
                          <option key={i} value={tier} className={isDark ? 'bg-[#202124] text-[#F2EEE7]' : 'bg-[#F2EEE7] text-[#202124]'}>
                            {tier}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className={`text-xs uppercase tracking-wider block font-mono ${
                      isDark ? 'text-[#D6CBBE]' : 'text-[#8C8276]'
                    }`}>
                      Project Vision & Spatial Scope *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Outline your architectural aspirations, preferred move-in timeline, key materials, or floorplan queries..."
                      className={`w-full px-4 py-3 border focus:border-[#B08D57] text-sm focus:outline-hidden resize-none transition-colors ${
                        isDark
                          ? 'bg-[#202124] border-[#3A3C3E] text-[#F2EEE7] placeholder-[#8C8276]/70'
                          : 'bg-[#D6CBBE]/30 border-[#D6CBBE] text-[#202124] placeholder-[#8C8276]/70'
                      }`}
                    />
                  </div>

                  {/* Preferred Contact Mode */}
                  <div className="space-y-3">
                    <label className={`text-xs uppercase tracking-wider block font-mono ${isDark ? 'text-[#D6CBBE]' : 'text-[#8C8276]'}`}>
                      Preferred Studio Dialogue Channel
                    </label>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <label
                        onClick={handleWhatsAppClick}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 border transition-all cursor-pointer select-none ${
                          formData.preferredContact === 'whatsapp'
                            ? 'bg-[#B08D57]/20 border-[#B08D57] shadow-sm'
                            : 'bg-[#202124]/40 border-[#3A3C3E] hover:border-[#B08D57]/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferredContact"
                          value="whatsapp"
                          checked={formData.preferredContact === 'whatsapp'}
                          onChange={handleWhatsAppClick}
                          className="accent-[#B08D57] cursor-pointer"
                        />
                        <span className={`font-mono tracking-wider uppercase transition-colors ${
                          formData.preferredContact === 'whatsapp'
                            ? 'text-[#B08D57] font-semibold'
                            : 'text-[#F2EEE7] hover:text-white font-medium'
                        }`}>
                          WhatsApp
                        </span>
                      </label>

                      <label
                        onClick={handleVoiceCallClick}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 border transition-all cursor-pointer select-none ${
                          formData.preferredContact === 'phone'
                            ? 'bg-[#B08D57]/20 border-[#B08D57] shadow-sm'
                            : 'bg-[#202124]/40 border-[#3A3C3E] hover:border-[#B08D57]/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferredContact"
                          value="phone"
                          checked={formData.preferredContact === 'phone'}
                          onChange={handleVoiceCallClick}
                          className="accent-[#B08D57] cursor-pointer"
                        />
                        <span className={`font-mono tracking-wider uppercase transition-colors ${
                          formData.preferredContact === 'phone'
                            ? 'text-[#B08D57] font-semibold'
                            : 'text-[#F2EEE7] hover:text-white font-medium'
                        }`}>
                          Voice Call
                        </span>
                      </label>

                      <label
                        onClick={handleEmailDossierClick}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 border transition-all cursor-pointer select-none ${
                          formData.preferredContact === 'email'
                            ? 'bg-[#B08D57]/20 border-[#B08D57] shadow-sm'
                            : 'bg-[#202124]/40 border-[#3A3C3E] hover:border-[#B08D57]/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferredContact"
                          value="email"
                          checked={formData.preferredContact === 'email'}
                          onChange={handleEmailDossierClick}
                          className="accent-[#B08D57] cursor-pointer"
                        />
                        <span className={`font-mono tracking-wider uppercase transition-colors ${
                          formData.preferredContact === 'email'
                            ? 'text-[#B08D57] font-semibold'
                            : 'text-[#F2EEE7] hover:text-white font-medium'
                        }`}>
                          Email Dossier
                        </span>
                      </label>
                    </div>

                    {/* Interactive Voice Call Options Box: Call via WhatsApp or Call Offline */}
                    {showVoiceOptions && (
                      <div className="p-4 bg-[#202124] border border-[#B08D57] space-y-3 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-[#B08D57] font-mono font-semibold">
                            Choose Voice Call Option (+91 89811 19608):
                          </span>
                          <span className="text-[10px] text-[#D6CBBE] font-mono">Immediate Connection</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {/* Option 1: Call via WhatsApp */}
                          <a
                            href="https://wa.me/918981119608"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-[#25D366]/20 border border-[#25D366] hover:bg-[#25D366] text-[#F2EEE7] hover:text-[#202124] text-xs uppercase tracking-wider font-semibold font-mono transition-all cursor-pointer shadow-sm"
                          >
                            <MessageSquare className="w-4 h-4 text-[#25D366]" />
                            <span>Call via WhatsApp</span>
                          </a>

                          {/* Option 2: Call Offline */}
                          <a
                            href="tel:+918981119608"
                            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-[#B08D57]/20 border border-[#B08D57] hover:bg-[#B08D57] text-[#F2EEE7] hover:text-[#202124] text-xs uppercase tracking-wider font-semibold font-mono transition-all cursor-pointer shadow-sm"
                          >
                            <Phone className="w-4 h-4 text-[#B08D57]" />
                            <span>Call Offline</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {formData.preferredContact === 'whatsapp' && (
                      <div className="p-3 bg-[#202124]/80 border border-[#B08D57]/50 text-xs text-[#D6CBBE] flex items-center justify-between gap-3 font-mono">
                        <span className="text-[#F2EEE7]">
                          Redirecting to WhatsApp (+918981119608). You can also complete and submit this form to log your dossier.
                        </span>
                        <a
                          href="https://wa.me/918981119608"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-[#25D366] text-black font-semibold uppercase text-[10px] tracking-wider shrink-0 hover:bg-[#1ebd5b] transition-colors"
                        >
                          Open WhatsApp ↗
                        </a>
                      </div>
                    )}

                    {formData.preferredContact === 'email' && (
                      <div className="p-3 bg-[#202124]/80 border border-[#B08D57]/50 text-xs text-[#D6CBBE] flex items-center gap-2 font-mono">
                        <Mail className="w-4 h-4 text-[#B08D57] shrink-0" />
                        <span>
                          Upon form submission, your complete credentials will be dispatched to{' '}
                          <strong className="text-[#B08D57]">conclaveinteriorexterior@gmail.com</strong>.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-[0.2em] transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Transmitting to Atelier...' : 'Submit Architectural Commission Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Voice Calling Popup Modal */}
      {showVoiceModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Direct Voice Calling Options"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowVoiceModal(false)}
        >
          <div
            className="bg-[#202124] border border-[#B08D57] max-w-md w-full p-7 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowVoiceModal(false)}
              className="absolute top-4 right-4 text-[#D6CBBE] hover:text-white p-1 transition-colors cursor-pointer"
              aria-label="Close voice modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-mono font-semibold block">
                DIRECT ATELIER VOICE DESK
              </span>
              <h3 className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7] font-light">
                Connect Immediately
              </h3>
              <p className="text-xs text-[#D6CBBE] font-light leading-relaxed">
                Choose your call route to reach our design directors at{' '}
                <strong className="text-[#B08D57] font-mono">+918981119608</strong>:
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Option 1: Call Via WhatsApp */}
              <a
                href="https://wa.me/918981119608"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowVoiceModal(false)}
                className="w-full flex items-center justify-center gap-3 py-4 px-5 bg-[#25D366] hover:bg-[#1ebd5b] text-[#202124] font-semibold text-xs uppercase tracking-[0.18em] font-mono transition-all shadow-md cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Call Via WhatsApp</span>
              </a>

              {/* Option 2: Call Normally */}
              <a
                href="tel:+918981119608"
                onClick={() => setShowVoiceModal(false)}
                className="w-full flex items-center justify-center gap-3 py-4 px-5 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-[0.18em] font-mono transition-all shadow-md cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Normally</span>
              </a>
            </div>

            <div className="pt-2 border-t border-[#3A3C3E] flex items-center justify-between text-[11px] text-[#8C8276] font-mono">
              <span>Studio Desk · Kolkata</span>
              <button
                onClick={() => {
                  setShowVoiceModal(false);
                  setIsFormDismissed(false);
                }}
                className="text-[#D6CBBE] hover:text-[#B08D57] underline underline-offset-2 cursor-pointer"
              >
                Return to form
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
