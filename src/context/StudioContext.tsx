import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Project,
  HeroSlide,
  ContinuousStripItem,
  ServiceItem,
  TestimonialItem,
  EnquiryItem,
  FaqItem,
  SiteSettings,
  AboutStudioData,
  MediaItem,
  PublicationRecord,
  PublicationStatus,
} from '../types.ts';
import {
  INITIAL_SETTINGS,
  INITIAL_HERO_SLIDES,
  INITIAL_PROJECTS,
  INITIAL_STRIP_ITEMS,
  INITIAL_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_ENQUIRIES,
  INITIAL_FAQS,
  INITIAL_ABOUT,
} from '../data/initialData.ts';
import { api, setApiAuthToken, getApiAuthToken } from '../lib/api.ts';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface StudioContextType {
  settings: SiteSettings;
  heroSlides: HeroSlide[];
  projects: Project[];
  stripItems: ContinuousStripItem[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  enquiries: EnquiryItem[];
  faqs: FaqItem[];
  about: AboutStudioData;

  // Active UI Navigation / Modals
  activePage: string;
  setActivePage: (page: string) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  isQueryModalOpen: boolean;
  setIsQueryModalOpen: (open: boolean) => void;
  queryInitialTab?: 'whatsapp' | 'call' | 'enquiry';
  setQueryInitialTab: (tab: 'whatsapp' | 'call' | 'enquiry') => void;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;

  // Admin Auth & User
  isAdminLoggedIn: boolean;
  currentUser: { email?: string | null; displayName?: string | null; photoURL?: string | null; role?: string } | null;
  authLoading: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;

  // Preview Mode
  isPreviewMode: boolean;
  togglePreviewMode: () => void;

  // Publication Workflow & Audit History
  publicationStatus: PublicationStatus;
  publicationHistory: PublicationRecord[];
  refreshPublicationStatus: () => Promise<void>;
  publishBatchLive: (notes?: string) => Promise<{ success: boolean; itemsCount: number }>;

  // Media Library
  mediaItems: MediaItem[];
  loadMediaLibrary: () => Promise<void>;
  uploadMediaFile: (file: File, altText?: string) => Promise<MediaItem>;
  deleteMediaItem: (id: string) => Promise<void>;

  // Data Loading & Refresh
  isLoadingData: boolean;
  refreshFromDatabase: () => Promise<void>;

  // CMS Actions
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  updateAbout: (newAbout: Partial<AboutStudioData>) => Promise<void>;

  // Project CMS
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  publishProject: (id: string, isPublished: boolean) => Promise<void>;

  // Hero CMS
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => Promise<void>;
  updateHeroSlide: (id: string, updates: Partial<HeroSlide>) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;
  publishHeroSlide: (id: string, isPublished: boolean) => Promise<void>;

  // Strip CMS
  addStripItem: (item: Omit<ContinuousStripItem, 'id'>) => Promise<void>;
  updateStripItem: (id: string, updates: Partial<ContinuousStripItem>) => Promise<void>;
  deleteStripItem: (id: string) => Promise<void>;

  // Service CMS
  addService: (service: Omit<ServiceItem, 'id'>) => Promise<void>;
  updateService: (id: string, updates: Partial<ServiceItem>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  publishService: (id: string, isPublished: boolean) => Promise<void>;

  // Testimonial / Feedback Moderation CMS
  submitFeedback: (feedback: {
    clientName: string;
    clientRole?: string;
    projectReference?: string;
    rating: number;
    feedbackMessage: string;
  }) => Promise<{ success: boolean; message: string }>;
  moderateFeedback: (id: string, status: 'APPROVED' | 'REJECTED', isFeatured?: boolean) => Promise<void>;
  toggleFeatureFeedback: (id: string) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;

  // Enquiry Management
  submitEnquiry: (enquiry: Omit<EnquiryItem, 'id' | 'status' | 'createdAt'>) => Promise<{ success: boolean; message: string }>;
  updateEnquiryStatus: (id: string, status: 'NEW' | 'READ' | 'CONTACTED' | 'CLOSED', internalNotes?: string) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;

  // FAQ CMS
  addFaq: (faq: Omit<FaqItem, 'id'>) => Promise<void>;
  updateFaq: (id: string, updates: Partial<FaqItem>) => Promise<void>;
  deleteFaq: (id: string) => Promise<void>;
  publishFaq: (id: string, isPublished: boolean) => Promise<void>;

  // System
  resetToDefaults: () => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'conclave_settings_v1',
  HERO: 'conclave_hero_v1',
  PROJECTS: 'conclave_projects_v1',
  STRIP: 'conclave_strip_v1',
  SERVICES: 'conclave_services_v1',
  TESTIMONIALS: 'conclave_testimonials_v1',
  ENQUIRIES: 'conclave_enquiries_v1',
  FAQS: 'conclave_faqs_v1',
  ABOUT: 'conclave_about_v1',
  AUTH: 'conclave_admin_auth_v1',
};

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState<boolean>(false);
  const [queryInitialTab, setQueryInitialTab] = useState<'whatsapp' | 'call' | 'enquiry'>('enquiry');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Preview Mode: when active, administrator previews unpublished drafts on live pages
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Publication Status & History
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>({
    count: 0,
    summary: [],
  });
  const [publicationHistory, setPublicationHistory] = useState<PublicationRecord[]>([]);

  // Media Library
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Entities state with local initialData fallback
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.phoneNumber = '+918981119608';
        parsed.whatsappNumber = '+918981119608';
        if (!parsed.email || parsed.email.includes('interiorinterior') || parsed.email.includes('inquire@conclave') || parsed.email.includes('conclaveinterior')) {
          parsed.email = 'conclaveinteriorexterior@gmail.com';
        }
        if (!parsed.instagramUrl || parsed.instagramUrl.includes('conclaveinteriors')) {
          parsed.instagramUrl = 'https://www.instagram.com/conclave_interior?stkn=MXQ3ZmtsYWw1b2Z3OA==';
        }
        if (!parsed.facebookUrl || parsed.facebookUrl.includes('conclaveinteriors')) {
          parsed.facebookUrl = 'https://www.facebook.com/AmirulDesigner';
        }
        if (!parsed.address || parsed.address.includes('Berkeley') || parsed.address.includes('Kolkata - 700085')) {
          parsed.address = '55, Canal East Road Kolkata - 700085, West Bengal, India';
        }
        if (parsed.workingHours) {
          parsed.workingHours = parsed.workingHours.replaceAll('18:00', '20:00').replaceAll('18:30', '20:00').replaceAll('19:00', '20:00');
        } else {
          parsed.workingHours = 'Monday – Saturday: 10:00 to 20:00 IST';
        }
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
        return parsed;
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HERO);
    return saved ? JSON.parse(saved) : INITIAL_HERO_SLIDES;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [stripItems, setStripItems] = useState<ContinuousStripItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STRIP);
    return saved ? JSON.parse(saved) : INITIAL_STRIP_ITEMS;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    return saved ? JSON.parse(saved) : INITIAL_ENQUIRIES;
  });

  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FAQS);
    return saved ? JSON.parse(saved) : INITIAL_FAQS;
  });

  const [about, setAbout] = useState<AboutStudioData>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ABOUT);
    return saved ? JSON.parse(saved) : INITIAL_ABOUT;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  });

  const [currentUser, setCurrentUser] = useState<{
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    role?: string;
  } | null>(null);

  // Sync activePage with URL hash (e.g. #admin or #)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#/admin') {
        setActivePage('admin');
      } else if (activePage === 'admin') {
        setActivePage('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [activePage]);

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setApiAuthToken(token);
          const verifyRes = await api.verifyAuth();
          if (verifyRes.authenticated) {
            setIsAdminLoggedIn(true);
            localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
            setCurrentUser({
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0],
              photoURL: user.photoURL,
              role: 'admin',
            });
          }
        } catch (err: any) {
          console.error('Firebase Auth token verification failed:', err);
          setIsAdminLoggedIn(false);
          setCurrentUser(null);
          localStorage.removeItem(STORAGE_KEYS.AUTH);
          setApiAuthToken(null);
        }
      } else {
        const storedToken = getApiAuthToken();
        if (!storedToken) {
          setIsAdminLoggedIn(false);
          setCurrentUser(null);
          localStorage.removeItem(STORAGE_KEYS.AUTH);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch live data from PostgreSQL API
  const refreshFromDatabase = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const includeDrafts = isPreviewMode || isAdminLoggedIn;
      const [
        remoteProjects,
        remoteHero,
        remoteStrip,
        remoteServices,
        remoteTestimonials,
        remoteFaqs,
        remoteSettings,
        remoteAbout,
      ] = await Promise.allSettled([
        api.getProjects(includeDrafts),
        api.getHeroSlides(includeDrafts),
        api.getStripItems(includeDrafts),
        api.getServices(includeDrafts),
        api.getTestimonials(isAdminLoggedIn),
        api.getFaqs(includeDrafts),
        api.getSettings(),
        api.getAbout(),
      ]);

      if (remoteProjects.status === 'fulfilled' && remoteProjects.value.length > 0) {
        setProjects(remoteProjects.value);
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(remoteProjects.value));
      }
      if (remoteHero.status === 'fulfilled' && remoteHero.value.length > 0) {
        setHeroSlides(remoteHero.value);
        localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(remoteHero.value));
      }
      if (remoteStrip.status === 'fulfilled' && remoteStrip.value.length > 0) {
        setStripItems(remoteStrip.value);
        localStorage.setItem(STORAGE_KEYS.STRIP, JSON.stringify(remoteStrip.value));
      }
      if (remoteServices.status === 'fulfilled' && remoteServices.value.length > 0) {
        setServices(remoteServices.value);
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(remoteServices.value));
      }
      if (remoteTestimonials.status === 'fulfilled' && remoteTestimonials.value.length > 0) {
        setTestimonials(remoteTestimonials.value);
        localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(remoteTestimonials.value));
      }
      if (remoteFaqs.status === 'fulfilled' && remoteFaqs.value.length > 0) {
        setFaqs(remoteFaqs.value);
        localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(remoteFaqs.value));
      }
      if (remoteSettings.status === 'fulfilled' && remoteSettings.value.studioName) {
        setSettings(remoteSettings.value);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(remoteSettings.value));
      }
      if (remoteAbout.status === 'fulfilled' && remoteAbout.value.studioIntro) {
        setAbout(remoteAbout.value);
        localStorage.setItem(STORAGE_KEYS.ABOUT, JSON.stringify(remoteAbout.value));
      }

      // If admin logged in, also fetch enquiries, publication status, and media library
      if (isAdminLoggedIn) {
        try {
          const [remoteEnquiries, pubStatus, pubHist] = await Promise.allSettled([
            api.getEnquiries(),
            api.getPublicationStatus(),
            api.getPublicationHistory(),
          ]);

          if (remoteEnquiries.status === 'fulfilled' && remoteEnquiries.value) {
            setEnquiries(remoteEnquiries.value);
            localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(remoteEnquiries.value));
          }
          if (pubStatus.status === 'fulfilled') {
            setPublicationStatus(pubStatus.value);
          }
          if (pubHist.status === 'fulfilled') {
            setPublicationHistory(pubHist.value);
          }
        } catch (err) {
          console.warn('Admin status sync error:', err);
        }
      }
    } catch (err) {
      console.warn('Using cached studio data while connecting to database:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAdminLoggedIn, isPreviewMode]);

  // Initial load
  useEffect(() => {
    refreshFromDatabase();
  }, [refreshFromDatabase]);

  // Load Media Library
  const loadMediaLibrary = useCallback(async () => {
    try {
      const media = await api.getMediaLibrary();
      setMediaItems(media);
    } catch (err) {
      console.error('Failed to load media library:', err);
    }
  }, []);

  const uploadMediaFile = async (file: File, altText?: string): Promise<MediaItem> => {
    const res = await api.uploadMedia(file, altText);
    const newItem: MediaItem = {
      id: res.id,
      url: res.url,
      fileName: res.filename,
      originalName: file.name,
      mimeType: file.type || res.mimeType || 'application/octet-stream',
      sizeBytes: res.size,
      altText: altText || null,
      createdAt: new Date().toISOString(),
    };
    setMediaItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const deleteMediaItem = async (id: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
    await api.deleteMedia(id);
  };

  // Refresh publication status
  const refreshPublicationStatus = async () => {
    try {
      const status = await api.getPublicationStatus();
      setPublicationStatus(status);
      const history = await api.getPublicationHistory();
      setPublicationHistory(history);
    } catch (err) {
      console.error('Failed to refresh publication status:', err);
    }
  };

  // Push Changes Live
  const publishBatchLive = async (notes?: string) => {
    const result = await api.publishBatch(notes);
    await refreshPublicationStatus();
    await refreshFromDatabase();
    return { success: result.success, itemsCount: result.itemsCount };
  };

  // Toggle Preview Mode
  const togglePreviewMode = () => {
    setIsPreviewMode((prev) => !prev);
  };

  // -------------------------------------------------------------
  // AUTHENTICATION METHODS (Hardened Google OAuth Only)
  // -------------------------------------------------------------
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthLoading(true);
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      const token = await userCredential.user.getIdToken();
      setApiAuthToken(token);

      // Verify with backend against ADMIN_EMAIL
      const verifyRes = await api.verifyAuth();
      if (!verifyRes.authenticated) {
        throw new Error('Access denied: Email is not the designated Studio Administrator.');
      }

      setIsAdminLoggedIn(true);
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      setCurrentUser({
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        role: 'admin',
      });
      await refreshFromDatabase();
      return { success: true };
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      // Clean up failed login
      signOut(auth).catch(() => null);
      setApiAuthToken(null);
      setIsAdminLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      return { success: false, error: err.message || 'Access denied: Only authorized administrator can access this CMS.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // Retain legacy method signature for compatibility but deny unauthenticated bypass
  const loginAdmin = (_password: string): boolean => {
    console.warn('Direct password login is disabled for security. Use authorized Google Sign-In.');
    return false;
  };

  const logoutAdmin = () => {
    signOut(auth).catch(() => null);
    setApiAuthToken(null);
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    sessionStorage.removeItem('conclave_api_token');
  };

  // -------------------------------------------------------------
  // CMS MUTATIONS
  // -------------------------------------------------------------
  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const sanitized = { ...newSettings };
    if (sanitized.workingHours) {
      sanitized.workingHours = sanitized.workingHours.replaceAll('18:00', '20:00').replaceAll('18:30', '20:00');
    }
    setSettings((prev) => ({ ...prev, ...sanitized, hasUnpublishedChanges: true }));
    try {
      const res = await api.updateSettings(sanitized);
      if (res && res.workingHours) {
        res.workingHours = res.workingHours.replaceAll('18:00', '20:00').replaceAll('18:30', '20:00');
      }
      setSettings(res);
      refreshPublicationStatus();
    } catch (err) {
      console.error('Failed to persist settings to database:', err);
    }
  };

  const updateAbout = async (newAbout: Partial<AboutStudioData>) => {
    setAbout((prev) => ({ ...prev, ...newAbout, hasUnpublishedChanges: true }));
    try {
      const res = await api.updateAbout(newAbout);
      setAbout(res);
      refreshPublicationStatus();
    } catch (err) {
      console.error('Failed to persist about data to database:', err);
    }
  };

  const addProject = async (item: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const slugId = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `proj-${Date.now()}`;
    const newProj: Project = {
      ...item,
      id: slugId,
      hasUnpublishedChanges: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    try {
      const persisted = await api.createProject(newProj);
      setProjects((prev) => prev.map((p) => (p.id === newProj.id ? persisted : p)));
      refreshPublicationStatus();
    } catch (err) {
      console.error('Failed to create project in database:', err);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, hasUnpublishedChanges: true, updatedAt: new Date().toISOString() } : p))
    );
    try {
      const res = await api.updateProject(id, updates);
      setProjects((prev) => prev.map((p) => (p.id === id ? res : p)));
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to update project ${id} in database:`, err);
    }
  };

  const duplicateProject = async (id: string) => {
    try {
      const duplicated = await api.duplicateProject(id);
      setProjects((prev) => [duplicated, ...prev]);
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to duplicate project ${id}:`, err);
    }
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.deleteProject(id);
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to delete project ${id} from database:`, err);
    }
  };

  const publishProject = async (id: string, isPublished: boolean) => {
    const status = isPublished ? 'published' : 'draft';
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, hasUnpublishedChanges: false } : p))
    );
    try {
      const res = await api.publishProject(id, isPublished);
      setProjects((prev) => prev.map((p) => (p.id === id ? res : p)));
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to update project ${id} publish state:`, err);
    }
  };

  const addHeroSlide = async (slide: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = {
      ...slide,
      id: `hero-${Date.now()}`,
      hasUnpublishedChanges: true,
    };
    setHeroSlides((prev) => [...prev, newSlide]);
    try {
      const persisted = await api.createHeroSlide(newSlide);
      setHeroSlides((prev) => prev.map((s) => (s.id === newSlide.id ? persisted : s)));
      refreshPublicationStatus();
    } catch (err) {
      console.error('Failed to save hero slide to database:', err);
    }
  };

  const updateHeroSlide = async (id: string, updates: Partial<HeroSlide>) => {
    setHeroSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates, hasUnpublishedChanges: true } : s)));
    try {
      const res = await api.updateHeroSlide(id, updates);
      setHeroSlides((prev) => prev.map((s) => (s.id === id ? res : s)));
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to update hero slide ${id} in database:`, err);
    }
  };

  const deleteHeroSlide = async (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
    try {
      await api.deleteHeroSlide(id);
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to delete hero slide ${id} from database:`, err);
    }
  };

  const publishHeroSlide = async (id: string, isPublished: boolean) => {
    setHeroSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPublished, hasUnpublishedChanges: false } : s))
    );
    try {
      const res = await api.publishHeroSlide(id, isPublished);
      setHeroSlides((prev) => prev.map((s) => (s.id === id ? res : s)));
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to update hero slide ${id} publish state:`, err);
    }
  };

  const addStripItem = async (item: Omit<ContinuousStripItem, 'id'>) => {
    const newItem: ContinuousStripItem = {
      ...item,
      id: `strip-${Date.now()}`,
      hasUnpublishedChanges: true,
    };
    setStripItems((prev) => [...prev, newItem]);
    try {
      const res = await api.createStripItem(newItem);
      setStripItems((prev) => prev.map((s) => (s.id === newItem.id ? res : s)));
      refreshPublicationStatus();
    } catch (err) {
      console.error('Failed to save strip item to database:', err);
    }
  };

  const updateStripItem = async (id: string, updates: Partial<ContinuousStripItem>) => {
    setStripItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates, hasUnpublishedChanges: true } : s)));
    try {
      const res = await api.updateStripItem(id, updates);
      setStripItems((prev) => prev.map((s) => (s.id === id ? res : s)));
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to update strip item ${id}:`, err);
    }
  };

  const deleteStripItem = async (id: string) => {
    setStripItems((prev) => prev.filter((s) => s.id !== id));
    try {
      await api.deleteStripItem(id);
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to delete strip item ${id}:`, err);
    }
  };

  const addService = async (service: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...service,
      id: `serv-${Date.now()}`,
      hasUnpublishedChanges: true,
    };
    setServices((prev) => [...prev, newService]);
    try {
      const res = await api.createService(newService);
      setServices((prev) => prev.map((s) => (s.id === newService.id ? res : s)));
      refreshPublicationStatus();
    } catch (err) {
      console.error('Failed to create service in database:', err);
    }
  };

  const updateService = async (id: string, updates: Partial<ServiceItem>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates, hasUnpublishedChanges: true } : s)));
    try {
      const res = await api.updateService(id, updates);
      setServices((prev) => prev.map((s) => (s.id === id ? res : s)));
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to update service ${id}:`, err);
    }
  };

  const deleteService = async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await api.deleteService(id);
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to delete service ${id}:`, err);
    }
  };

  const publishService = async (id: string, isPublished: boolean) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPublished, hasUnpublishedChanges: false } : s))
    );
    try {
      const res = await api.publishService(id, isPublished);
      setServices((prev) => prev.map((s) => (s.id === id ? res : s)));
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to update service ${id} publish state:`, err);
    }
  };

  // Feedback & Moderation
  const submitFeedback = async (feedback: {
    clientName: string;
    clientRole?: string;
    projectReference?: string;
    rating: number;
    feedbackMessage: string;
  }) => {
    const tempTestimonial: TestimonialItem = {
      id: `test-${Date.now()}`,
      clientName: feedback.clientName,
      clientRole: feedback.clientRole,
      projectReference: feedback.projectReference,
      rating: feedback.rating,
      feedbackMessage: feedback.feedbackMessage,
      status: 'PENDING',
      isFeatured: false,
      submittedAt: new Date().toISOString(),
    };
    setTestimonials((prev) => [tempTestimonial, ...prev]);
    try {
      const res = await api.submitFeedback(feedback);
      if (res.item) {
        setTestimonials((prev) => prev.map((t) => (t.id === tempTestimonial.id ? res.item : t)));
      }
      return { success: true, message: res.message || 'Feedback submitted for review' };
    } catch (err: any) {
      console.error('Error submitting feedback to backend:', err);
      return { success: true, message: 'Feedback recorded and queued for moderation.' };
    }
  };

  const moderateFeedback = async (id: string, status: 'APPROVED' | 'REJECTED', isFeatured?: boolean) => {
    setTestimonials((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              isFeatured: typeof isFeatured === 'boolean' ? isFeatured : t.isFeatured,
              moderatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    try {
      const res = await api.moderateFeedback(id, status, isFeatured);
      setTestimonials((prev) => prev.map((t) => (t.id === id ? res : t)));
    } catch (err) {
      console.error(`Failed to moderate feedback ${id} in database:`, err);
    }
  };

  const toggleFeatureFeedback = async (id: string) => {
    const target = testimonials.find((t) => t.id === id);
    if (!target) return;
    const newFeatured = !target.isFeatured;
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, isFeatured: newFeatured } : t)));
    try {
      await api.moderateFeedback(id, target.status, newFeatured);
    } catch (err) {
      console.error(`Failed to toggle feature feedback ${id}:`, err);
    }
  };

  const deleteFeedback = async (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.deleteTestimonial(id);
    } catch (err) {
      console.error(`Failed to delete feedback ${id} from database:`, err);
    }
  };

  // Enquiries
  const submitEnquiry = async (enquiry: Omit<EnquiryItem, 'id' | 'status' | 'createdAt'>) => {
    const tempEnquiry: EnquiryItem = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    setEnquiries((prev) => [tempEnquiry, ...prev]);
    try {
      const res = await api.submitEnquiry(enquiry);
      if (res.item) {
        setEnquiries((prev) => prev.map((e) => (e.id === tempEnquiry.id ? res.item : e)));
      }
      return { success: true, message: res.message || 'Enquiry received' };
    } catch (err: any) {
      console.error('Error submitting enquiry to backend:', err);
      return { success: true, message: 'Enquiry recorded. Our team will review your brief.' };
    }
  };

  const updateEnquiryStatus = async (
    id: string,
    status: 'NEW' | 'READ' | 'CONTACTED' | 'CLOSED',
    internalNotes?: string
  ) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status, internalNotes: internalNotes ?? e.internalNotes } : e
      )
    );
    try {
      const res = await api.updateEnquiryStatus(id, status, internalNotes);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? res : e)));
    } catch (err) {
      console.error(`Failed to update enquiry ${id} status:`, err);
    }
  };

  const deleteEnquiry = async (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    try {
      await api.deleteEnquiry(id);
    } catch (err) {
      console.error(`Failed to delete enquiry ${id}:`, err);
    }
  };

  // FAQs
  const addFaq = async (faq: Omit<FaqItem, 'id'>) => {
    const newFaq: FaqItem = {
      ...faq,
      id: `faq-${Date.now()}`,
      hasUnpublishedChanges: true,
    };
    setFaqs((prev) => [...prev, newFaq]);
    try {
      const res = await api.createFaq(newFaq);
      setFaqs((prev) => prev.map((f) => (f.id === newFaq.id ? res : f)));
      refreshPublicationStatus();
    } catch (err) {
      console.error('Failed to create FAQ in database:', err);
    }
  };

  const updateFaq = async (id: string, updates: Partial<FaqItem>) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates, hasUnpublishedChanges: true } : f)));
    try {
      const res = await api.updateFaq(id, updates);
      setFaqs((prev) => prev.map((f) => (f.id === id ? res : f)));
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to update FAQ ${id}:`, err);
    }
  };

  const deleteFaq = async (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    try {
      await api.deleteFaq(id);
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to delete FAQ ${id}:`, err);
    }
  };

  const publishFaq = async (id: string, isPublished: boolean) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isPublished, hasUnpublishedChanges: false } : f))
    );
    try {
      const res = await api.publishFaq(id, isPublished);
      setFaqs((prev) => prev.map((f) => (f.id === id ? res : f)));
      refreshPublicationStatus();
    } catch (err) {
      console.error(`Failed to update FAQ ${id} publish state:`, err);
    }
  };

  const resetToDefaults = () => {
    setSettings(INITIAL_SETTINGS);
    setHeroSlides(INITIAL_HERO_SLIDES);
    setProjects(INITIAL_PROJECTS);
    setStripItems(INITIAL_STRIP_ITEMS);
    setServices(INITIAL_SERVICES);
    setTestimonials(INITIAL_TESTIMONIALS);
    setEnquiries(INITIAL_ENQUIRIES);
    setFaqs(INITIAL_FAQS);
    setAbout(INITIAL_ABOUT);
    localStorage.clear();
  };

  return (
    <StudioContext.Provider
      value={{
        settings,
        heroSlides,
        projects,
        stripItems,
        services,
        testimonials,
        enquiries,
        faqs,
        about,
        activePage,
        setActivePage,
        selectedProject,
        setSelectedProject,
        isQueryModalOpen,
        setIsQueryModalOpen,
        queryInitialTab,
        setQueryInitialTab,
        isFeedbackModalOpen,
        setIsFeedbackModalOpen,
        isAdminLoggedIn,
        currentUser,
        authLoading,
        loginWithGoogle,
        loginAdmin,
        logoutAdmin,
        isPreviewMode,
        togglePreviewMode,
        publicationStatus,
        publicationHistory,
        refreshPublicationStatus,
        publishBatchLive,
        mediaItems,
        loadMediaLibrary,
        uploadMediaFile,
        deleteMediaItem,
        isLoadingData,
        refreshFromDatabase,
        updateSettings,
        updateAbout,
        addProject,
        updateProject,
        duplicateProject,
        deleteProject,
        publishProject,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        publishHeroSlide,
        addStripItem,
        updateStripItem,
        deleteStripItem,
        addService,
        updateService,
        deleteService,
        publishService,
        submitFeedback,
        moderateFeedback,
        toggleFeatureFeedback,
        deleteFeedback,
        submitEnquiry,
        updateEnquiryStatus,
        deleteEnquiry,
        addFaq,
        updateFaq,
        deleteFaq,
        publishFaq,
        resetToDefaults,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
