import React, { useState, useEffect, useRef } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Project, TestimonialItem } from '../../types';
import {
  MessageSquareQuote,
  Image as ImageIcon,
  Film,
  LogOut,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Trash2,
  Play,
  Star,
  ExternalLink,
  AlertCircle,
  Check,
  RefreshCw,
  Layers,
  ChevronRight,
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  X,
  FileVideo,
  FileImage,
} from 'lucide-react';
import { ProjectVideoModal } from '../projects/ProjectVideoModal';

// ============================================================================
// 1. SECURE ADMINISTRATOR LOGIN COMPONENT (When Unauthenticated at /admin)
// ============================================================================
export const AdminLogin: React.FC = () => {
  const { loginAdmin, setActivePage } = useStudio();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your administrator email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAdmin(trimmedEmail, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141517] text-[#F2EEE7] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      {/* Subtle Hairline Grid Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_right,#B08D57_1px,transparent_1px),linear-gradient(to_bottom,#B08D57_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />

      {/* Atmospheric Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radial from-[#B08D57]/10 via-transparent to-transparent blur-3xl pointer-events-none"
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#B08D57] flex items-center justify-center bg-[#1D1E22]">
            <span className="font-serif-title text-sm font-light text-[#B08D57]">C</span>
          </div>
          <div>
            <span className="font-serif-title text-lg tracking-[0.22em] uppercase text-[#F2EEE7] block leading-none">
              CONCLAVE
            </span>
            <span className="text-[8px] tracking-[0.35em] uppercase text-[#B08D57] font-semibold block mt-0.5 font-mono">
              INTERIORS
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            window.location.hash = '#home';
            setActivePage('home');
          }}
          className="inline-flex items-center gap-1.5 text-xs text-[#8E8A85] hover:text-[#B08D57] transition-colors uppercase tracking-widest font-mono cursor-pointer"
        >
          <span>Return to Site</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-12">
        <div className="bg-[#1C1D20]/95 border border-[#3A3C3E] p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Badge & Title */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B08D57]/10 border border-[#B08D57]/30 text-[#B08D57] text-[10px] uppercase font-mono tracking-widest">
              <Lock className="w-3 h-3" />
              <span>Restricted Administrator Access</span>
            </div>
            <h1 className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7] font-light tracking-wide mt-2">
              Atelier Management
            </h1>
            <p className="text-xs text-[#8E8A85] font-light leading-relaxed">
              Authenticate with authorized studio principal credentials to moderate client feedback and manage project media.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase font-mono tracking-widest text-[#B08D57] mb-2 font-medium">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E8A85] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="conclaveinteriorexterior@gmail.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className="w-full bg-[#141517] border border-[#3A3C3E] focus:border-[#B08D57] text-[#F2EEE7] pl-10 pr-4 py-2.5 text-xs sm:text-sm transition-all focus:outline-hidden disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-mono tracking-widest text-[#B08D57] mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8E8A85] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full bg-[#141517] border border-[#3A3C3E] focus:border-[#B08D57] text-[#F2EEE7] pl-10 pr-4 py-2.5 text-xs sm:text-sm transition-all focus:outline-hidden disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#B08D57] hover:bg-[#C29D64] active:bg-[#9E7D4B] text-[#141517] font-semibold text-xs uppercase tracking-[0.2em] font-mono transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-md"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-[#3A3C3E]/60 text-center">
            <p className="text-[10px] text-[#6E6A64] font-mono leading-relaxed">
              Protected by encrypted PostgreSQL session authentication, constant-time token comparison, and rate-limiting.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-[10px] text-[#6E6A64] font-mono">
        &copy; {new Date().getFullYear()} CONCLAVE INTERIORS ATELIER. Restricted Administrator Portal.
      </footer>
    </div>
  );
};

// ============================================================================
// 2. RESTRICTED ADMINISTRATOR PANEL (When Authenticated at /admin)
// Strictly provides ONLY 3 capabilities:
// 1. Client Feedback Moderation
// 2. Project Photos Management
// 3. Project Videos Management
// ============================================================================
export const RestrictedAdminPanel: React.FC = () => {
  const {
    testimonials,
    projects,
    currentUser,
    logoutAdmin,
    setActivePage,
    moderateFeedback,
    addProjectPhoto,
    setProjectCoverPhoto,
    deleteProjectPhoto,
    attachProjectVideo,
    deleteProjectVideo,
    uploadMediaFile,
    refreshFromDatabase,
  } = useStudio();

  // Active section tab: ONLY 3 TABS ALLOWED
  const [activeTab, setActiveTab] = useState<'feedback' | 'photos' | 'videos'>('feedback');

  // Notification Banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Preview Modal for Video Popup
  const [videoPopupProject, setVideoPopupProject] = useState<Project | null>(null);

  // Lightbox Modal for Photo Preview
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string; projectTitle: string } | null>(null);

  // Confirmation Modals State
  const [pendingConfirm, setPendingConfirm] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    onConfirm: async () => {},
  });

  const [isConfirmBusy, setIsConfirmBusy] = useState(false);

  const handleExecuteConfirm = async () => {
    setIsConfirmBusy(true);
    try {
      await pendingConfirm.onConfirm();
      setPendingConfirm((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      showToast('error', err.message || 'Operation failed');
    } finally {
      setIsConfirmBusy(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 1: CLIENT FEEDBACK STATE & HANDLERS
  // --------------------------------------------------------------------------
  const [feedbackFilter, setFeedbackFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const pendingTestimonialsCount = testimonials.filter((t) => t.status === 'PENDING').length;
  const approvedTestimonialsCount = testimonials.filter((t) => t.status === 'APPROVED').length;
  const rejectedTestimonialsCount = testimonials.filter((t) => t.status === 'REJECTED').length;

  const filteredTestimonials = testimonials.filter((t) => {
    if (feedbackFilter === 'ALL') return true;
    return t.status === feedbackFilter;
  });

  const handleModerateWithConfirm = (
    testimonial: TestimonialItem,
    targetStatus: 'APPROVED' | 'REJECTED' | 'PENDING'
  ) => {
    const isApproval = targetStatus === 'APPROVED';
    const isRejection = targetStatus === 'REJECTED';

    let title = 'Confirm Moderation Decision';
    let description = `Are you sure you want to mark feedback from "${testimonial.clientName}" as ${targetStatus}?`;
    let confirmLabel = `Set to ${targetStatus}`;

    if (isApproval) {
      title = 'Approve Client Feedback';
      description = `Approving feedback from "${testimonial.clientName}" will make it immediately visible on the public website's Patron Reflections section.`;
      confirmLabel = 'Approve & Publish Live';
    } else if (isRejection) {
      title = 'Reject Client Feedback';
      description = `Rejecting feedback from "${testimonial.clientName}" will ensure it is hidden from the public website while preserving the record for studio archives.`;
      confirmLabel = 'Reject & Hide from Website';
    }

    setPendingConfirm({
      isOpen: true,
      title,
      description,
      confirmLabel,
      isDestructive: isRejection,
      onConfirm: async () => {
        await moderateFeedback(testimonial.id, targetStatus);
        showToast('success', `Feedback status updated to ${targetStatus}.`);
      },
    });
  };

  // --------------------------------------------------------------------------
  // TAB 2: PROJECT PHOTOGRAPHS STATE & HANDLERS
  // --------------------------------------------------------------------------
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [photoUploadDestination, setPhotoUploadDestination] = useState<'gallery' | 'cover'>('gallery');
  const [photoAltText, setPhotoAltText] = useState('');
  const [photoUploadFile, setPhotoUploadFile] = useState<File | null>(null);
  const [photoUploadPreview, setPhotoUploadPreview] = useState<string | null>(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState<number>(0);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handlePhotoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Only photograph formats (JPEG, PNG, WebP, AVIF) are supported.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showToast('error', 'File size exceeds maximum 100MB limit.');
      return;
    }

    setPhotoUploadFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoUploadPreview(objectUrl);
  };

  const handleUploadPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUploadFile || !activeProject) {
      showToast('error', 'Please select a photo file and target project.');
      return;
    }

    setIsPhotoUploading(true);
    setPhotoUploadProgress(20);

    try {
      setPhotoUploadProgress(45);
      const uploadRes = await uploadMediaFile(photoUploadFile, photoAltText || activeProject.title);
      setPhotoUploadProgress(80);

      const isCover = photoUploadDestination === 'cover';
      await addProjectPhoto(activeProject.id, {
        url: uploadRes.url,
        alt: photoAltText || activeProject.title,
        setAsCover: isCover,
      });

      setPhotoUploadProgress(100);
      showToast(
        'success',
        isCover
          ? `Cover photograph updated for "${activeProject.title}".`
          : `Photograph appended to "${activeProject.title}" gallery.`
      );

      // Reset form
      setPhotoUploadFile(null);
      setPhotoUploadPreview(null);
      setPhotoAltText('');
      if (photoFileInputRef.current) photoFileInputRef.current.value = '';
    } catch (err: any) {
      showToast('error', err.message || 'Photograph upload failed.');
    } finally {
      setIsPhotoUploading(false);
      setPhotoUploadProgress(0);
    }
  };

  const handleSetCoverPhoto = (projectId: string, url: string, projectTitle: string) => {
    setPendingConfirm({
      isOpen: true,
      title: 'Designate Primary Cover Photograph',
      description: `Set this photograph as the primary cover image for "${projectTitle}"? It will appear as the lead visual in the horizontal gallery.`,
      confirmLabel: 'Set as Cover',
      onConfirm: async () => {
        await setProjectCoverPhoto(projectId, url);
        showToast('success', `Cover photograph updated for "${projectTitle}".`);
      },
    });
  };

  const handleDeletePhoto = (projectId: string, url: string, projectTitle: string) => {
    setPendingConfirm({
      isOpen: true,
      title: 'Delete Project Photograph',
      description: `Are you sure you want to delete this photograph from "${projectTitle}"? It will no longer appear in the public project gallery.`,
      confirmLabel: 'Delete Photograph',
      isDestructive: true,
      onConfirm: async () => {
        await deleteProjectPhoto(projectId, url);
        showToast('success', 'Photograph deleted successfully.');
      },
    });
  };

  // --------------------------------------------------------------------------
  // TAB 3: PROJECT VIDEOS STATE & HANDLERS
  // --------------------------------------------------------------------------
  const [videoTargetProjectId, setVideoTargetProjectId] = useState<string>(projects[0]?.id || '');
  const [videoUploadFile, setVideoUploadFile] = useState<File | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const videoTargetProject = projects.find((p) => p.id === videoTargetProjectId) || projects[0];

  const handleVideoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('error', 'Only video formats (MP4, WebM, MOV, OGG) are supported.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showToast('error', 'Video file exceeds the 100MB limit.');
      return;
    }

    setVideoUploadFile(file);
  };

  const handleUploadVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUploadFile || !videoTargetProject) {
      showToast('error', 'Please select a video file and target project.');
      return;
    }

    setIsVideoUploading(true);
    setVideoUploadProgress(25);

    try {
      setVideoUploadProgress(50);
      const uploadRes = await uploadMediaFile(videoUploadFile, `${videoTargetProject.title} Walkthrough`);
      setVideoUploadProgress(85);

      await attachProjectVideo(videoTargetProject.id, uploadRes.url);
      setVideoUploadProgress(100);

      showToast('success', `Walkthrough video attached to "${videoTargetProject.title}".`);

      setVideoUploadFile(null);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    } catch (err: any) {
      showToast('error', err.message || 'Video upload failed.');
    } finally {
      setIsVideoUploading(false);
      setVideoUploadProgress(0);
    }
  };

  const handleDeleteVideo = (projectId: string, projectTitle: string) => {
    setPendingConfirm({
      isOpen: true,
      title: 'Remove Project Walkthrough Video',
      description: `Are you sure you want to remove the video attached to "${projectTitle}"? The "Play Film" button will no longer appear on its card in the public gallery.`,
      confirmLabel: 'Remove Video',
      isDestructive: true,
      onConfirm: async () => {
        await deleteProjectVideo(projectId);
        showToast('success', `Video removed from "${projectTitle}".`);
      },
    });
  };

  // Collect total photos across all projects
  const totalPhotosCount = projects.reduce((acc, p) => {
    const galleryCount = Array.isArray(p.galleryImages) ? p.galleryImages.length : 0;
    const coverCount = p.coverImage ? 1 : 0;
    return acc + Math.max(galleryCount, coverCount);
  }, 0);

  const projectsWithVideoCount = projects.filter((p) => Boolean(p.videoUrl)).length;

  return (
    <div className="min-h-screen bg-[#18191B] text-[#F2EEE7] flex flex-col select-none font-sans">
      {/* -------------------------------------------------------------
          ADMIN TOP NAVIGATION BAR
      ------------------------------------------------------------- */}
      <header className="bg-[#121315] border-b border-[#2B2D2F] sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Logo & Role Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#B08D57] flex items-center justify-center bg-[#1D1E22]">
              <span className="font-serif-title text-sm font-light text-[#B08D57]">C</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title text-base sm:text-lg tracking-[0.2em] uppercase text-[#F2EEE7] font-normal">
                  CONCLAVE INTERIORS
                </span>
                <span className="px-1.5 py-0.5 bg-[#B08D57]/20 border border-[#B08D57]/40 text-[#B08D57] text-[9px] font-mono uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-[#8E8A85] font-mono tracking-wider block">
                {currentUser?.email || 'conclaveinteriorexterior@gmail.com'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Live Site & Logout */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => {
                window.location.hash = '#home';
                setActivePage('home');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#202124] hover:bg-[#2B2D2F] border border-[#3A3C3E] text-[#D8CFC1] hover:text-[#F2EEE7] text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer"
              title="Return to the live public website"
            >
              <Eye className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>Live Website</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#311A1A] hover:bg-[#4A2424] border border-rose-900/50 text-rose-200 text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer"
              title="Sign out of administrative session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          RESTRICTED TABS NAVIGATION (ONLY 3 TABS ALLOWED)
      ------------------------------------------------------------- */}
      <nav aria-label="Restricted Administration Sections" className="bg-[#1B1C1E] border-b border-[#2B2D2F] px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          {/* TAB 1: Client Feedback */}
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'feedback'
                ? 'border-[#B08D57] text-[#B08D57] font-semibold bg-[#202124]'
                : 'border-transparent text-[#8E8A85] hover:text-[#F2EEE7] hover:bg-[#202124]/50'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>1. Client Feedback</span>
            {pendingTestimonialsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold rounded-xs">
                {pendingTestimonialsCount} Pending
              </span>
            )}
          </button>

          {/* TAB 2: Project Photographs */}
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'photos'
                ? 'border-[#B08D57] text-[#B08D57] font-semibold bg-[#202124]'
                : 'border-transparent text-[#8E8A85] hover:text-[#F2EEE7] hover:bg-[#202124]/50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>2. Project Photos</span>
            <span className="text-[10px] text-[#6E6A64] font-mono">({totalPhotosCount})</span>
          </button>

          {/* TAB 3: Project Videos */}
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'videos'
                ? 'border-[#B08D57] text-[#B08D57] font-semibold bg-[#202124]'
                : 'border-transparent text-[#8E8A85] hover:text-[#F2EEE7] hover:bg-[#202124]/50'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>3. Project Videos</span>
            <span className="text-[10px] text-[#6E6A64] font-mono">({projectsWithVideoCount})</span>
          </button>
        </div>
      </nav>

      {/* Toast Notification Alert */}
      {notification && (
        <div className="max-w-7xl mx-auto px-6 pt-4 w-full">
          <div
            className={`p-3.5 border flex items-center justify-between text-xs font-mono tracking-wide ${
              notification.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN TAB CONTENT AREA
      ------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 flex-1 w-full space-y-8">
        {/* =========================================================
            SECTION 1: CLIENT FEEDBACK MODERATION
        ========================================================= */}
        {activeTab === 'feedback' && (
          <section className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#2B2D2F]">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-mono">
                  Moderation Gate
                </span>
                <h1 className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7] mt-1">
                  Client Feedback Moderation
                </h1>
                <p className="text-xs text-[#8E8A85] font-light mt-1 max-w-2xl">
                  Review submitted reflections. Only feedback marked as{' '}
                  <span className="text-emerald-400 font-mono">APPROVED</span> appears publicly in the Patron Testimonials section. Rejected and pending submissions remain strictly hidden.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setFeedbackFilter('PENDING')}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    feedbackFilter === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500 font-semibold'
                      : 'bg-[#202124] text-[#8E8A85] border border-[#3A3C3E] hover:text-[#F2EEE7]'
                  }`}
                >
                  Pending ({pendingTestimonialsCount})
                </button>

                <button
                  onClick={() => setFeedbackFilter('APPROVED')}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    feedbackFilter === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500 font-semibold'
                      : 'bg-[#202124] text-[#8E8A85] border border-[#3A3C3E] hover:text-[#F2EEE7]'
                  }`}
                >
                  Approved ({approvedTestimonialsCount})
                </button>

                <button
                  onClick={() => setFeedbackFilter('REJECTED')}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    feedbackFilter === 'REJECTED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500 font-semibold'
                      : 'bg-[#202124] text-[#8E8A85] border border-[#3A3C3E] hover:text-[#F2EEE7]'
                  }`}
                >
                  Rejected ({rejectedTestimonialsCount})
                </button>

                <button
                  onClick={() => setFeedbackFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    feedbackFilter === 'ALL'
                      ? 'bg-[#B08D57] text-[#141517] font-semibold'
                      : 'bg-[#202124] text-[#8E8A85] border border-[#3A3C3E] hover:text-[#F2EEE7]'
                  }`}
                >
                  All ({testimonials.length})
                </button>
              </div>
            </div>

            {/* Feedback Cards List */}
            {filteredTestimonials.length === 0 ? (
              <div className="bg-[#1C1D20] border border-[#2B2D2F] p-12 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#8E8A85] mx-auto opacity-40" />
                <h3 className="text-base text-[#F2EEE7] font-serif-title">
                  No {feedbackFilter !== 'ALL' ? feedbackFilter.toLowerCase() : ''} feedback submissions
                </h3>
                <p className="text-xs text-[#8E8A85] max-w-sm mx-auto font-light">
                  {feedbackFilter === 'PENDING'
                    ? 'All incoming client reflections have been reviewed.'
                    : 'There are no feedback submissions in this category.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTestimonials.map((item) => (
                  <article
                    key={item.id}
                    className="bg-[#1C1D20] border border-[#2B2D2F] hover:border-[#3A3C3E] p-6 transition-all space-y-4"
                  >
                    {/* Top Row: Client Info, Rating, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif-title text-lg text-[#F2EEE7] font-medium">
                            {item.clientName}
                          </h3>
                          {item.clientRole && (
                            <span className="text-xs text-[#8E8A85] font-light">
                              — {item.clientRole}
                            </span>
                          )}
                        </div>

                        {item.projectReference && (
                          <span className="text-[11px] font-mono text-[#B08D57] block mt-0.5">
                            Project Reference: {item.projectReference}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Rating Stars */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (item.rating || 5)
                                  ? 'text-[#B08D57] fill-[#B08D57]'
                                  : 'text-[#3A3C3E]'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
                            item.status === 'APPROVED'
                              ? 'bg-emerald-950/60 border border-emerald-600/60 text-emerald-300'
                              : item.status === 'REJECTED'
                              ? 'bg-rose-950/60 border border-rose-600/60 text-rose-300'
                              : 'bg-amber-950/60 border border-amber-600/60 text-amber-300'
                          }`}
                        >
                          {item.status === 'APPROVED' && <Check className="w-3 h-3 text-emerald-400" />}
                          {item.status === 'REJECTED' && <X className="w-3 h-3 text-rose-400" />}
                          {item.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-400 animate-pulse" />}
                          <span>{item.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Feedback Text */}
                    <div className="bg-[#141517] p-4 border border-[#2B2D2F]/80 text-[#D8CFC1] text-xs sm:text-sm font-light leading-relaxed italic">
                      "{item.feedbackMessage}"
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#2B2D2F]/60">
                      <div className="text-[11px] text-[#8E8A85] font-mono space-y-0.5">
                        <div>
                          Submitted: {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Unknown date'}
                        </div>
                        {item.moderatedAt && (
                          <div className="text-[10px] text-[#6E6A64]">
                            Moderated: {new Date(item.moderatedAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                          </div>
                        )}
                      </div>

                      {/* Moderation Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {item.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleModerateWithConfirm(item, 'APPROVED')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Approve</span>
                          </button>
                        )}

                        {item.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleModerateWithConfirm(item, 'REJECTED')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-200 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 text-rose-400" />
                            <span>Reject</span>
                          </button>
                        )}

                        {item.status !== 'PENDING' && (
                          <button
                            onClick={() => handleModerateWithConfirm(item, 'PENDING')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#202124] hover:bg-[#2B2D2F] border border-[#3A3C3E] text-[#8E8A85] hover:text-[#F2EEE7] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Reset to Pending</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =========================================================
            SECTION 2: PROJECT PHOTOGRAPHS MANAGEMENT
        ========================================================= */}
        {activeTab === 'photos' && (
          <section className="space-y-8">
            {/* Header & Target Project Selector */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#2B2D2F]">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-mono">
                  Visual Media Infrastructure
                </span>
                <h1 className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7] mt-1">
                  Project Photographs
                </h1>
                <p className="text-xs text-[#8E8A85] font-light mt-1">
                  Upload, inspect, assign, and delete high-resolution architectural photography for projects.
                </p>
              </div>

              {/* Target Project Dropdown */}
              <div className="space-y-1.5 min-w-[280px]">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#B08D57] block">
                  Select Project:
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#1C1D20] border border-[#3A3C3E] focus:border-[#B08D57] text-[#F2EEE7] px-3.5 py-2 text-xs sm:text-sm font-sans focus:outline-hidden cursor-pointer"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title} ({proj.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload Photograph Form Card */}
            <div className="bg-[#1C1D20] border border-[#2B2D2F] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[#2B2D2F]">
                <Upload className="w-4 h-4 text-[#B08D57]" />
                <h2 className="font-serif-title text-lg text-[#F2EEE7]">
                  Upload Photograph to "{activeProject?.title}"
                </h2>
              </div>

              <form onSubmit={handleUploadPhotoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Upload Box */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CFC1] mb-2 font-medium">
                      Select Photograph File:
                    </label>
                    <div
                      onClick={() => photoFileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#3A3C3E] hover:border-[#B08D57] bg-[#141517] p-6 text-center cursor-pointer transition-colors space-y-2"
                    >
                      <input
                        ref={photoFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handlePhotoFileSelected}
                        className="hidden"
                      />
                      <FileImage className="w-8 h-8 text-[#B08D57] mx-auto opacity-75" />
                      <p className="text-xs text-[#F2EEE7] font-medium">
                        {photoUploadFile ? photoUploadFile.name : 'Click to select or drag photograph'}
                      </p>
                      <p className="text-[10px] text-[#8E8A85] font-mono">
                        Supports JPEG, PNG, WebP, AVIF up to 100MB
                      </p>
                    </div>
                  </div>

                  {/* Destination & Caption */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CFC1] mb-2 font-medium">
                        Photo Placement:
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs text-[#F2EEE7] cursor-pointer">
                          <input
                            type="radio"
                            name="photoDestination"
                            checked={photoUploadDestination === 'gallery'}
                            onChange={() => setPhotoUploadDestination('gallery')}
                            className="accent-[#B08D57]"
                          />
                          <span>Add to Project Gallery</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-[#F2EEE7] cursor-pointer">
                          <input
                            type="radio"
                            name="photoDestination"
                            checked={photoUploadDestination === 'cover'}
                            onChange={() => setPhotoUploadDestination('cover')}
                            className="accent-[#B08D57]"
                          />
                          <span>Set as Primary Cover Photograph</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CFC1] mb-2 font-medium">
                        Caption / Alt Text (Optional):
                      </label>
                      <input
                        type="text"
                        value={photoAltText}
                        onChange={(e) => setPhotoAltText(e.target.value)}
                        placeholder={`e.g., Natural light study in ${activeProject?.title}`}
                        className="w-full bg-[#141517] border border-[#3A3C3E] focus:border-[#B08D57] text-[#F2EEE7] px-3.5 py-2 text-xs focus:outline-hidden"
                      />
                    </div>

                    {/* Preview Thumbnail if selected */}
                    {photoUploadPreview && (
                      <div className="flex items-center gap-3 p-2 bg-[#141517] border border-[#2B2D2F]">
                        <img
                          src={photoUploadPreview}
                          alt="Upload preview"
                          className="w-12 h-12 object-cover border border-[#3A3C3E]"
                        />
                        <div className="text-[11px] font-mono text-[#8E8A85] truncate">
                          {photoUploadFile?.name} ({(photoUploadFile?.size ? (photoUploadFile.size / 1024 / 1024).toFixed(2) : '0')} MB)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {isPhotoUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#B08D57]">
                      <span>Streaming to PostgreSQL Media Store...</span>
                      <span>{photoUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#141517] overflow-hidden">
                      <div
                        className="h-full bg-[#B08D57] transition-all duration-200"
                        style={{ width: `${photoUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!photoUploadFile || isPhotoUploading}
                    className="px-6 py-2.5 bg-[#B08D57] hover:bg-[#C29D64] active:bg-[#9E7D4B] text-[#141517] font-semibold text-xs font-mono uppercase tracking-widest transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
                  >
                    {isPhotoUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Photograph</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Photographs Grid for Selected Project */}
            {activeProject && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-title text-xl text-[#F2EEE7]">
                    Photographs in "{activeProject.title}"
                  </h3>
                  <span className="text-xs font-mono text-[#8E8A85]">
                    Cover + {activeProject.galleryImages?.length || 0} Gallery Photographs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Primary Cover Image Card */}
                  {activeProject.coverImage && (
                    <div className="bg-[#1C1D20] border-2 border-[#B08D57] p-3 space-y-3 relative group">
                      <div className="aspect-16/10 relative overflow-hidden bg-[#141517]">
                        <img
                          src={activeProject.coverImage}
                          alt={activeProject.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#B08D57] text-[#141517] text-[10px] font-mono uppercase tracking-wider font-bold">
                          Primary Cover
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-mono text-[#8E8A85] truncate">
                          {activeProject.coverImage}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#2B2D2F]">
                          <button
                            onClick={() =>
                              setLightboxPhoto({
                                url: activeProject.coverImage,
                                title: `${activeProject.title} (Primary Cover)`,
                                projectTitle: activeProject.title,
                              })
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F2EEE7] hover:text-[#B08D57] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handleDeletePhoto(activeProject.id, activeProject.coverImage, activeProject.title)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 hover:text-rose-300 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gallery Images Cards */}
                  {Array.isArray(activeProject.galleryImages) &&
                    activeProject.galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1C1D20] border border-[#2B2D2F] hover:border-[#3A3C3E] p-3 space-y-3 relative group transition-all"
                      >
                        <div className="aspect-16/10 relative overflow-hidden bg-[#141517]">
                          <img
                            src={img.url}
                            alt={img.alt || `Photo ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#141517]/80 text-[#D8CFC1] text-[10px] font-mono uppercase tracking-wider">
                            Gallery Monograph #{idx + 1}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[11px] font-mono text-[#8E8A85] truncate">
                            {img.caption || img.alt || img.url}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#2B2D2F]">
                            <button
                              onClick={() =>
                                setLightboxPhoto({
                                  url: img.url,
                                  title: img.caption || img.alt || `Gallery Photo #${idx + 1}`,
                                  projectTitle: activeProject.title,
                                })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F2EEE7] hover:text-[#B08D57] cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleSetCoverPhoto(activeProject.id, img.url, activeProject.title)}
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#B08D57] hover:underline cursor-pointer"
                                title="Promote this photograph to project cover"
                              >
                                <span>Make Cover</span>
                              </button>

                              <button
                                onClick={() => handleDeletePhoto(activeProject.id, img.url, activeProject.title)}
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 hover:text-rose-300 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* =========================================================
            SECTION 3: PROJECT VIDEOS MANAGEMENT
        ========================================================= */}
        {activeTab === 'videos' && (
          <section className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#2B2D2F]">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-mono">
                  Cinematic Motion Infrastructure
                </span>
                <h1 className="font-serif-title text-2xl sm:text-3xl text-[#F2EEE7] mt-1">
                  Project Walkthrough Videos
                </h1>
                <p className="text-xs text-[#8E8A85] font-light mt-1 max-w-2xl">
                  Upload and preview architectural walkthrough films. Attaching a video automatically displays the tasteful "Play Film" button on that project's card in the public horizontal gallery.
                </p>
              </div>

              <span className="text-xs font-mono text-[#B08D57] bg-[#B08D57]/10 border border-[#B08D57]/30 px-3 py-1.5 self-start md:self-auto">
                {projectsWithVideoCount} of {projects.length} Projects with Film Attached
              </span>
            </div>

            {/* Direct Video Upload Card */}
            <div className="bg-[#1C1D20] border border-[#2B2D2F] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[#2B2D2F]">
                <Film className="w-4 h-4 text-[#B08D57]" />
                <h2 className="font-serif-title text-lg text-[#F2EEE7]">
                  Upload & Attach Walkthrough Video
                </h2>
              </div>

              <form onSubmit={handleUploadVideoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Selector */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CFC1] mb-2 font-medium">
                      Select Target Project:
                    </label>
                    <select
                      value={videoTargetProjectId}
                      onChange={(e) => setVideoTargetProjectId(e.target.value)}
                      className="w-full bg-[#141517] border border-[#3A3C3E] focus:border-[#B08D57] text-[#F2EEE7] px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden cursor-pointer"
                    >
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.title} {proj.videoUrl ? '• (Has Video Attached)' : '• (No Video)'}
                        </option>
                      ))}
                    </select>

                    {videoTargetProject?.videoUrl && (
                      <p className="text-[11px] text-amber-400/90 font-mono mt-2">
                        Notice: Uploading a new video will replace the current film attached to this project.
                      </p>
                    )}
                  </div>

                  {/* Video File Picker */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CFC1] mb-2 font-medium">
                      Select Video File (MP4, WebM, MOV):
                    </label>
                    <div
                      onClick={() => videoFileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#3A3C3E] hover:border-[#B08D57] bg-[#141517] p-6 text-center cursor-pointer transition-colors space-y-2"
                    >
                      <input
                        ref={videoFileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/ogg"
                        onChange={handleVideoFileSelected}
                        className="hidden"
                      />
                      <FileVideo className="w-8 h-8 text-[#B08D57] mx-auto opacity-75" />
                      <p className="text-xs text-[#F2EEE7] font-medium">
                        {videoUploadFile ? videoUploadFile.name : 'Click to select or drag video file'}
                      </p>
                      <p className="text-[10px] text-[#8E8A85] font-mono">
                        Supports MP4, WebM, MOV up to 100MB with byte-range HTTP streaming
                      </p>
                    </div>
                  </div>
                </div>

                {/* Video Upload Progress */}
                {isVideoUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#B08D57]">
                      <span>Streaming video to PostgreSQL database blobs...</span>
                      <span>{videoUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#141517] overflow-hidden">
                      <div
                        className="h-full bg-[#B08D57] transition-all duration-200"
                        style={{ width: `${videoUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!videoUploadFile || isVideoUploading}
                    className="px-6 py-2.5 bg-[#B08D57] hover:bg-[#C29D64] active:bg-[#9E7D4B] text-[#141517] font-semibold text-xs font-mono uppercase tracking-widest transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
                  >
                    {isVideoUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Uploading Video File...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload & Attach Video</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Projects & Attached Videos */}
            <div className="space-y-4">
              <h3 className="font-serif-title text-xl text-[#F2EEE7]">
                Project Video Attachments & Playback
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-[#1C1D20] border border-[#2B2D2F] hover:border-[#3A3C3E] p-5 space-y-4 transition-all"
                  >
                    {/* Project Title Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-serif-title text-lg text-[#F2EEE7]">
                          {proj.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#B08D57] uppercase tracking-wider">
                          {proj.category}
                        </span>
                      </div>

                      {proj.videoUrl ? (
                        <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-[10px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Video Attached</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-[#202124] border border-[#3A3C3E] text-[#8E8A85] text-[10px] font-mono uppercase tracking-wider">
                          No Video
                        </span>
                      )}
                    </div>

                    {/* Video Player or Fallback Cover Preview */}
                    {proj.videoUrl ? (
                      <div className="space-y-3">
                        <div className="aspect-16/9 bg-black border border-[#2B2D2F] overflow-hidden relative">
                          <video
                            src={proj.videoUrl}
                            controls
                            preload="metadata"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="text-[11px] font-mono text-[#8E8A85] truncate">
                          Source URL: {proj.videoUrl}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#2B2D2F]">
                          <button
                            onClick={() => setVideoPopupProject(proj)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#202124] hover:bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7] text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors"
                            title="Test this video in the public site popup modal"
                          >
                            <Play className="w-3.5 h-3.5 text-[#B08D57] fill-[#B08D57]" />
                            <span>Test in Video Popup</span>
                          </button>

                          <button
                            onClick={() => handleDeleteVideo(proj.id, proj.title)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Video</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-16/9 bg-[#141517] border border-[#2B2D2F] flex flex-col items-center justify-center p-6 text-center space-y-2">
                        <FileVideo className="w-8 h-8 text-[#6E6A64] opacity-40" />
                        <p className="text-xs text-[#8E8A85]">
                          No walkthrough film is currently attached to this project.
                        </p>
                        <button
                          onClick={() => {
                            setVideoTargetProjectId(proj.id);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="text-[11px] font-mono text-[#B08D57] hover:underline cursor-pointer pt-1"
                        >
                          + Upload Video for {proj.title}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* -------------------------------------------------------------
          CONFIRMATION MODAL (Required for all changes & deletions)
      ------------------------------------------------------------- */}
      {pendingConfirm.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
        >
          <div className="bg-[#1C1D20] border border-[#3A3C3E] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="font-serif-title text-xl text-[#F2EEE7]">
                {pendingConfirm.title}
              </h3>
              <p className="text-xs text-[#D8CFC1] font-light leading-relaxed">
                {pendingConfirm.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2B2D2F]">
              <button
                onClick={() => setPendingConfirm((prev) => ({ ...prev, isOpen: false }))}
                disabled={isConfirmBusy}
                className="px-4 py-2 border border-[#3A3C3E] text-[#8E8A85] hover:text-[#F2EEE7] text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleExecuteConfirm}
                disabled={isConfirmBusy}
                className={`px-5 py-2 font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  pendingConfirm.isDestructive
                    ? 'bg-rose-900 hover:bg-rose-800 text-white'
                    : 'bg-[#B08D57] hover:bg-[#C29D64] text-[#141517]'
                }`}
              >
                {isConfirmBusy ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{pendingConfirm.confirmLabel}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          PHOTO LIGHTBOX PREVIEW MODAL
      ------------------------------------------------------------- */}
      {lightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-[#1C1D20] border border-[#3A3C3E] p-4 space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif-title text-lg text-[#F2EEE7]">
                  {lightboxPhoto.title}
                </h4>
                <span className="text-[10px] font-mono text-[#B08D57]">
                  Project: {lightboxPhoto.projectTitle}
                </span>
              </div>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-1 text-[#8E8A85] hover:text-[#F2EEE7] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          PROJECT VIDEO POPUP MODAL (Reuses Public Site Experience)
      ------------------------------------------------------------- */}
      {videoPopupProject && (
        <ProjectVideoModal
          project={videoPopupProject}
          onClose={() => setVideoPopupProject(null)}
        />
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT WRAPPER: Routes to Login when unauthenticated, Restricted Admin when authenticated
// ============================================================================
export const AdminPanel: React.FC = () => {
  const { isAdminLoggedIn, authLoading } = useStudio();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#141517] flex items-center justify-center text-[#B08D57] font-mono text-xs">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Verifying Atelier Administrative Session...</span>
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <AdminLogin />;
  }

  return <RestrictedAdminPanel />;
};
