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

// In-memory token fallback if needed, never stored in browser storage
let inMemoryAuthToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  inMemoryAuthToken = token;
}

export function getApiAuthToken(): string | null {
  return inMemoryAuthToken;
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)conclave_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getApiAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  headers.set('X-Requested-With', 'XMLHttpRequest');

  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken && !headers.has('X-CSRF-Token')) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request to ${url} failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // PostgreSQL Admin Session Authentication
  async login(email: string, password: string): Promise<{ authenticated: boolean; user: any; csrfToken?: string }> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return request('/api/auth/logout', { method: 'POST' });
  },

  async getSession(): Promise<{ authenticated: boolean; user: any; csrfToken?: string }> {
    return request('/api/auth/session');
  },

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    return request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Media Upload (Photos & Videos) to Persistent Storage
  async uploadMedia(file: File, altText?: string): Promise<{ url: string; filename: string; size: number; id: string; mimeType?: string; isVideo?: boolean }> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) {
      formData.append('altText', altText);
    }
    return request('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async uploadImage(file: File, altText?: string) {
    return this.uploadMedia(file, altText);
  },

  // Media Library
  async getMediaLibrary(): Promise<MediaItem[]> {
    return request<MediaItem[]>('/api/media');
  },
  async deleteMedia(id: string): Promise<{ success: boolean; deletedId: string }> {
    return request(`/api/media/${id}`, { method: 'DELETE' });
  },

  // Auth Verification
  async verifyAuth(): Promise<{ authenticated: boolean; user: any; isLocal: boolean }> {
    return request('/api/auth/verify', { method: 'POST' });
  },

  // Publication Workflow & Audit History
  async getPublicationStatus(): Promise<PublicationStatus> {
    return request<PublicationStatus>('/api/admin/publication-status');
  },
  async publishBatch(notes?: string): Promise<{ success: boolean; batchId: string; itemsCount: number; summary: any[] }> {
    return request('/api/admin/publish-batch', {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },
  async getPublicationHistory(): Promise<PublicationRecord[]> {
    return request<PublicationRecord[]>('/api/admin/publication-history');
  },

  // Projects
  async getProjects(includeDrafts = false): Promise<Project[]> {
    return request<Project[]>(`/api/projects${includeDrafts ? '?drafts=true' : ''}`);
  },
  async getProjectById(id: string, includeDrafts = false): Promise<Project> {
    return request<Project>(`/api/projects/${id}${includeDrafts ? '?drafts=true' : ''}`);
  },
  async createProject(project: Partial<Project>): Promise<Project> {
    return request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    return request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async duplicateProject(id: string): Promise<Project> {
    return request<Project>(`/api/projects/${id}/duplicate`, {
      method: 'POST',
    });
  },
  async deleteProject(id: string): Promise<{ success: boolean }> {
    return request(`/api/projects/${id}`, { method: 'DELETE' });
  },
  async publishProject(id: string, isPublished: boolean): Promise<Project> {
    return request<Project>(`/api/projects/${id}/publish`, {
      method: 'PUT',
      body: JSON.stringify({ isPublished }),
    });
  },

  // Hero Slides
  async getHeroSlides(includeDrafts = false): Promise<HeroSlide[]> {
    return request<HeroSlide[]>(`/api/hero-slides${includeDrafts ? '?drafts=true' : ''}`);
  },
  async createHeroSlide(slide: Partial<HeroSlide>): Promise<HeroSlide> {
    return request<HeroSlide>('/api/hero-slides', {
      method: 'POST',
      body: JSON.stringify(slide),
    });
  },
  async updateHeroSlide(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide> {
    return request<HeroSlide>(`/api/hero-slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteHeroSlide(id: string): Promise<{ success: boolean }> {
    return request(`/api/hero-slides/${id}`, { method: 'DELETE' });
  },
  async publishHeroSlide(id: string, isPublished: boolean): Promise<HeroSlide> {
    return request<HeroSlide>(`/api/hero-slides/${id}/publish`, {
      method: 'PUT',
      body: JSON.stringify({ isPublished }),
    });
  },

  // Strip Items
  async getStripItems(includeDrafts = false): Promise<ContinuousStripItem[]> {
    return request<ContinuousStripItem[]>(`/api/strip-items${includeDrafts ? '?drafts=true' : ''}`);
  },
  async createStripItem(item: Partial<ContinuousStripItem>): Promise<ContinuousStripItem> {
    return request<ContinuousStripItem>('/api/strip-items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
  async updateStripItem(id: string, updates: Partial<ContinuousStripItem>): Promise<ContinuousStripItem> {
    return request<ContinuousStripItem>(`/api/strip-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteStripItem(id: string): Promise<{ success: boolean }> {
    return request(`/api/strip-items/${id}`, { method: 'DELETE' });
  },

  // Services
  async getServices(includeDrafts = false): Promise<ServiceItem[]> {
    return request<ServiceItem[]>(`/api/services${includeDrafts ? '?drafts=true' : ''}`);
  },
  async createService(service: Partial<ServiceItem>): Promise<ServiceItem> {
    return request<ServiceItem>('/api/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  },
  async updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
    return request<ServiceItem>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteService(id: string): Promise<{ success: boolean }> {
    return request(`/api/services/${id}`, { method: 'DELETE' });
  },
  async publishService(id: string, isPublished: boolean): Promise<ServiceItem> {
    return request<ServiceItem>(`/api/services/${id}/publish`, {
      method: 'PUT',
      body: JSON.stringify({ isPublished }),
    });
  },

  // Testimonials & Feedback Moderation
  async getTestimonials(all = false): Promise<TestimonialItem[]> {
    return request<TestimonialItem[]>(`/api/testimonials${all ? '?all=true' : ''}`);
  },
  async submitFeedback(data: {
    clientName: string;
    clientRole?: string;
    projectReference?: string;
    rating: number;
    feedbackMessage: string;
  }): Promise<{ success: boolean; message: string; item: TestimonialItem }> {
    return request('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async moderateFeedback(
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'PENDING',
    isFeatured?: boolean
  ): Promise<TestimonialItem> {
    return request<TestimonialItem>(`/api/testimonials/${id}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ status, isFeatured }),
    });
  },
  async deleteTestimonial(id: string): Promise<{ success: boolean }> {
    return request(`/api/testimonials/${id}`, { method: 'DELETE' });
  },

  // Enquiries (Strictly Authenticated Admin)
  async getEnquiries(): Promise<EnquiryItem[]> {
    return request<EnquiryItem[]>('/api/enquiries');
  },
  async submitEnquiry(data: {
    name: string;
    email: string;
    phone?: string;
    projectType: string;
    location?: string;
    budget?: string;
    preferredContact: 'phone' | 'whatsapp' | 'email';
    message: string;
  }): Promise<{ success: boolean; message: string; item: EnquiryItem }> {
    return request('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateEnquiryStatus(
    id: string,
    status: 'NEW' | 'READ' | 'CONTACTED' | 'CLOSED',
    internalNotes?: string
  ): Promise<EnquiryItem> {
    return request<EnquiryItem>(`/api/enquiries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, internalNotes }),
    });
  },
  async deleteEnquiry(id: string): Promise<{ success: boolean }> {
    return request(`/api/enquiries/${id}`, { method: 'DELETE' });
  },

  // FAQs
  async getFaqs(includeDrafts = false): Promise<FaqItem[]> {
    return request<FaqItem[]>(`/api/faqs${includeDrafts ? '?drafts=true' : ''}`);
  },
  async createFaq(faq: Partial<FaqItem>): Promise<FaqItem> {
    return request<FaqItem>('/api/faqs', {
      method: 'POST',
      body: JSON.stringify(faq),
    });
  },
  async updateFaq(id: string, updates: Partial<FaqItem>): Promise<FaqItem> {
    return request<FaqItem>(`/api/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteFaq(id: string): Promise<{ success: boolean }> {
    return request(`/api/faqs/${id}`, { method: 'DELETE' });
  },
  async publishFaq(id: string, isPublished: boolean): Promise<FaqItem> {
    return request<FaqItem>(`/api/faqs/${id}/publish`, {
      method: 'PUT',
      body: JSON.stringify({ isPublished }),
    });
  },

  // Settings & About
  async getSettings(): Promise<SiteSettings> {
    return request<SiteSettings>('/api/settings');
  },
  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    return request<SiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
  async getAbout(): Promise<AboutStudioData> {
    return request<AboutStudioData>('/api/about');
  },
  async updateAbout(about: Partial<AboutStudioData>): Promise<AboutStudioData> {
    return request<AboutStudioData>('/api/about', {
      method: 'PUT',
      body: JSON.stringify(about),
    });
  },
};
