import React, { useState, useEffect, useRef } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  X,
  MessageSquare,
  Phone,
  Send,
  CheckCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export const QueryModal: React.FC = () => {
  const {
    isQueryModalOpen,
    setIsQueryModalOpen,
    queryInitialTab,
    settings,
    submitEnquiry,
  } = useStudio();

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'call' | 'enquiry'>('enquiry');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (queryInitialTab) {
      setActiveTab(queryInitialTab);
    }
  }, [queryInitialTab, isQueryModalOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQueryModalOpen) {
        setIsQueryModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQueryModalOpen, setIsQueryModalOpen]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'Private Residence Interior Design',
    location: '',
    budget: '₹150,000 – ₹300,000',
    preferredContact: 'whatsapp' as 'phone' | 'whatsapp' | 'email',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isQueryModalOpen) return null;

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all mandatory fields marked with *.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      submitEnquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        projectType: formData.projectType,
        location: formData.location.trim() || 'Undisclosed',
        budget: formData.budget,
        preferredContact: formData.preferredContact,
        message: formData.message.trim(),
      });

      setIsSubmitting(false);
      setIsSuccess(true);
    }, 500);
  };

  const handleClose = () => {
    setIsQueryModalOpen(false);
    setIsSuccess(false);
    setError('');
  };

  const whatsappCleanNumber = '918981119608';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="query-dialog-title"
      className="fixed inset-0 z-50 bg-[#202124]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl bg-[#202124] text-[#F2EEE7] border border-[#3A3C3E] p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close query dialogue"
          className="absolute top-4 right-4 p-2 text-[#D6CBBE] hover:text-[#F2EEE7] hover:bg-[#2B2D2F] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 border-b border-[#3A3C3E] pb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B08D57]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold font-mono">
              CONCLAVE CONCIERGE
            </span>
          </div>
          <h2 id="query-dialog-title" className="font-serif-title text-2xl sm:text-3xl font-light text-[#F2EEE7]">
            Connect with the Studio
          </h2>
          <p className="text-xs text-[#8C8276] font-light">
            Select your preferred consultation channel to engage our architectural directors.
          </p>
        </div>

        {/* Channel Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 my-5">
          <button
            onClick={() => {
              setActiveTab('whatsapp');
              setIsSuccess(false);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-2 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-[#2B2D2F] text-[#B08D57] border border-[#B08D57]'
                : 'bg-[#202124] text-[#D6CBBE] border border-[#3A3C3E] hover:border-[#B08D57]/40'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('call');
              setIsSuccess(false);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-2 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              activeTab === 'call'
                ? 'bg-[#2B2D2F] text-[#B08D57] border border-[#B08D57]'
                : 'bg-[#202124] text-[#D6CBBE] border border-[#3A3C3E] hover:border-[#B08D57]/40'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('enquiry');
              setIsSuccess(false);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-2 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              activeTab === 'enquiry'
                ? 'bg-[#2B2D2F] text-[#B08D57] border border-[#B08D57]'
                : 'bg-[#202124] text-[#D6CBBE] border border-[#3A3C3E] hover:border-[#B08D57]/40'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enquiry</span>
          </button>
        </div>

        {/* TAB 1: WHATSAPP DIALOGUE */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4 py-2 animate-in fade-in">
            <div className="p-4 bg-[#2B2D2F] border border-[#3A3C3E] space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#B08D57] font-semibold block font-mono">
                INSTANT ATELIER DIALOGUE
              </span>
              <p className="text-xs text-[#D6CBBE] leading-relaxed">
                Start an encrypted conversation with our design desk on WhatsApp for fast questions, spatial moodboards, and appointment scheduling.
              </p>
            </div>

            <div className="space-y-1 text-xs text-[#D6CBBE]">
              <span className="block font-mono text-[11px] text-[#B08D57]">Direct Studio Number:</span>
              <span className="text-base text-[#F2EEE7] font-mono">+918981119608</span>
            </div>

            <a
              href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(
                "Hello Conclave Interiors, I would like to schedule an architectural consultation regarding a prospective project."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Launch WhatsApp Chat</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* TAB 2: DIRECT CALL */}
        {activeTab === 'call' && (
          <div className="space-y-4 py-2 animate-in fade-in">
            <div className="p-4 bg-[#2B2D2F] border border-[#3A3C3E] space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#B08D57] font-semibold block font-mono">
                VOICE CONSULTATION DESK
              </span>
              <p className="text-xs text-[#D6CBBE] leading-relaxed">
                Connect directly with our senior project coordinator for immediate telephone assistance regarding turnkey scopes and design fees.
              </p>
            </div>

            <div className="p-4 bg-[#202124] border border-[#3A3C3E] hover:border-[#B08D57]/40 transition-colors space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#B08D57] block font-mono font-semibold">
                Studio Operating Hours:
              </span>
              <p className="text-xs text-[#F2EEE7] font-mono font-medium tracking-wide">
                {(settings.workingHours || 'Monday – Saturday: 10:00 to 20:00 IST').replaceAll('18:00', '20:00').replaceAll('18:30', '20:00')}
              </p>
            </div>

            <a
              href="tel:+918981119608"
              className="w-full py-3.5 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Dial +918981119608</span>
            </a>
          </div>
        )}

        {/* TAB 3: STRUCTURED ENQUIRY FORM */}
        {activeTab === 'enquiry' && (
          <div className="animate-in fade-in">
            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#B08D57]/20 border border-[#B08D57] flex items-center justify-center mx-auto text-[#B08D57]">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <h3 className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7]">
                  Consultation Request Logged
                </h3>

                <p className="text-xs text-[#D6CBBE] max-w-sm mx-auto leading-relaxed">
                  Thank you, {formData.name}. Our principal architects will review your parameters and follow up via {formData.preferredContact}.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-[#B08D57] text-[#202124] text-xs uppercase tracking-widest font-semibold hover:bg-[#9A7844] transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-[#D6CBBE] block font-mono">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] focus:border-[#B08D57] text-xs text-[#F2EEE7] placeholder-[#8C8276]/70 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-[#D6CBBE] block font-mono">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXXX7521"
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] focus:border-[#B08D57] text-xs text-[#F2EEE7] placeholder-[#8C8276]/70 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-[#D6CBBE] block font-mono">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="youremail@example.com"
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] focus:border-[#B08D57] text-xs text-[#F2EEE7] placeholder-[#8C8276]/70 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-[#D6CBBE] block font-mono">
                      Project Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City / Area"
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] focus:border-[#B08D57] text-xs text-[#F2EEE7] placeholder-[#8C8276]/60 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-[#D6CBBE] block font-mono">
                    Project Vision / Spatial Brief *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly describe your space, timeline, and architectural requirements..."
                    className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] focus:border-[#B08D57] text-xs text-[#F2EEE7] placeholder-[#8C8276]/60 focus:outline-hidden resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Transmitting...' : 'Submit Consultation Request'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
