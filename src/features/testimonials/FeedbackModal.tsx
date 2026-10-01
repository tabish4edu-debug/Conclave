import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { X, Star, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { submitFeedback } = useStudio();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [projectReference, setProjectReference] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError('Please write at least 10 characters describing your experience.');
      return;
    }
    if (!consent) {
      setError('Please confirm consent for studio moderation and publication.');
      return;
    }

    setError('');
    submitFeedback({
      clientName: name.trim(),
      clientRole: role.trim() || 'Private Client',
      projectReference: projectReference.trim() || undefined,
      rating,
      feedbackMessage: message.trim(),
    });

    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setName('');
    setRole('');
    setProjectReference('');
    setMessage('');
    setRating(5);
    setConsent(false);
    setIsSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 bg-[#202124]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#202124] text-[#F2EEE7] border border-[#3A3C3E] p-6 sm:p-8 shadow-2xl">
        <button
          onClick={handleResetAndClose}
          aria-label="Close feedback form"
          className="absolute top-4 right-4 p-2 text-[#D6CBBE] hover:text-[#F2EEE7] hover:bg-[#2B2D2F] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#B08D57]/20 border border-[#B08D57] flex items-center justify-center mx-auto text-[#B08D57]">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7]">
              Feedback Received
            </h3>

            <div className="p-4 bg-[#2B2D2F] border border-[#3A3C3E] text-xs text-[#D6CBBE] space-y-2 text-left">
              <div className="flex items-center gap-2 text-[#B08D57] font-semibold uppercase tracking-wider text-[11px] font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Status: PENDING ADMIN MODERATION</span>
              </div>
              <p className="text-[#8C8276]">
                Thank you for your review. In accordance with Conclave Interiors privacy and quality standards, all new testimonials are submitted under <strong>STATUS = PENDING</strong> and will be reviewed by our studio director before appearing publicly.
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="px-6 py-3 bg-[#B08D57] text-[#202124] text-xs font-semibold uppercase tracking-widest hover:bg-[#9A7844] transition-all cursor-pointer"
            >
              Return to Website
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 border-b border-[#3A3C3E] pb-4">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold font-mono">
                CLIENT REFLECTIONS
              </span>
              <h3 id="feedback-modal-title" className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7]">
                Submit Client Feedback
              </h3>
              <p className="text-xs text-[#8C8276] font-light">
                Share your architectural collaboration experience. Your review will be held for studio moderation.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Rating Stars */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#D6CBBE] block font-mono">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} stars`}
                    className="p-1 text-[#D6CBBE] hover:text-[#B08D57] transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-[#B08D57] fill-[#B08D57]'
                          : 'text-[#3A3C3E]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Client Name */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-[#D6CBBE] block font-mono">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mr. & Mrs. Singhania"
                className="w-full px-3.5 py-2.5 bg-[#2B2D2F] border border-[#3A3C3E] focus:border-[#B08D57] text-sm text-[#F2EEE7] placeholder-[#8C8276]/60 focus:outline-hidden"
              />
            </div>

            {/* Role / Title */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-[#D6CBBE] block font-mono">
                Designation / Residence Type
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Penthouse Owner / Hospitality Director"
                className="w-full px-3.5 py-2.5 bg-[#2B2D2F] border border-[#3A3C3E] focus:border-[#B08D57] text-sm text-[#F2EEE7] placeholder-[#8C8276]/60 focus:outline-hidden"
              />
            </div>

            {/* Project Reference */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-[#D6CBBE] block font-mono">
                Project Reference / Location
              </label>
              <input
                type="text"
                value={projectReference}
                onChange={(e) => setProjectReference(e.target.value)}
                placeholder="e.g. The Monolith Villa, Alibaug"
                className="w-full px-3.5 py-2.5 bg-[#2B2D2F] border border-[#3A3C3E] focus:border-[#B08D57] text-sm text-[#F2EEE7] placeholder-[#8C8276]/60 focus:outline-hidden"
              />
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-[#D6CBBE] block font-mono">
                Your Experience & Reflection *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your design journey, material detailing, and space completion..."
                className="w-full px-3.5 py-2.5 bg-[#2B2D2F] border border-[#3A3C3E] focus:border-[#B08D57] text-sm text-[#F2EEE7] placeholder-[#8C8276]/60 focus:outline-hidden resize-none"
              />
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="consent-check"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-[#B08D57]"
              />
              <label htmlFor="consent-check" className="text-xs text-[#8C8276] font-light cursor-pointer">
                I authorize Conclave Interiors to review and display this feedback upon administrative moderation.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer"
              >
                Submit Feedback for Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
