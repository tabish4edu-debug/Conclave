export interface Project {
  id: string;
  title: string;
  slug: string;
  category: 'Residential' | 'Commercial' | 'Hospitality' | 'Minimalist' | 'Noir Penthouse';
  location: string;
  year: string;
  areaSqFt?: number;
  description: string;
  architecturalBrief: string;
  materialsPalette: string[];
  coverImage: string;
  galleryImages: { url: string; alt: string; caption?: string }[];
  isFeatured: boolean;
  status: 'published' | 'draft';
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  hasUnpublishedChanges?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlide {
  id: string;
  label: string;
  headline: string;
  supportingText: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  imageUrl: string;
  imageAlt: string;
  layoutMode: 'split' | 'fullscreen' | 'overlay';
  projectTag?: string;
  videoUrl?: string;
  sortOrder: number;
  isPublished: boolean;
  hasUnpublishedChanges?: boolean;
}

export interface ContinuousStripItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  altText: string;
  projectId?: string;
  sortOrder: number;
  isPublished: boolean;
  hasUnpublishedChanges?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  scopeDuration: string;
  imageUrl?: string;
  sortOrder: number;
  isPublished: boolean;
  hasUnpublishedChanges?: boolean;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientRole?: string;
  projectReference?: string;
  rating: number; // 1 to 5
  feedbackMessage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isFeatured: boolean;
  submittedAt: string;
  moderatedAt?: string;
}

export interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  location: string;
  budget?: string;
  preferredContact: 'phone' | 'whatsapp' | 'email';
  message: string;
  status: 'NEW' | 'READ' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
  internalNotes?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
  hasUnpublishedChanges?: boolean;
}

export interface SiteSettings {
  studioName: string;
  tagline: string;
  whatsappNumber: string;
  phoneNumber: string;
  quoteButtonText?: string;
  quoteButtonLink?: string;
  email: string;
  address: string;
  workingHours: string;
  heroIntervalSeconds: number;
  heroAutoplay?: boolean;
  heroTransitionType?: string;
  sectionsConfig?: Record<string, { visible: boolean; title?: string; subtitle?: string }>;
  seoTitle?: string;
  seoDescription?: string;
  hasUnpublishedChanges?: boolean;
  instagramUrl: string;
  linkedinUrl: string;
  pinterestUrl: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  trustStripItems?: { title: string; subtitle: string; iconName?: string }[];
  heroStats?: { value: string; label: string }[];
  // Section Headings & Vistas Copy & Media
  vista1Chapter?: string;
  vista1Title?: string;
  vista1Subtitle?: string;
  vista1Spec?: string;
  vista1Image?: string;
  vista2Chapter?: string;
  vista2Title?: string;
  vista2Subtitle?: string;
  vista2Spec?: string;
  vista2Image?: string;
  noirEyebrow?: string;
  noirTitle?: string;
  noirSubtitle?: string;
  noirImage?: string;
  ctaEyebrow?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  ctaMediaUrl?: string;
  footerAboutText?: string;
  footerCopyrightText?: string;
}

export interface AboutStudioData {
  studioIntro: string;
  designerBio: string;
  designerRole: string;
  designerName: string;
  designerPhoto: string;
  philosophyHeadline: string;
  philosophyBody: string;
  influences: {
    title: string;
    description: string;
    paletteNotes: string;
  }[];
  studioStats: {
    value: string;
    label: string;
    sublabel: string;
  }[];
  hasUnpublishedChanges?: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string | null;
  createdAt: string;
}

export interface PublicationRecord {
  id: number;
  batchId: string;
  publishedBy: string;
  publishedByEmail: string;
  itemsCount: number;
  summary: { type: string; title: string; action: string }[];
  notes?: string;
  publishedAt: string;
}

export interface PublicationStatus {
  count: number;
  summary: { type: string; title: string; action: string }[];
}
