import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth integration)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  role: text('role').notNull().default('admin'), // 'admin' | 'staff' | 'client'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Architectural Portfolio Projects
export const projects = pgTable('projects', {
  id: text('id').primaryKey(), // slug-like ID e.g. "noir-monolith-penthouse"
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  category: text('category').notNull(), // 'Residential' | 'Commercial' | 'Hospitality' | 'Minimalist' | 'Noir Penthouse'
  location: text('location').notNull(),
  year: text('year').notNull(),
  areaSqFt: integer('area_sq_ft'),
  description: text('description').notNull(),
  architecturalBrief: text('architectural_brief').notNull(),
  materialsPalette: jsonb('materials_palette').$type<string[]>().notNull().default([]),
  coverImage: text('cover_image').notNull(),
  galleryImages: jsonb('gallery_images').$type<{ url: string; alt: string; caption?: string }[]>().notNull().default([]),
  isFeatured: boolean('is_featured').notNull().default(false),
  status: text('status').notNull().default('published'), // 'published' | 'draft'
  sortOrder: integer('sort_order').notNull().default(0),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  hasUnpublishedChanges: boolean('has_unpublished_changes').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Hero Slides
export const heroSlides = pgTable('hero_slides', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  headline: text('headline').notNull(),
  supportingText: text('supporting_text').notNull(),
  primaryCtaText: text('primary_cta_text').notNull(),
  primaryCtaLink: text('primary_cta_link').notNull(),
  secondaryCtaText: text('secondary_cta_text').notNull(),
  secondaryCtaLink: text('secondary_cta_link').notNull(),
  imageUrl: text('image_url').notNull(),
  imageAlt: text('image_alt').notNull(),
  layoutMode: text('layout_mode').notNull().default('split'), // 'split' | 'fullscreen' | 'overlay'
  projectTag: text('project_tag'),
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  hasUnpublishedChanges: boolean('has_unpublished_changes').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Continuous Image Strip
export const stripItems = pgTable('strip_items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text').notNull(),
  projectId: text('project_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  hasUnpublishedChanges: boolean('has_unpublished_changes').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Services
export const services = pgTable('services', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  deliverables: jsonb('deliverables').$type<string[]>().notNull().default([]),
  scopeDuration: text('scope_duration').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  hasUnpublishedChanges: boolean('has_unpublished_changes').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Testimonials & Client Feedback (with Moderation Gate)
export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey(),
  clientName: text('client_name').notNull(),
  clientRole: text('client_role'),
  projectReference: text('project_reference'),
  rating: integer('rating').notNull().default(5),
  feedbackMessage: text('feedback_message').notNull(),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'APPROVED' | 'REJECTED'
  isFeatured: boolean('is_featured').notNull().default(false),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  moderatedAt: timestamp('moderated_at'),
});

// Client Inquiries / Commissions Management
export const enquiries = pgTable('enquiries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  projectType: text('project_type').notNull(),
  location: text('location').notNull(),
  budget: text('budget'),
  preferredContact: text('preferred_contact').notNull().default('email'), // 'phone' | 'whatsapp' | 'email'
  message: text('message').notNull(),
  status: text('status').notNull().default('NEW'), // 'NEW' | 'READ' | 'CONTACTED' | 'CLOSED'
  internalNotes: text('internal_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// FAQs
export const faqs = pgTable('faqs', {
  id: text('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  hasUnpublishedChanges: boolean('has_unpublished_changes').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Site Settings
export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey().default('default'),
  studioName: text('studio_name').notNull().default('CONCLAVE INTERIORS'),
  tagline: text('tagline').notNull().default('Architectural Interior Atelier'),
  whatsappNumber: text('whatsapp_number').notNull().default('+918981119608'),
  phoneNumber: text('phone_number').notNull().default('+918981119608'),
  email: text('email').notNull().default('conclaveinteriorexterior@gmail.com'),
  address: text('address').notNull().default('55, Canal East Road Kolkata - 700085, West Bengal, India'),
  workingHours: text('working_hours').notNull().default('Monday – Saturday: 10:00 to 20:00 IST'),
  heroIntervalSeconds: integer('hero_interval_seconds').notNull().default(7),
  heroAutoplay: boolean('hero_autoplay').notNull().default(true),
  heroTransitionType: text('hero_transition_type').notNull().default('split'),
  sectionsConfig: jsonb('sections_config').$type<Record<string, { visible: boolean; title?: string; subtitle?: string }>>().notNull().default({}),
  seoTitle: text('seo_title').default('CONCLAVE INTERIORS — Luxury Modern Interior Architecture'),
  seoDescription: text('seo_description').default('Bespoke architectural interiors, high-end residential monographs, and monumental minimalist living spaces in Mayfair and Manhattan.'),
  hasUnpublishedChanges: boolean('has_unpublished_changes').notNull().default(false),
  instagramUrl: text('instagram_url').notNull().default('https://instagram.com/conclaveinteriors'),
  linkedinUrl: text('linkedin_url').notNull().default('https://linkedin.com/company/conclaveinteriors'),
  pinterestUrl: text('pinterest_url').notNull().default('https://pinterest.com/conclaveinteriors'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// About Studio & Manifesto Data
export const aboutStudio = pgTable('about_studio', {
  id: text('id').primaryKey().default('default'),
  studioIntro: text('studio_intro').notNull(),
  designerBio: text('designer_bio').notNull(),
  designerRole: text('designer_role').notNull(),
  designerName: text('designer_name').notNull(),
  designerPhoto: text('designer_photo').notNull(),
  philosophyHeadline: text('philosophy_headline').notNull(),
  philosophyBody: text('philosophy_body').notNull(),
  influences: jsonb('influences').$type<{ title: string; description: string; paletteNotes: string }[]>().notNull().default([]),
  studioStats: jsonb('studio_stats').$type<{ value: string; label: string; sublabel: string }[]>().notNull().default([]),
  hasUnpublishedChanges: boolean('has_unpublished_changes').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Media Uploads Log
export const mediaUploads = pgTable('media_uploads', {
  id: serial('id').primaryKey(),
  originalName: text('original_name').notNull(),
  fileName: text('file_name').notNull(),
  url: text('url').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Persistent Online Media Storage (Database Blobs for zero-loss container reboots)
export const mediaBlobs = pgTable('media_blobs', {
  id: text('id').primaryKey(), // unique hash or uuid
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  dataBase64: text('data_base64').notNull(), // base64 representation of the media file
  altText: text('alt_text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Publication / Audit History Log
export const publicationHistory = pgTable('publication_history', {
  id: serial('id').primaryKey(),
  batchId: text('batch_id').notNull(),
  publishedBy: text('published_by').notNull(),
  publishedByEmail: text('published_by_email').notNull(),
  itemsCount: integer('items_count').notNull(),
  summary: jsonb('summary').$type<{ type: string; title: string; action: string }[]>().notNull().default([]),
  notes: text('notes'),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
});
