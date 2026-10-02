import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  LayoutDashboard,
  FolderKanban,
  Sliders,
  Images,
  Briefcase,
  UserCheck,
  MessageSquare,
  Inbox,
  HelpCircle,
  Settings,
  ShieldAlert,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  X,
  Star,
  Eye,
  ArrowUpRight,
  RefreshCw,
  Database,
  Lock,
  ExternalLink,
  ChevronRight,
  Filter,
  UploadCloud,
  FolderOpen,
  History,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Project,
  HeroSlide,
  ContinuousStripItem,
  ServiceItem,
  TestimonialItem,
  EnquiryItem,
  FaqItem,
  MediaItem,
} from '../../types';
import { ImageUploadField } from '../../components/common/ImageUploadField';

export const AdminPanel: React.FC = () => {
  const {
    isAdminLoggedIn,
    currentUser,
    authLoading,
    loginAdmin,
    logoutAdmin,
    changePassword,
    isLoadingData,
    refreshFromDatabase,
    setActivePage,
    settings,
    updateSettings,
    projects,
    addProject,
    updateProject,
    deleteProject,
    publishProject,
    duplicateProject,
    stripItems,
    addStripItem,
    updateStripItem,
    deleteStripItem,
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    publishHeroSlide,
    services,
    addService,
    updateService,
    deleteService,
    publishService,
    testimonials,
    moderateFeedback,
    toggleFeatureFeedback,
    deleteFeedback,
    enquiries,
    updateEnquiryStatus,
    deleteEnquiry,
    faqs,
    addFaq,
    updateFaq,
    deleteFaq,
    publishFaq,
    about,
    updateAbout,
    resetToDefaults,
    publicationStatus,
    publishBatchLive,
    isPreviewMode,
    togglePreviewMode,
    mediaItems,
    uploadMediaFile,
    deleteMediaItem,
    publicationHistory,
  } = useStudio();

  // Active Admin Section Tab
  const [currentTab, setCurrentTab] = useState<
    | 'dashboard'
    | 'projects'
    | 'hero'
    | 'strip'
    | 'services'
    | 'about'
    | 'media'
    | 'testimonials'
    | 'enquiries'
    | 'faq'
    | 'settings'
    | 'history'
    | 'database'
  >('dashboard');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Publication Modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishNotes, setPublishNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState('');

  // Project Editor state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectFilter, setProjectFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Hero Slide Editor state
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Enquiry filter
  const [enquiryFilter, setEnquiryFilter] = useState<string>('ALL');

  // Media Library state
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);
  const [copiedMediaUrl, setCopiedMediaUrl] = useState<string | null>(null);
  const [mediaTabFilter, setMediaTabFilter] = useState<'all' | 'image' | 'video'>('all');
  const [newGalleryItem, setNewGalleryItem] = useState<{ url: string; alt: string; caption?: string }>({ url: '', alt: '', caption: '' });

  // Handle Admin Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both administrator email and password.');
      return;
    }
    setLoginError('');
    const res = await loginAdmin(loginEmail.trim(), loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Invalid email or password.');
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordChangeStatus({ success: false, message: 'All fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeStatus({ success: false, message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordChangeStatus({ success: false, message: 'New password must be at least 8 characters long.' });
      return;
    }
    setIsChangingPassword(true);
    setPasswordChangeStatus(null);
    const res = await changePassword({ currentPassword, newPassword, confirmPassword });
    setIsChangingPassword(false);
    if (res.success) {
      setPasswordChangeStatus({ success: true, message: res.message || 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordChangeStatus(null);
      }, 2000);
    } else {
      setPasswordChangeStatus({ success: false, message: res.error || 'Failed to change password.' });
    }
  };

  // Handle Batch Publish
  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    setPublishSuccessMsg('');
    try {
      const res = await publishBatchLive(publishNotes);
      setPublishSuccessMsg(`${res.itemsCount} content updates successfully pushed live to public website!`);
      setTimeout(() => {
        setShowPublishModal(false);
        setPublishSuccessMsg('');
        setPublishNotes('');
      }, 2000);
    } catch (err: any) {
      console.error('Publish batch error:', err);
      alert(err.message || 'Failed to publish batch changes.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle copy URL to clipboard
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedMediaUrl(url);
    setTimeout(() => setCopiedMediaUrl(null), 2500);
  };

  // LOGIN SCREEN
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#202124] text-[#F2EEE7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#2B2D2F] border border-[#3A3C3E] p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 border border-[#B08D57] flex items-center justify-center bg-[#202124] mx-auto text-[#B08D57] font-serif-title text-xl">
              C
            </div>
            <h2 className="font-serif-title text-2xl uppercase tracking-widest text-[#F2EEE7]">
              Conclave Admin CMS
            </h2>
            <p className="text-xs text-[#D8CFC1]/70">
              Private local studio management system. Authorized administrator verification required.
            </p>
          </div>

          <div className="p-3 bg-[#202124] border border-[#3A3C3E] text-xs font-mono space-y-1">
            <span className="text-[10px] uppercase text-[#B08D57] block tracking-wider font-semibold">
              Designated Principal Administrator
            </span>
            <span className="text-[#F2EEE7] block truncate">Configured via ADMIN_EMAIL</span>
            <span className="text-[10px] text-[#D8CFC1]/50 block">
              Multi-role access enforcement: strictly verified server-side.
            </span>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-[#B08D57] mb-1.5">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@conclaveinteriors.com"
                className="w-full bg-[#202124] border border-[#3A3C3E] px-3.5 py-2.5 text-xs text-[#F2EEE7] focus:outline-none focus:border-[#B08D57] transition-colors font-mono placeholder:text-[#D8CFC1]/30"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-[#B08D57] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#202124] border border-[#3A3C3E] px-3.5 py-2.5 text-xs text-[#F2EEE7] focus:outline-none focus:border-[#B08D57] transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#B08D57] hover:bg-[#9A7745] text-[#202124] text-xs font-semibold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {authLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>Authenticate & Enter Atelier CMS</span>
            </button>
          </form>

          {/* Database connection status badge */}
          <div className="pt-2 border-t border-[#3A3C3E] text-center flex items-center justify-center gap-2 text-[10px] font-mono text-[#D8CFC1]/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PostgreSQL Online • Persistent Media Storage Ready</span>
          </div>

          <div className="pt-1 text-center">
            <button
              onClick={() => setActivePage('home')}
              className="text-xs text-[#D8CFC1]/60 hover:text-[#B08D57] transition-colors"
            >
              &larr; Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending counts
  const pendingFeedbackCount = testimonials.filter((t) => t.status === 'PENDING').length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'NEW').length;
  const publishedProjectsCount = projects.filter((p) => p.status === 'published').length;
  const draftProjectsCount = projects.filter((p) => p.status === 'draft').length;

  return (
    <div className="min-h-screen bg-[#202124] text-[#F2EEE7] flex flex-col md:flex-row pt-16">
      {/* CMS SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#2B2D2F] border-r border-[#3A3C3E] flex-shrink-0 flex flex-col justify-between p-4 md:p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2 pb-4 border-b border-[#3A3C3E]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif-title text-lg uppercase tracking-wider text-[#F2EEE7] block">
                  CONCLAVE CMS
                </span>
                <span className="text-[10px] text-[#B08D57] font-mono tracking-widest uppercase">
                  Studio Atelier & Storage
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="PostgreSQL Online"></span>
            </div>

            {/* Authenticated user badge */}
            <div className="p-2.5 bg-[#202124] border border-[#3A3C3E] flex items-center gap-2.5">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Admin'}
                  className="w-7 h-7 rounded-full object-cover border border-[#B08D57]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#B08D57]/20 border border-[#B08D57] flex items-center justify-center text-[#B08D57] font-serif-title text-xs">
                  {currentUser?.displayName?.[0] || 'A'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-serif text-[#F2EEE7] truncate">
                  {currentUser?.displayName || 'Principal Director'}
                </p>
                <p className="text-[10px] font-mono text-[#D8CFC1]/60 truncate">
                  {currentUser?.email || 'Administrator'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'dashboard'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'projects'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-4 h-4" />
                <span>Projects ({projects.length})</span>
              </div>
              {draftProjectsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-bold rounded-xs">
                  {draftProjectsCount} Draft
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('hero')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'hero'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4" />
                <span>Hero Slider ({heroSlides.length})</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('strip')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'strip'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Images className="w-4 h-4" />
                <span>Continuous Strip ({stripItems.length})</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('services')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'services'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4" />
                <span>Services ({services.length})</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('about')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'about'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Studio & About</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('media')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'media'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4" />
                <span>Media Storage ({mediaItems.length})</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('testimonials')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'testimonials'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Testimonials</span>
              </div>
              {pendingFeedbackCount > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-bold rounded-xs">
                  {pendingFeedbackCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('enquiries')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'enquiries'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Client Inquiries</span>
              </div>
              {newEnquiriesCount > 0 && (
                <span className="px-1.5 py-0.5 bg-emerald-400 text-black text-[9px] font-bold rounded-xs">
                  {newEnquiriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('faq')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'faq'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4" />
                <span>Spatial FAQs ({faqs.length})</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'settings'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Site Configuration</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'history'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4" />
                <span>Publication History</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('database')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                currentTab === 'database'
                  ? 'bg-[#B08D57] text-[#202124] font-semibold'
                  : 'text-[#D8CFC1] hover:bg-[#3A3C3E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4" />
                <span>PostgreSQL Architecture</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-[#3A3C3E] space-y-2">
          <button
            onClick={() => setActivePage('home')}
            className="w-full py-2 bg-[#222222] hover:bg-[#2a2a2a] text-[#F2EEE7] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>Public Website</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="w-full py-2 border border-red-900/40 text-red-400 hover:bg-red-950/20 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* CMS MAIN VIEWPORT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* TOP COMMAND BAR */}
        <div className="mb-8 p-4 bg-[#2B2D2F] border border-[#3A3C3E] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CFC1]/60 block">
                Workflow Mode
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  onClick={togglePreviewMode}
                  className={`flex items-center gap-2 px-2.5 py-1 text-xs font-mono transition-colors ${
                    isPreviewMode
                      ? 'bg-amber-500/20 border border-amber-500 text-amber-300'
                      : 'bg-[#202124] border border-white/10 text-[#D8CFC1] hover:text-white'
                  }`}
                  title="Toggle between Live Public view and Draft Preview mode"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isPreviewMode ? 'Draft Preview Active' : 'Live Mode'}</span>
                </button>
              </div>
            </div>

            <div className="h-8 w-px bg-[#3A3C3E] hidden sm:block"></div>

            <div className="hidden sm:block">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CFC1]/60 block">
                Publication Status
              </span>
              <p className="text-xs font-mono text-[#F2EEE7] mt-0.5">
                {publicationStatus.count > 0 ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    {publicationStatus.count} Unpublished Modification(s)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All Content Live & Synced
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshFromDatabase}
              disabled={isLoadingData}
              className="p-2.5 bg-[#202124] border border-[#3A3C3E] text-[#D8CFC1] hover:text-[#B08D57] text-xs transition-colors"
              title="Refresh all records directly from PostgreSQL database"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>

            {/* PUSH CHANGES LIVE BUTTON */}
            <button
              onClick={() => setShowPublishModal(true)}
              className="relative px-5 py-2.5 bg-[#B08D57] hover:bg-[#9A7745] text-[#202124] text-xs font-semibold uppercase tracking-[0.15em] transition-all flex items-center gap-2 shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span>PUSH CHANGES LIVE</span>
              {publicationStatus.count > 0 && (
                <span className="px-1.5 py-0.2 bg-[#202124] text-[#B08D57] text-[10px] font-mono font-bold rounded-full">
                  {publicationStatus.count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">Atelier Overview</h2>
                <p className="text-xs text-[#D8CFC1]/70">
                  Real-time synchronization with PostgreSQL database & Base64 Blob Storage.
                </p>
              </div>

              <button
                onClick={resetToDefaults}
                className="px-3 py-1.5 border border-[#3A3C3E] hover:border-[#B08D57] text-[11px] text-[#D8CFC1] flex items-center gap-1.5"
                title="Restore default database seed"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Demo Seed</span>
              </button>
            </div>

            {/* Metric Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-[#2B2D2F] border border-[#3A3C3E] space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#D8CFC1]/70 block font-semibold">
                  Published Projects
                </span>
                <span className="font-serif-title text-3xl text-[#B08D57] block">
                  {publishedProjectsCount}
                </span>
                <span className="text-[11px] text-[#D8CFC1]/60">
                  + {draftProjectsCount} Draft Portfolio Cases
                </span>
              </div>

              <div className="p-5 bg-[#2B2D2F] border border-[#3A3C3E] space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#D8CFC1]/70 block font-semibold">
                  Pending Feedback
                </span>
                <span className="font-serif-title text-3xl text-amber-400 block">
                  {pendingFeedbackCount}
                </span>
                <span className="text-[11px] text-[#D8CFC1]/60">
                  Awaiting Director Approval
                </span>
              </div>

              <div className="p-5 bg-[#2B2D2F] border border-[#3A3C3E] space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#D8CFC1]/70 block font-semibold">
                  Total Enquiries
                </span>
                <span className="font-serif-title text-3xl text-[#F2EEE7] block">
                  {enquiries.length}
                </span>
                <span className="text-[11px] text-emerald-400">
                  {newEnquiriesCount} New Unread Briefs
                </span>
              </div>

              <div className="p-5 bg-[#2B2D2F] border border-[#3A3C3E] space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#D8CFC1]/70 block font-semibold">
                  Persistent Media Files
                </span>
                <span className="font-serif-title text-3xl text-[#B08D57] block">
                  {mediaItems.length}
                </span>
                <span className="text-[11px] text-[#D8CFC1]/60">
                  Stored in PostgreSQL Blobs
                </span>
              </div>
            </div>

            {/* Quick Actions & Recent Enquiries */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-[#2B2D2F] border border-[#3A3C3E] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#3A3C3E] pb-3">
                  <h3 className="font-serif-title text-xl text-[#F2EEE7]">Recent Inquiries</h3>
                  <button
                    onClick={() => setCurrentTab('enquiries')}
                    className="text-xs text-[#B08D57] hover:underline uppercase tracking-wider"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {enquiries.length === 0 ? (
                    <p className="text-xs text-[#D8CFC1]/50 py-4 text-center">No inquiries yet.</p>
                  ) : (
                    enquiries.slice(0, 4).map((enq) => (
                      <div
                        key={enq.id}
                        className="p-3 bg-[#202124] border border-[#3A3C3E] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-medium text-[#F2EEE7] block">{enq.name}</span>
                          <span className="text-[11px] text-[#D8CFC1]/70 block">
                            {enq.projectType} • {enq.location}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            enq.status === 'NEW'
                              ? 'bg-amber-500 text-black'
                              : 'bg-[#3A3C3E] text-[#D8CFC1]'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#2B2D2F] border border-[#3A3C3E] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#3A3C3E] pb-3">
                  <h3 className="font-serif-title text-xl text-[#F2EEE7]">Feedback Queue</h3>
                  <button
                    onClick={() => setCurrentTab('testimonials')}
                    className="text-xs text-[#B08D57] hover:underline uppercase tracking-wider"
                  >
                    Moderate &rarr;
                  </button>
                </div>

                {pendingFeedbackCount > 0 ? (
                  <div className="space-y-3">
                    {testimonials
                      .filter((t) => t.status === 'PENDING')
                      .slice(0, 3)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-[#202124] border border-amber-800/40 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#F2EEE7]">{item.clientName}</span>
                            <span className="text-amber-400 font-mono text-[10px]">PENDING</span>
                          </div>
                          <p className="text-[11px] text-[#D8CFC1]/80 italic line-clamp-2">
                            "{item.feedbackMessage}"
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => moderateFeedback(item.id, 'APPROVED')}
                              className="px-2 py-1 bg-[#B08D57] text-[#202124] font-semibold text-[10px] uppercase tracking-wider"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => moderateFeedback(item.id, 'REJECTED')}
                              className="px-2 py-1 bg-red-900/60 text-red-200 text-[10px] uppercase tracking-wider"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#D8CFC1]/60 py-6 text-center">
                    No pending feedback submissions at this moment.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECTS MANAGEMENT */}
        {currentTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">
                  Project Monographs CMS
                </h2>
                <p className="text-xs text-[#D8CFC1]/70">
                  Full control over architectural portfolios, drafts, SEO, and visual assets.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const newP: Project = {
                      id: `proj-${Date.now()}`,
                      title: 'New Architectural Case',
                      slug: `case-${Date.now()}`,
                      category: 'Residential',
                      location: 'City, Country',
                      year: '2026',
                      areaSqFt: 3800,
                      description: 'Concise architectural description of spatial circulation...',
                      architecturalBrief: 'Architectural requirements and materiality study...',
                      materialsPalette: ['Honed Travertine', 'Fumed Oak', 'Patinated Bronze'],
                      coverImage:
                        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
                      galleryImages: [
                        {
                          url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
                          alt: 'Main living gallery',
                        },
                      ],
                      isFeatured: false,
                      status: 'draft',
                      sortOrder: projects.length + 1,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      hasUnpublishedChanges: true,
                    };
                    addProject(newP);
                    setEditingProject(newP);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#B08D57] hover:bg-[#9A7745] text-[#202124] font-semibold text-xs uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Project</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-mono text-[#D8CFC1]/60 uppercase mr-1">Filter:</span>
              <button
                onClick={() => setProjectFilter('all')}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider ${
                  projectFilter === 'all'
                    ? 'bg-[#B08D57] text-[#202124] font-semibold'
                    : 'bg-[#2B2D2F] text-[#D8CFC1] hover:bg-[#222222]'
                }`}
              >
                All ({projects.length})
              </button>
              <button
                onClick={() => setProjectFilter('published')}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider ${
                  projectFilter === 'published'
                    ? 'bg-[#B08D57] text-[#202124] font-semibold'
                    : 'bg-[#2B2D2F] text-[#D8CFC1] hover:bg-[#222222]'
                }`}
              >
                Published ({publishedProjectsCount})
              </button>
              <button
                onClick={() => setProjectFilter('draft')}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider ${
                  projectFilter === 'draft'
                    ? 'bg-[#B08D57] text-[#202124] font-semibold'
                    : 'bg-[#2B2D2F] text-[#D8CFC1] hover:bg-[#222222]'
                }`}
              >
                Drafts ({draftProjectsCount})
              </button>
            </div>

            {/* Project Editing Form */}
            {editingProject && (
              <div className="p-6 bg-[#2B2D2F] border border-[#B08D57] space-y-4">
                <div className="flex items-center justify-between border-b border-[#3A3C3E] pb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif-title text-xl text-[#B08D57]">
                      Editing: {editingProject.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                        editingProject.status === 'published'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {editingProject.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingProject(null)}
                    className="p-1 text-[#D8CFC1] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={editingProject.title}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, title: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Category
                    </label>
                    <select
                      value={editingProject.category}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Minimalist">Minimalist</option>
                      <option value="Noir Penthouse">Noir Penthouse</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingProject.location}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, location: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Year Completed
                    </label>
                    <input
                      type="text"
                      value={editingProject.year}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, year: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Area (Sq Ft)
                    </label>
                    <input
                      type="number"
                      value={editingProject.areaSqFt || ''}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          areaSqFt: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Publication State
                    </label>
                    <select
                      value={editingProject.status}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          status: e.target.value as 'published' | 'draft',
                        })
                      }
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    >
                      <option value="published">Published (Visible on Live Website)</option>
                      <option value="draft">Draft (Private in CMS & Preview Mode only)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <ImageUploadField
                      label="Cover Photography / Hero Media"
                      value={editingProject.coverImage}
                      onChange={(url) => setEditingProject({ ...editingProject, coverImage: url })}
                      helperText="Drag & drop architectural imagery or pick from your persistent Media Library"
                      required
                    />
                  </div>

                  {/* Project Gallery Images & Videos */}
                  <div className="sm:col-span-2 pt-3 border-t border-[#3A3C3E] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#B08D57] uppercase tracking-wider block font-semibold">
                        Project Media Gallery (Photos & Videos)
                      </span>
                      <span className="text-[10px] font-mono text-[#D8CFC1]/60">
                        {(editingProject.galleryImages || []).length} assets in gallery
                      </span>
                    </div>

                    {/* Current Gallery Grid */}
                    {(editingProject.galleryImages || []).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-[#202124] border border-[#3A3C3E]">
                        {editingProject.galleryImages.map((img, imgIdx) => {
                          const isVid = img.url.toLowerCase().endsWith('.mp4') || img.url.toLowerCase().endsWith('.webm') || img.url.toLowerCase().endsWith('.mov') || img.url.includes('/video');
                          return (
                            <div key={imgIdx} className="relative group border border-[#3A3C3E] bg-[#2B2D2F] aspect-video overflow-hidden flex flex-col justify-between">
                              {isVid ? (
                                <video src={img.url} className="w-full h-full object-cover" controls preload="metadata" />
                              ) : (
                                <img src={img.url} alt={img.alt || 'Gallery photo'} className="w-full h-full object-cover" />
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedGallery = editingProject.galleryImages.filter((_, i) => i !== imgIdx);
                                  setEditingProject({ ...editingProject, galleryImages: updatedGallery });
                                }}
                                className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                                title="Delete from gallery"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              {img.caption && (
                                <div className="absolute bottom-0 inset-x-0 bg-black/75 p-1 text-[9px] font-mono text-[#F2EEE7] truncate">
                                  {img.caption}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add to Gallery Box */}
                    <div className="p-3 bg-[#202124] border border-dashed border-[#3A3C3E] space-y-2">
                      <span className="text-[10px] font-mono uppercase text-[#D8CFC1] block font-semibold">
                        + Add New Photo / Video to Project Gallery
                      </span>
                      <ImageUploadField
                        label="Select or Upload Media"
                        value={newGalleryItem.url}
                        onChange={(url) => setNewGalleryItem((prev) => ({ ...prev, url }))}
                        helperText="Add photography or video walkthroughs to this project dossier"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Media caption (e.g. Master suite aperture with limestone finish)"
                          value={newGalleryItem.caption || ''}
                          onChange={(e) => setNewGalleryItem((prev) => ({ ...prev, caption: e.target.value }))}
                          className="px-3 py-1.5 bg-[#2B2D2F] border border-[#3A3C3E] text-xs text-[#F2EEE7] focus:outline-hidden"
                        />
                        <button
                          type="button"
                          disabled={!newGalleryItem.url}
                          onClick={() => {
                            if (!newGalleryItem.url) return;
                            const currentGallery = editingProject.galleryImages || [];
                            const updatedGallery = [
                              ...currentGallery,
                              {
                                url: newGalleryItem.url,
                                alt: newGalleryItem.caption || editingProject.title,
                                caption: newGalleryItem.caption || undefined,
                              },
                            ];
                            setEditingProject({ ...editingProject, galleryImages: updatedGallery });
                            setNewGalleryItem({ url: '', alt: '', caption: '' });
                          }}
                          className="px-4 py-1.5 bg-[#B08D57] hover:bg-[#9A7745] disabled:opacity-50 text-[#202124] font-semibold text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors"
                        >
                          + Append to Project Gallery
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Editorial Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingProject.description}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div className="text-xs">
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Architectural Brief & Materiality
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.architecturalBrief}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        architecturalBrief: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                {/* SEO Fields */}
                <div className="pt-2 border-t border-[#3A3C3E] space-y-3">
                  <span className="text-[11px] font-mono text-[#B08D57] uppercase tracking-wider block">
                    Search Engine Optimization (SEO Metadata)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Minimalist Residence in Singapore | Conclave Interiors"
                        value={editingProject.seoTitle || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, seoTitle: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                        SEO Meta Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Architectural spatial monograph documenting limestone and smoked oak..."
                        value={editingProject.seoDescription || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, seoDescription: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProject.isFeatured}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="accent-[#B08D57]"
                    />
                    <span>Mark as Featured Project</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A3C3E]">
                  <button
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 border border-[#3A3C3E] text-[#D8CFC1] text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateProject(editingProject.id, editingProject);
                      setEditingProject(null);
                    }}
                    className="px-6 py-2 bg-[#B08D57] text-[#202124] text-xs font-semibold uppercase tracking-wider"
                  >
                    Save Project Changes
                  </button>
                </div>
              </div>
            )}

            {/* Projects List */}
            <div className="space-y-3">
              {projects
                .filter((p) => {
                  if (projectFilter === 'published') return p.status === 'published';
                  if (projectFilter === 'draft') return p.status === 'draft';
                  return true;
                })
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-[#2B2D2F] border border-[#3A3C3E] hover:border-[#38332d] flex flex-wrap items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 overflow-hidden bg-[#202124] flex-shrink-0 border border-white/10">
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif-title text-lg text-[#F2EEE7]">{p.title}</h4>
                          {p.hasUnpublishedChanges && (
                            <span className="w-2 h-2 rounded-full bg-amber-400" title="Unpublished changes"></span>
                          )}
                        </div>
                        <p className="text-xs text-[#D8CFC1]/70">
                          {p.category} • {p.location} • {p.year}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => publishProject(p.id, p.status !== 'published')}
                        className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors border ${
                          p.status === 'published'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-zinc-800 hover:text-zinc-300'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-emerald-950/80 hover:text-emerald-300'
                        }`}
                        title={p.status === 'published' ? 'Click to revert to Draft' : 'Click to Publish live immediately'}
                      >
                        {p.status === 'published' ? '● Live (Unpublish)' : '○ Publish Now'}
                      </button>

                      <button
                        onClick={() => duplicateProject(p.id)}
                        className="p-2 text-[#D8CFC1] hover:text-[#B08D57] bg-[#202124] border border-[#3A3C3E]"
                        title="Duplicate as new draft monograph"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingProject(p)}
                        className="p-2 text-[#D8CFC1] hover:text-[#B08D57] bg-[#202124] border border-[#3A3C3E]"
                        title="Edit project monograph"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Permanently delete project "${p.title}"?`)) {
                            deleteProject(p.id);
                          }
                        }}
                        className="p-2 text-red-400 hover:text-red-300 bg-[#202124] border border-[#3A3C3E]"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB: MEDIA STORAGE LIBRARY */}
        {currentTab === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">
                  Persistent Media Storage (Photos & Videos)
                </h2>
                <p className="text-xs text-[#D8CFC1]/70">
                  Online PostgreSQL Blob storage engine. Images and architectural videos survive container restarts with 100% durability.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 bg-[#B08D57] hover:bg-[#9A7745] text-[#202124] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Photo / Video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    disabled={mediaUploadLoading}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setMediaUploadLoading(true);
                        try {
                          for (let i = 0; i < e.target.files.length; i++) {
                            await uploadMediaFile(e.target.files[i]);
                          }
                        } catch (err: any) {
                          alert(err.message || 'Media upload failed');
                        } finally {
                          setMediaUploadLoading(false);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Media Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-[#3A3C3E] pb-3 text-xs font-mono">
              <button
                onClick={() => setMediaTabFilter('all')}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  mediaTabFilter === 'all'
                    ? 'bg-[#B08D57] text-[#202124] font-bold'
                    : 'bg-[#2B2D2F] text-[#D8CFC1] hover:text-[#F2EEE7]'
                }`}
              >
                All Media ({mediaItems.length})
              </button>
              <button
                onClick={() => setMediaTabFilter('image')}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  mediaTabFilter === 'image'
                    ? 'bg-[#B08D57] text-[#202124] font-bold'
                    : 'bg-[#2B2D2F] text-[#D8CFC1] hover:text-[#F2EEE7]'
                }`}
              >
                Photos ({mediaItems.filter((m) => m.mimeType?.startsWith('image/')).length})
              </button>
              <button
                onClick={() => setMediaTabFilter('video')}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  mediaTabFilter === 'video'
                    ? 'bg-[#B08D57] text-[#202124] font-bold'
                    : 'bg-[#2B2D2F] text-[#D8CFC1] hover:text-[#F2EEE7]'
                }`}
              >
                Videos ({mediaItems.filter((m) => m.mimeType?.startsWith('video/') || m.url?.toLowerCase().endsWith('.mp4') || m.url?.toLowerCase().endsWith('.webm')).length})
              </button>
            </div>

            {mediaUploadLoading && (
              <div className="p-4 bg-[#2B2D2F] border border-[#B08D57] text-center text-xs font-mono text-[#F2EEE7] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#B08D57]" />
                Encoding and committing media blob(s) to online PostgreSQL storage...
              </div>
            )}

            {mediaItems.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/10 bg-[#141414] p-8 space-y-3">
                <FolderOpen className="w-12 h-12 mx-auto text-[#B08D57]/60" />
                <h3 className="font-serif-title text-xl text-[#F2EEE7]">Storage is Empty</h3>
                <p className="text-xs text-[#D8CFC1]/70 max-w-sm mx-auto">
                  Upload architectural photography or walkthrough videos directly into online PostgreSQL storage. Every asset uploaded will appear here and in the CMS pickers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems
                  .filter((item) => {
                    const isVideo = item.mimeType?.startsWith('video/') || item.url?.toLowerCase().endsWith('.mp4') || item.url?.toLowerCase().endsWith('.webm');
                    if (mediaTabFilter === 'image') return !isVideo;
                    if (mediaTabFilter === 'video') return isVideo;
                    return true;
                  })
                  .map((item: MediaItem) => {
                    const isVideo = item.mimeType?.startsWith('video/') || item.url?.toLowerCase().endsWith('.mp4') || item.url?.toLowerCase().endsWith('.webm') || item.url?.toLowerCase().endsWith('.mov');
                    return (
                      <div
                        key={item.id}
                        className="bg-[#2B2D2F] border border-[#3A3C3E] hover:border-[#B08D57] transition-all flex flex-col justify-between overflow-hidden group shadow-md"
                      >
                        <div className="relative aspect-[16/10] bg-black/80 overflow-hidden flex items-center justify-center">
                          {isVideo ? (
                            <video
                              src={item.url}
                              controls
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={item.url}
                              alt={item.originalName || item.fileName}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          )}
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/75 text-[9px] font-mono font-bold text-[#B08D57] pointer-events-none">
                            {isVideo ? 'VIDEO' : 'PHOTO'}
                          </div>
                        </div>

                        <div className="p-3 space-y-2 flex-grow flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-mono text-[#F2EEE7] truncate font-medium" title={item.originalName || item.fileName}>
                              {item.originalName || item.fileName}
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#D8CFC1]/50 mt-1">
                              <span>{Math.round((item.sizeBytes || 0) / 1024)} KB</span>
                              <span className="truncate max-w-[120px]">{item.mimeType}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#3A3C3E] gap-2">
                            <button
                              onClick={() => handleCopyUrl(item.url)}
                              className="flex items-center gap-1 text-[11px] font-mono text-[#B08D57] hover:underline cursor-pointer"
                            >
                              {copiedMediaUrl === item.url ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-semibold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy URL</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                if (confirm('Permanently delete this media asset from online storage?')) {
                                  deleteMediaItem(item.id);
                                }
                              }}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Delete media file permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HERO SLIDER CMS */}
        {currentTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">Hero Slider CMS</h2>
                <p className="text-xs text-[#D8CFC1]/70">
                  Manage split-screen and full-screen hero slides, titles, imagery, and transitions.
                </p>
              </div>

              <button
                onClick={() => {
                  const newSlide: HeroSlide = {
                    id: `hero-${Date.now()}`,
                    label: 'ARCHITECTURAL RESIDENCE',
                    headline: 'NEW MONOGRAPH HEADLINE',
                    supportingText: 'Supporting architectural description...',
                    primaryCtaText: 'EXPLORE PROJECTS',
                    primaryCtaLink: '#projects',
                    secondaryCtaText: 'REQUEST CONSULTATION',
                    secondaryCtaLink: '#contact',
                    imageUrl:
                      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85',
                    imageAlt: 'Interior architecture',
                    layoutMode: 'split',
                    sortOrder: heroSlides.length + 1,
                    isPublished: true,
                    hasUnpublishedChanges: true,
                  };
                  addHeroSlide(newSlide);
                  setEditingSlide(newSlide);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-[#202124] font-semibold text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            {/* Slide Editor */}
            {editingSlide && (
              <div className="p-6 bg-[#2B2D2F] border border-[#B08D57] space-y-4">
                <div className="flex items-center justify-between border-b border-[#3A3C3E] pb-3">
                  <h3 className="font-serif-title text-xl text-[#B08D57]">Editing Hero Slide</h3>
                  <button onClick={() => setEditingSlide(null)} className="p-1 text-[#D8CFC1]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Label / Eyebrow
                    </label>
                    <input
                      type="text"
                      value={editingSlide.label}
                      onChange={(e) => setEditingSlide({ ...editingSlide, label: e.target.value })}
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Layout Mode
                    </label>
                    <select
                      value={editingSlide.layoutMode}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          layoutMode: e.target.value as 'split' | 'fullscreen' | 'overlay',
                        })
                      }
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    >
                      <option value="split">Split-Screen (Editorial Text + Image)</option>
                      <option value="fullscreen">Full-Screen Cinematic Hero</option>
                      <option value="overlay">Cinematic Overlay</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={editingSlide.headline}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, headline: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Supporting Description
                    </label>
                    <textarea
                      rows={2}
                      value={editingSlide.supportingText}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, supportingText: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <ImageUploadField
                      label="Slide Photography"
                      value={editingSlide.imageUrl}
                      onChange={(url) => setEditingSlide({ ...editingSlide, imageUrl: url })}
                      helperText="High-resolution interior photography"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSlide.isPublished}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, isPublished: e.target.checked })
                      }
                      className="accent-[#B08D57]"
                    />
                    <span>Active in Public Rotation</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A3C3E]">
                  <button
                    onClick={() => setEditingSlide(null)}
                    className="px-4 py-2 border border-[#3A3C3E] text-[#D8CFC1] text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateHeroSlide(editingSlide.id, editingSlide);
                      setEditingSlide(null);
                    }}
                    className="px-6 py-2 bg-[#B08D57] text-[#202124] text-xs font-semibold uppercase tracking-wider"
                  >
                    Save Slide
                  </button>
                </div>
              </div>
            )}

            {/* Slide List */}
            <div className="space-y-3">
              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="p-4 bg-[#2B2D2F] border border-[#3A3C3E] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 overflow-hidden bg-[#202124] flex-shrink-0 border border-white/10">
                      <img
                        src={slide.imageUrl}
                        alt={slide.headline}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif-title text-sm text-[#B08D57]">0{idx + 1}</span>
                        <h4 className="font-serif-title text-lg text-[#F2EEE7]">
                          {slide.headline}
                        </h4>
                      </div>
                      <p className="text-xs text-[#D8CFC1]/70">
                        {slide.label} • Mode: {slide.layoutMode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => publishHeroSlide(slide.id, !slide.isPublished)}
                      className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors border ${
                        slide.isPublished
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-zinc-800 hover:text-zinc-300'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-emerald-950/80 hover:text-emerald-300'
                      }`}
                      title={slide.isPublished ? 'Click to deactivate slide from rotation' : 'Click to make slide active immediately'}
                    >
                      {slide.isPublished ? '● Active' : '○ Inactive'}
                    </button>
                    <button
                      onClick={() => setEditingSlide(slide)}
                      className="p-2 text-[#D8CFC1] hover:text-[#B08D57] bg-[#202124] border border-[#3A3C3E]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteHeroSlide(slide.id)}
                      className="p-2 text-red-400 hover:text-red-300 bg-[#202124] border border-[#3A3C3E]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTINUOUS STRIP */}
        {currentTab === 'strip' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">
                  Continuous Image Strip CMS
                </h2>
                <p className="text-xs text-[#D8CFC1]/70">
                  Manage the uninterrupted horizontal marquee of architectural photography.
                </p>
              </div>

              <button
                onClick={() => {
                  const newItem: ContinuousStripItem = {
                    id: `strip-${Date.now()}`,
                    title: 'Bespoke Interior',
                    category: 'Residential',
                    imageUrl:
                      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
                    altText: 'Bespoke interior architecture view',
                    isPublished: true,
                    sortOrder: stripItems.length + 1,
                  };
                  addStripItem(newItem);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-[#202124] font-semibold text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Add Strip Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stripItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#2B2D2F] border border-[#3A3C3E] space-y-3"
                >
                  <div className="aspect-[4/3] bg-black/60 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif-title text-base text-[#F2EEE7]">{item.title}</h4>
                    <p className="text-[11px] text-[#B08D57]">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#3A3C3E]">
                    <button
                      onClick={() =>
                        updateStripItem(item.id, { isPublished: !item.isPublished })
                      }
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${
                        item.isPublished
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.isPublished ? 'Live in Strip' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => deleteStripItem(item.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SERVICES CMS */}
        {currentTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">Services CMS</h2>
                <p className="text-xs text-[#D8CFC1]/70">
                  Manage the 6 architectural scope pillars, deliverables, and durations.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {services.map((service, idx) => (
                <div
                  key={service.id}
                  className="p-5 bg-[#2B2D2F] border border-[#3A3C3E] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-serif-title text-xl text-[#B08D57]">0{idx + 1}</span>
                      <h4 className="font-serif-title text-xl text-[#F2EEE7]">{service.title}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#D8CFC1]/60 font-mono">
                        {service.scopeDuration}
                      </span>
                      <button
                        onClick={() => publishService(service.id, !service.isPublished)}
                        className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors border ${
                          service.isPublished
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-zinc-800 hover:text-zinc-300'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-emerald-950/80 hover:text-emerald-300'
                        }`}
                        title={service.isPublished ? 'Click to hide service' : 'Click to publish service'}
                      >
                        {service.isPublished ? '● Published' : '○ Hidden'}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#D8CFC1]">{service.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {service.deliverables.map((deliv, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 bg-[#202124] text-[#D8CFC1] border border-[#3A3C3E]"
                      >
                        {deliv}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: STUDIO & ABOUT CMS */}
        {currentTab === 'about' && (
          <div className="space-y-6">
            <div className="pb-6 border-b border-[#3A3C3E]">
              <h2 className="font-serif-title text-3xl text-[#F2EEE7]">Studio & Philosophy CMS</h2>
              <p className="text-xs text-[#D8CFC1]/70">
                Studio manifesto, director biography, credentials, and philosophy.
              </p>
            </div>

            <div className="p-6 bg-[#2B2D2F] border border-[#3A3C3E] space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                  Studio Introduction Text
                </label>
                <textarea
                  rows={3}
                  value={about.studioIntro}
                  onChange={(e) => updateAbout({ studioIntro: e.target.value })}
                  className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Designer / Director Name
                  </label>
                  <input
                    type="text"
                    value={about.designerName}
                    onChange={(e) => updateAbout({ designerName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Designer Title / Role
                  </label>
                  <input
                    type="text"
                    value={about.designerRole}
                    onChange={(e) => updateAbout({ designerRole: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                  Designer Biography
                </label>
                <textarea
                  rows={3}
                  value={about.designerBio}
                  onChange={(e) => updateAbout({ designerBio: e.target.value })}
                  className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Designer Portrait Photograph"
                  value={about.designerPhoto}
                  onChange={(url) => updateAbout({ designerPhoto: url })}
                  helperText="Editorial portrait of the principal architect / founder"
                />
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-emerald-400">
                  &check; Studio changes are saved to drafts and pushed live when you click PUSH CHANGES LIVE.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TESTIMONIALS & FEEDBACK MODERATION */}
        {currentTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">
                  Feedback Moderation Desk
                </h2>
                <p className="text-xs text-[#D8CFC1]/70">
                  All visitor feedback begins in STATUS = PENDING. Only APPROVED feedback is visible publicly.
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider">
                {pendingFeedbackCount} Pending Approval
              </span>
            </div>

            <div className="space-y-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className={`p-5 bg-[#2B2D2F] border ${
                    t.status === 'PENDING' ? 'border-amber-500' : 'border-[#3A3C3E]'
                  } space-y-3`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-serif-title text-lg text-[#F2EEE7]">{t.clientName}</span>
                      {t.clientRole && (
                        <span className="text-xs text-[#D8CFC1]/70 font-light">
                          ({t.clientRole})
                        </span>
                      )}
                      {t.projectReference && (
                        <span className="text-[10px] uppercase tracking-wider text-[#B08D57]">
                          Ref: {t.projectReference}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          t.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : t.status === 'PENDING'
                            ? 'bg-amber-500 text-black'
                            : 'bg-red-950 text-red-300'
                        }`}
                      >
                        {t.status}
                      </span>
                      {t.isFeatured && (
                        <span className="px-2 py-0.5 text-[10px] bg-[#B08D57] text-black font-semibold uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-[#B08D57] fill-[#B08D57]" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-[#D8CFC1] italic">"{t.feedbackMessage}"</p>

                  <div className="pt-3 border-t border-[#3A3C3E] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-[10px] text-[#D8CFC1]/50 font-mono">
                      Submitted: {new Date(t.submittedAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {t.status !== 'APPROVED' && (
                        <button
                          onClick={() => moderateFeedback(t.id, 'APPROVED')}
                          className="px-3 py-1 bg-[#B08D57] text-[#202124] font-semibold text-xs uppercase tracking-wider hover:bg-[#9A7745]"
                        >
                          Approve Publicly
                        </button>
                      )}

                      {t.status !== 'REJECTED' && (
                        <button
                          onClick={() => moderateFeedback(t.id, 'REJECTED')}
                          className="px-3 py-1 bg-[#3A3C3E] text-[#D8CFC1] text-xs uppercase tracking-wider hover:text-white"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => toggleFeatureFeedback(t.id)}
                        className="px-3 py-1 border border-[#3A3C3E] text-[#D8CFC1] text-xs uppercase hover:border-[#B08D57]"
                      >
                        {t.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>

                      <button
                        onClick={() => deleteFeedback(t.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: CLIENT INQUIRIES */}
        {currentTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">
                  Client Inquiries & Briefs
                </h2>
                <p className="text-xs text-[#D8CFC1]/70">
                  Prospective architectural commissions submitted through the public inquiry desk.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {['ALL', 'NEW', 'CONTACTED', 'CLOSED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setEnquiryFilter(st)}
                    className={`px-3 py-1 uppercase tracking-wider font-mono ${
                      enquiryFilter === st
                        ? 'bg-[#B08D57] text-[#202124] font-bold'
                        : 'bg-[#2B2D2F] text-[#D8CFC1]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {enquiries
                .filter((e) => (enquiryFilter === 'ALL' ? true : e.status === enquiryFilter))
                .map((enq) => (
                  <div
                    key={enq.id}
                    className="p-5 bg-[#2B2D2F] border border-[#3A3C3E] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-serif-title text-lg text-[#F2EEE7]">{enq.name}</h4>
                        <p className="text-xs text-[#D8CFC1]/70">
                          {enq.email} • {enq.phone}
                        </p>
                      </div>

                      <select
                        value={enq.status}
                        onChange={(e) =>
                          updateEnquiryStatus(enq.id, e.target.value as any)
                        }
                        className="px-3 py-1 bg-[#202124] border border-[#3A3C3E] text-xs font-mono uppercase text-[#F2EEE7]"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-[#202124] p-3 border border-[#3A3C3E]">
                      <div>
                        <span className="text-[10px] text-[#D8CFC1]/60 block uppercase">Project Type</span>
                        <span className="font-medium text-[#F2EEE7]">{enq.projectType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#D8CFC1]/60 block uppercase">Location</span>
                        <span className="font-medium text-[#F2EEE7]">{enq.location}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#D8CFC1]/60 block uppercase">Budget Range</span>
                        <span className="font-medium text-[#B08D57]">{enq.budget || 'Custom Studio Commission'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#D8CFC1] bg-[#202124]/60 p-3 border border-white/5">
                      "{enq.message}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#3A3C3E] text-[10px] font-mono text-[#D8CFC1]/50">
                      <span>Submitted: {new Date(enq.createdAt).toLocaleString()}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Delete inquiry from ${enq.name}?`)) {
                            deleteEnquiry(enq.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete Inquiry
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 9: SPATIAL FAQS */}
        {currentTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">Spatial FAQs CMS</h2>
                <p className="text-xs text-[#D8CFC1]/70">
                  Client questions regarding engagement phases, material sourcing, and fees.
                </p>
              </div>

              <button
                onClick={() => {
                  const newFaq: FaqItem = {
                    id: `faq-${Date.now()}`,
                    question: 'New Studio Inquiry Question?',
                    answer: 'Detailed response regarding our architectural practice...',
                    category: 'Practice',
                    sortOrder: faqs.length + 1,
                    isPublished: true,
                  };
                  addFaq(newFaq);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-[#202124] font-semibold text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={faq.id} className="p-5 bg-[#2B2D2F] border border-[#3A3C3E] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif-title text-lg text-[#F2EEE7]">
                      0{idx + 1}. {faq.question}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => publishFaq(faq.id, !faq.isPublished)}
                        className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors border ${
                          faq.isPublished
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-zinc-800 hover:text-zinc-300'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-emerald-950/80 hover:text-emerald-300'
                        }`}
                        title={faq.isPublished ? 'Click to hide question' : 'Click to publish question'}
                      >
                        {faq.isPublished ? '● Published' : '○ Hidden'}
                      </button>
                      <button
                        onClick={() => deleteFaq(faq.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#D8CFC1]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: SITE SETTINGS & SECTION CONFIG */}
        {currentTab === 'settings' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-[#3A3C3E]">
              <h2 className="font-serif-title text-3xl text-[#F2EEE7]">Site Configuration</h2>
              <p className="text-xs text-[#D8CFC1]/70">
                Global contact channels, hero slider behaviors, and public section visibility toggles.
              </p>
            </div>

            {/* Section Visibility Controls */}
            <div className="p-6 bg-[#2B2D2F] border border-[#3A3C3E] space-y-4">
              <h3 className="font-serif-title text-xl text-[#B08D57]">
                Homepage Section Visibility Controls
              </h3>
              <p className="text-xs text-[#D8CFC1]/70">
                Toggle entire sections on or off without writing code. Changes take effect on the public website when pushed live.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2">
                {[
                  { key: 'showHero', label: '1. Hero Section & Monograph Slider' },
                  { key: 'showContinuousStrip', label: '2. Continuous Architectural Strip' },
                  { key: 'showFeaturedProjects', label: '3. Selected Works & Portfolio Cases' },
                  { key: 'showAbout', label: '4. Studio Manifesto & Designer Story' },
                  { key: 'showServices', label: '5. Services & Architectural Deliverables' },
                  { key: 'showApproach', label: '6. Design Rigor & 4-Phase Process' },
                  { key: 'showTestimonials', label: '7. Client Reflections & Feedback' },
                  { key: 'showFaq', label: '8. Spatial Architecture FAQs' },
                  { key: 'showContact', label: '9. Commission Inquiries & Contact' },
                ].map((item) => {
                  const currentSections = settings.sectionsConfig || {};
                  const isEnabled = currentSections[item.key]?.visible !== false;

                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        const updated = {
                          ...currentSections,
                          [item.key]: { visible: !isEnabled, title: item.label },
                        };
                        updateSettings({ sectionsConfig: updated });
                      }}
                      className={`p-3 border cursor-pointer flex items-center justify-between transition-colors ${
                        isEnabled
                          ? 'bg-[#141414] border-[#B08D57]/50 text-[#F2EEE7]'
                          : 'bg-[#202124] border-white/5 text-[#D8CFC1]/40'
                      }`}
                    >
                      <span className="font-mono text-xs">{item.label}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 uppercase font-semibold ${
                          isEnabled
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isEnabled ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General Contact & Brand Details */}
            <div className="p-6 bg-[#2B2D2F] border border-[#3A3C3E] space-y-4 text-xs">
              <h3 className="font-serif-title text-xl text-[#B08D57]">Studio Identity & Contact Channels</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Studio Brand Name
                  </label>
                  <input
                    type="text"
                    value={settings.studioName || ''}
                    onChange={(e) => updateSettings({ studioName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Studio Motto / Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => updateSettings({ tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    WhatsApp Number (Direct Link)
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Telephone Line (Navbar & Contact)
                  </label>
                  <input
                    type="text"
                    value={settings.phoneNumber}
                    onChange={(e) => updateSettings({ phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Official Inquiries Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings({ email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Hero Autoplay Rotation (Seconds)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={settings.heroIntervalSeconds}
                    onChange={(e) =>
                      updateSettings({ heroIntervalSeconds: Number(e.target.value) || 6 })
                    }
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Navbar CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.quoteButtonText || ''}
                    placeholder="Get a Quote"
                    onChange={(e) => updateSettings({ quoteButtonText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Navbar CTA Button Link (#contact or leave empty)
                  </label>
                  <input
                    type="text"
                    value={settings.quoteButtonLink || ''}
                    placeholder="#contact"
                    onChange={(e) => updateSettings({ quoteButtonLink: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                  Physical Studio Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => updateSettings({ address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                  Working / Appointment Hours
                </label>
                <input
                  type="text"
                  value={settings.workingHours}
                  onChange={(e) => updateSettings({ workingHours: e.target.value })}
                  className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                />
              </div>
            </div>

            {/* Cinematic Parallax Vistas Copy & Media */}
            <div className="p-6 bg-[#2B2D2F] border border-[#3A3C3E] space-y-6 text-xs">
              <h3 className="font-serif-title text-xl text-[#B08D57]">Cinematic Parallax Vistas (Copy & Media)</h3>
              <p className="text-[11px] text-[#D8CFC1]/70">
                Customize headlines, captions, architectural specifications, and background imagery/video clips for the panoramic vista chapters.
              </p>

              {/* Vista 1 */}
              <div className="p-4 bg-[#202124] border border-[#3A3C3E] space-y-3">
                <span className="text-[11px] font-mono text-[#B08D57] uppercase font-bold block">
                  Vista 01 (Monolithic Volume & Honed Travertine)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Chapter Number / Tag
                    </label>
                    <input
                      type="text"
                      value={settings.vista1Chapter || 'VISTA 01 · SPATIAL VOLUME'}
                      onChange={(e) => updateSettings({ vista1Chapter: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={settings.vista1Title || 'THE MONUMENTAL VOID & HONED TRAVERTINE'}
                      onChange={(e) => updateSettings({ vista1Title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Subtitle / Spatial Description
                  </label>
                  <textarea
                    rows={2}
                    value={settings.vista1Subtitle || 'Framing panoramic horizons with floor-to-ceiling architectural apertures and monolithic natural limestone surfaces.'}
                    onChange={(e) => updateSettings({ vista1Subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Materiality Specification Tag
                  </label>
                  <input
                    type="text"
                    value={settings.vista1Spec || 'SPECIFICATION: HONED ROMAN TRAVERTINE · UNLACQUERED BRONZE'}
                    onChange={(e) => updateSettings({ vista1Spec: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
                <ImageUploadField
                  label="Vista 01 Background Photography / Video Clip"
                  value={settings.vista1Image || ''}
                  onChange={(url) => updateSettings({ vista1Image: url })}
                  helperText="Upload full-bleed photograph or video loop for Vista 01"
                />
              </div>

              {/* Vista 2 */}
              <div className="p-4 bg-[#202124] border border-[#3A3C3E] space-y-3">
                <span className="text-[11px] font-mono text-[#B08D57] uppercase font-bold block">
                  Vista 02 (Residential Serenity & Limewash Plaster)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Chapter Number / Tag
                    </label>
                    <input
                      type="text"
                      value={settings.vista2Chapter || 'VISTA 02 · RESIDENTIAL SERENITY'}
                      onChange={(e) => updateSettings({ vista2Chapter: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={settings.vista2Title || 'MINIMALIST PROPORTION & LIMEWASH PLASTER'}
                      onChange={(e) => updateSettings({ vista2Title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Subtitle / Spatial Description
                  </label>
                  <textarea
                    rows={2}
                    value={settings.vista2Subtitle || 'Textured mineral surfaces that catch the shifting daylight, creating quiet domestic environments sculpted for deep rest.'}
                    onChange={(e) => updateSettings({ vista2Subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Materiality Specification Tag
                  </label>
                  <input
                    type="text"
                    value={settings.vista2Spec || 'SPECIFICATION: LIMEWASH PLASTER · BLEACHED ASH · SATIN CHAMPAGNE'}
                    onChange={(e) => updateSettings({ vista2Spec: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
                <ImageUploadField
                  label="Vista 02 Background Photography / Video Clip"
                  value={settings.vista2Image || ''}
                  onChange={(url) => updateSettings({ vista2Image: url })}
                  helperText="Upload full-bleed photograph or video loop for Vista 02"
                />
              </div>

              {/* Commission CTA Transition */}
              <div className="p-4 bg-[#202124] border border-[#3A3C3E] space-y-3">
                <span className="text-[11px] font-mono text-[#B08D57] uppercase font-bold block">
                  Commission Dialogue / CTA Atmospheric Transition
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={settings.ctaEyebrow || 'COMMISSION DIALOGUE'}
                      onChange={(e) => updateSettings({ ctaEyebrow: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={settings.ctaTitle || 'INITIATE YOUR ARCHITECTURAL SANCTUARY'}
                      onChange={(e) => updateSettings({ ctaTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Supporting Text
                  </label>
                  <textarea
                    rows={2}
                    value={settings.ctaSubtitle || 'Connect directly with our principal design director to discuss your prospective residential or commercial space.'}
                    onChange={(e) => updateSettings({ ctaSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2B2D2F] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
                <ImageUploadField
                  label="Commission Backdrop Media (Photo or Video)"
                  value={settings.ctaMediaUrl || ''}
                  onChange={(url) => updateSettings({ ctaMediaUrl: url })}
                  helperText="Atmospheric imagery or video backdrop for commission dialogue"
                />
              </div>
            </div>

            {/* Footer & Social Media Channels */}
            <div className="p-6 bg-[#2B2D2F] border border-[#3A3C3E] space-y-4 text-xs">
              <h3 className="font-serif-title text-xl text-[#B08D57]">Footer Text & Social Media Channels</h3>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                  Footer Manifesto & Studio Description Text
                </label>
                <textarea
                  rows={3}
                  value={settings.footerAboutText || ''}
                  placeholder="An architectural interior design practice shaping spaces that speak in silence..."
                  onChange={(e) => updateSettings({ footerAboutText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                  Footer Copyright Notice
                </label>
                <input
                  type="text"
                  value={settings.footerCopyrightText || ''}
                  placeholder="CONCLAVE INTERIORS ATELIER. All rights reserved."
                  onChange={(e) => updateSettings({ footerCopyrightText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    type="text"
                    value={settings.instagramUrl || ''}
                    onChange={(e) => updateSettings({ instagramUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="text"
                    value={settings.facebookUrl || ''}
                    onChange={(e) => updateSettings({ facebookUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    YouTube Channel URL
                  </label>
                  <input
                    type="text"
                    value={settings.youtubeUrl || ''}
                    onChange={(e) => updateSettings({ youtubeUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={settings.linkedinUrl || ''}
                    onChange={(e) => updateSettings({ linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
              </div>
            </div>

            {/* Global SEO Settings */}
            <div className="p-6 bg-[#2B2D2F] border border-[#3A3C3E] space-y-3 text-xs">
              <span className="text-[11px] font-mono text-[#B08D57] uppercase tracking-wider block font-bold">
                Global Search Engine Optimization (SEO)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Website Meta Title
                  </label>
                  <input
                    type="text"
                    value={settings.seoTitle || ''}
                    onChange={(e) => updateSettings({ seoTitle: e.target.value })}
                    placeholder="CONCLAVE INTERIORS | Luxury Architectural Studio"
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1">
                    Website Meta Description
                  </label>
                  <input
                    type="text"
                    value={settings.seoDescription || ''}
                    onChange={(e) => updateSettings({ seoDescription: e.target.value })}
                    placeholder="Luxury modern interior architecture studio shaped by material, light, and silence."
                    className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: PUBLICATION HISTORY */}
        {currentTab === 'history' && (
          <div className="space-y-6">
            <div className="pb-6 border-b border-[#3A3C3E]">
              <h2 className="font-serif-title text-3xl text-[#F2EEE7]">Publication Audit Trail</h2>
              <p className="text-xs text-[#D8CFC1]/70">
                Permanent ledger of all batch releases committed to the live public website.
              </p>
            </div>

            {publicationHistory.length === 0 ? (
              <div className="p-8 text-center border border-[#3A3C3E] bg-[#2B2D2F] text-xs font-mono text-[#D8CFC1]/60">
                No publication releases recorded yet. When you push changes live, the deployment record will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {publicationHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-[#2B2D2F] border border-[#3A3C3E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#B08D57] font-semibold">
                          Release {rec.batchId}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] uppercase font-mono">
                          Live
                        </span>
                      </div>
                      <p className="text-[#F2EEE7] mt-1">
                        {rec.notes || 'Batch deployment of portfolio and studio updates.'}
                      </p>
                      <p className="text-[11px] font-mono text-[#D8CFC1]/50 mt-1">
                        Published by: {rec.publishedBy} • {rec.itemsCount} content entity updates
                      </p>
                    </div>

                    <span className="font-mono text-[#D8CFC1]/60 text-[11px]">
                      {new Date(rec.publishedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 12: DATABASE ARCHITECTURE */}
        {currentTab === 'database' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3A3C3E]">
              <div>
                <h2 className="font-serif-title text-3xl text-[#F2EEE7]">
                  PostgreSQL & Storage
                </h2>
                <p className="text-xs text-[#D8CFC1]/70 mt-1">
                  Active relational PostgreSQL database connected via <strong>DATABASE_URL</strong>.
                </p>
              </div>

              <button
                onClick={refreshFromDatabase}
                disabled={isLoadingData}
                className="px-4 py-2 bg-[#B08D57] hover:bg-[#9A7745] text-[#202124] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>{isLoadingData ? 'Syncing...' : 'Sync PostgreSQL'}</span>
              </button>
            </div>

            {/* Live Database Status Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-[#2B2D2F] border border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">
                    Engine Status: ONLINE
                  </span>
                </div>
                <h4 className="font-serif-title text-xl text-[#F2EEE7]">PostgreSQL</h4>
                <p className="text-xs text-[#D8CFC1]/70">
                  Connection: <span className="text-[#B08D57] font-mono">DATABASE_URL</span>
                  <br />
                  Engine: <span className="text-[#B08D57] font-mono">Relational SQL</span>
                </p>
              </div>

              <div className="p-5 bg-[#2B2D2F] border border-[#3A3C3E] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B08D57]">
                  ORM & Connection
                </span>
                <h4 className="font-serif-title text-xl text-[#F2EEE7]">Drizzle ORM</h4>
                <p className="text-xs text-[#D8CFC1]/70">
                  Driver: <span className="text-white font-mono">pg.Pool</span>
                  <br />
                  Schema: <span className="text-white font-mono">src/db/schema.ts</span>
                </p>
              </div>

              <div className="p-5 bg-[#2B2D2F] border border-[#3A3C3E] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B08D57]">
                  Persistent Storage
                </span>
                <h4 className="font-serif-title text-xl text-[#F2EEE7]">PostgreSQL Base64 Blobs</h4>
                <p className="text-xs text-[#D8CFC1]/70">
                  Durability: <span className="text-emerald-400 font-mono">100% (No ephemeral loss)</span>
                  <br />
                  Media assets: <span className="text-white font-mono">{mediaItems.length} uploaded</span>
                </p>
              </div>
            </div>

            {/* Table Statistics */}
            <div className="p-6 bg-[#2B2D2F] border border-[#3A3C3E] space-y-4">
              <h3 className="font-serif-title text-xl text-[#B08D57]">Active Database Schema Entities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#202124] border border-[#3A3C3E]">
                  <span className="text-[10px] font-mono text-[#D8CFC1]/60 block uppercase">projects</span>
                  <span className="font-serif-title text-xl text-[#F2EEE7]">{projects.length}</span>
                  <span className="text-[10px] text-emerald-400 block">{publishedProjectsCount} Live</span>
                </div>
                <div className="p-3 bg-[#202124] border border-[#3A3C3E]">
                  <span className="text-[10px] font-mono text-[#D8CFC1]/60 block uppercase">hero_slides</span>
                  <span className="font-serif-title text-xl text-[#F2EEE7]">{heroSlides.length}</span>
                  <span className="text-[10px] text-emerald-400 block">Active Slides</span>
                </div>
                <div className="p-3 bg-[#202124] border border-[#3A3C3E]">
                  <span className="text-[10px] font-mono text-[#D8CFC1]/60 block uppercase">media_blobs</span>
                  <span className="font-serif-title text-xl text-[#F2EEE7]">{mediaItems.length}</span>
                  <span className="text-[10px] text-emerald-400 block">Stored Assets</span>
                </div>
                <div className="p-3 bg-[#202124] border border-[#3A3C3E]">
                  <span className="text-[10px] font-mono text-[#D8CFC1]/60 block uppercase">strip_items</span>
                  <span className="font-serif-title text-xl text-[#F2EEE7]">{stripItems.length}</span>
                  <span className="text-[10px] text-emerald-400 block">Strip Panels</span>
                </div>
                <div className="p-3 bg-[#202124] border border-[#3A3C3E]">
                  <span className="text-[10px] font-mono text-[#D8CFC1]/60 block uppercase">testimonials</span>
                  <span className="font-serif-title text-xl text-[#F2EEE7]">{testimonials.length}</span>
                  <span className="text-[10px] text-amber-400 block">{pendingFeedbackCount} Pending</span>
                </div>
                <div className="p-3 bg-[#202124] border border-[#3A3C3E]">
                  <span className="text-[10px] font-mono text-[#D8CFC1]/60 block uppercase">enquiries</span>
                  <span className="font-serif-title text-xl text-[#F2EEE7]">{enquiries.length}</span>
                  <span className="text-[10px] text-blue-400 block">{newEnquiriesCount} New Unread</span>
                </div>
                <div className="p-3 bg-[#202124] border border-[#3A3C3E]">
                  <span className="text-[10px] font-mono text-[#D8CFC1]/60 block uppercase">publication_history</span>
                  <span className="font-serif-title text-xl text-[#F2EEE7]">{publicationHistory.length}</span>
                  <span className="text-[10px] text-emerald-400 block">Releases</span>
                </div>
                <div className="p-3 bg-[#202124] border border-[#3A3C3E]">
                  <span className="text-[10px] font-mono text-[#D8CFC1]/60 block uppercase">site_settings</span>
                  <span className="font-serif-title text-xl text-[#F2EEE7]">1</span>
                  <span className="text-[10px] text-emerald-400 block">Studio Config</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PUBLISH BATCH CONFIRMATION MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#2B2D2F] border border-[#B08D57] max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#3A3C3E] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#B08D57]" />
                <h3 className="font-serif-title text-xl text-[#F2EEE7]">
                  Push Changes to Live Website
                </h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#D8CFC1]">
              <p>
                You are about to commit all current drafts and modified entities to the production public website.
              </p>

              <div className="p-3 bg-[#202124] border border-white/10 font-mono space-y-2">
                <span className="text-[10px] uppercase text-[#B08D57] font-semibold block">
                  Pending Entities to Publish:
                </span>
                <p className="text-emerald-400">
                  {publicationStatus.count} pending modification(s) detected.
                </p>
                {publicationStatus.summary && publicationStatus.summary.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto pt-1 border-t border-white/5">
                    {publicationStatus.summary.map((item: { type: string; title: string; action: string }, idx: number) => (
                      <div
                        key={idx}
                        className="text-[11px] text-[#D8CFC1]/70 flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{item.title}</span>
                        <span className="uppercase text-[9px] text-[#B08D57] font-semibold flex-shrink-0">
                          {item.type} ({item.action})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#D8CFC1] block mb-1 font-mono">
                  Release Notes / Version Summary (Optional)
                </label>
                <input
                  type="text"
                  value={publishNotes}
                  onChange={(e) => setPublishNotes(e.target.value)}
                  placeholder="e.g., Added Spring 2026 Residential Monographs & Updated Services"
                  className="w-full px-3 py-2 bg-[#202124] border border-[#3A3C3E] text-[#F2EEE7] font-mono text-xs focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              {publishSuccessMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{publishSuccessMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A3C3E]">
              <button
                onClick={() => setShowPublishModal(false)}
                disabled={isPublishing}
                className="px-4 py-2 border border-[#3A3C3E] text-[#D8CFC1] text-xs font-mono uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={isPublishing}
                className="px-6 py-2 bg-[#B08D57] hover:bg-[#9A7745] text-[#202124] text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Committing Release...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Push Live</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
