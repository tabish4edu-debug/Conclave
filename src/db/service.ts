import { db } from './index.ts';
import {
  projects,
  heroSlides,
  stripItems,
  services,
  testimonials,
  enquiries,
  faqs,
  siteSettings,
  aboutStudio,
  mediaUploads,
  users,
  publicationHistory,
} from './schema.ts';
import { eq, desc, asc, and } from 'drizzle-orm';
import crypto from 'crypto';
import {
  INITIAL_PROJECTS,
  INITIAL_HERO_SLIDES,
  INITIAL_STRIP_ITEMS,
  INITIAL_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_ENQUIRIES,
  INITIAL_FAQS,
  INITIAL_SETTINGS,
  INITIAL_ABOUT,
} from '../data/initialData.ts';

// User helper
export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const isOwner = email.toLowerCase().includes('mumtazara593') || email.toLowerCase().includes('conclave');
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
        role: isOwner ? 'admin' : 'admin',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to get/create user:', error);
    throw error;
  }
}

// Projects
export async function getAllProjects(onlyPublished = false) {
  try {
    if (onlyPublished) {
      return await db
        .select()
        .from(projects)
        .where(eq(projects.status, 'published'))
        .orderBy(asc(projects.sortOrder), desc(projects.createdAt));
    }
    return await db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.createdAt));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Could not fetch projects');
  }
}

export async function getProjectById(id: string, onlyPublished = false) {
  try {
    if (onlyPublished) {
      const res = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.status, 'published')))
        .limit(1);
      return res[0] || null;
    }
    const res = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return res[0] || null;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw new Error('Could not fetch project');
  }
}

export async function createProject(data: typeof projects.$inferInsert) {
  try {
    const res = await db.insert(projects).values({
      ...data,
      hasUnpublishedChanges: true,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Could not create project');
  }
}

export async function updateProject(id: string, data: Partial<typeof projects.$inferInsert>) {
  try {
    const res = await db
      .update(projects)
      .set({ ...data, hasUnpublishedChanges: true, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return res[0];
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    throw new Error('Could not update project');
  }
}

export async function duplicateProject(id: string) {
  try {
    const original = await getProjectById(id, false);
    if (!original) throw new Error('Project not found to duplicate');

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `${original.id}-copy-${randomSuffix}`;
    const newSlug = `${original.slug}-copy-${randomSuffix}`;
    const newTitle = `${original.title} (Copy)`;

    const res = await db.insert(projects).values({
      ...original,
      id: newId,
      slug: newSlug,
      title: newTitle,
      status: 'draft',
      hasUnpublishedChanges: true,
      sortOrder: (original.sortOrder || 0) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return res[0];
  } catch (error) {
    console.error(`Error duplicating project ${id}:`, error);
    throw new Error('Could not duplicate project');
  }
}

export async function deleteProject(id: string) {
  try {
    await db.delete(projects).where(eq(projects.id, id));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw new Error('Could not delete project');
  }
}

export async function publishProject(id: string, isPublished: boolean) {
  try {
    const status = isPublished ? 'published' : 'draft';
    const res = await db
      .update(projects)
      .set({
        status,
        hasUnpublishedChanges: false,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return res[0];
  } catch (error) {
    console.error(`Error publishing/unpublishing project ${id}:`, error);
    throw new Error('Could not update project publish status');
  }
}

// Hero Slides
export async function getAllHeroSlides(onlyPublished = false) {
  try {
    if (onlyPublished) {
      return await db
        .select()
        .from(heroSlides)
        .where(eq(heroSlides.isPublished, true))
        .orderBy(asc(heroSlides.sortOrder));
    }
    return await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder));
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    throw new Error('Could not fetch hero slides');
  }
}

export async function createHeroSlide(data: typeof heroSlides.$inferInsert) {
  try {
    const res = await db.insert(heroSlides).values({
      ...data,
      hasUnpublishedChanges: true,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('Error creating hero slide:', error);
    throw new Error('Could not create hero slide');
  }
}

export async function updateHeroSlide(id: string, data: Partial<typeof heroSlides.$inferInsert>) {
  try {
    const res = await db.update(heroSlides).set({
      ...data,
      hasUnpublishedChanges: true,
    }).where(eq(heroSlides.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error(`Error updating hero slide ${id}:`, error);
    throw new Error('Could not update hero slide');
  }
}

export async function deleteHeroSlide(id: string) {
  try {
    await db.delete(heroSlides).where(eq(heroSlides.id, id));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting hero slide ${id}:`, error);
    throw new Error('Could not delete hero slide');
  }
}

export async function publishHeroSlide(id: string, isPublished: boolean) {
  try {
    const res = await db
      .update(heroSlides)
      .set({
        isPublished,
        hasUnpublishedChanges: false,
      })
      .where(eq(heroSlides.id, id))
      .returning();
    return res[0];
  } catch (error) {
    console.error(`Error publishing/unpublishing hero slide ${id}:`, error);
    throw new Error('Could not update hero slide publish status');
  }
}

// Strip Items
export async function getAllStripItems(onlyPublished = false) {
  try {
    if (onlyPublished) {
      return await db
        .select()
        .from(stripItems)
        .where(eq(stripItems.isPublished, true))
        .orderBy(asc(stripItems.sortOrder));
    }
    return await db.select().from(stripItems).orderBy(asc(stripItems.sortOrder));
  } catch (error) {
    console.error('Error fetching strip items:', error);
    throw new Error('Could not fetch strip items');
  }
}

export async function createStripItem(data: typeof stripItems.$inferInsert) {
  try {
    const res = await db.insert(stripItems).values({
      ...data,
      hasUnpublishedChanges: true,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('Error creating strip item:', error);
    throw new Error('Could not create strip item');
  }
}

export async function updateStripItem(id: string, data: Partial<typeof stripItems.$inferInsert>) {
  try {
    const res = await db.update(stripItems).set({
      ...data,
      hasUnpublishedChanges: true,
    }).where(eq(stripItems.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error(`Error updating strip item ${id}:`, error);
    throw new Error('Could not update strip item');
  }
}

export async function deleteStripItem(id: string) {
  try {
    await db.delete(stripItems).where(eq(stripItems.id, id));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting strip item ${id}:`, error);
    throw new Error('Could not delete strip item');
  }
}

// Services
export async function getAllServices(onlyPublished = false) {
  try {
    if (onlyPublished) {
      return await db
        .select()
        .from(services)
        .where(eq(services.isPublished, true))
        .orderBy(asc(services.sortOrder));
    }
    return await db.select().from(services).orderBy(asc(services.sortOrder));
  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error('Could not fetch services');
  }
}

export async function createService(data: typeof services.$inferInsert) {
  try {
    const res = await db.insert(services).values({
      ...data,
      hasUnpublishedChanges: true,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('Error creating service:', error);
    throw new Error('Could not create service');
  }
}

export async function updateService(id: string, data: Partial<typeof services.$inferInsert>) {
  try {
    const res = await db.update(services).set({
      ...data,
      hasUnpublishedChanges: true,
    }).where(eq(services.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    throw new Error('Could not update service');
  }
}

export async function deleteService(id: string) {
  try {
    await db.delete(services).where(eq(services.id, id));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    throw new Error('Could not delete service');
  }
}

export async function publishService(id: string, isPublished: boolean) {
  try {
    const res = await db
      .update(services)
      .set({
        isPublished,
        hasUnpublishedChanges: false,
      })
      .where(eq(services.id, id))
      .returning();
    return res[0];
  } catch (error) {
    console.error(`Error publishing/unpublishing service ${id}:`, error);
    throw new Error('Could not update service publish status');
  }
}

// Testimonials & Feedback Moderation
export async function getTestimonials(onlyApproved = false) {
  try {
    if (onlyApproved) {
      return await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.status, 'APPROVED'))
        .orderBy(desc(testimonials.submittedAt));
    }
    return await db.select().from(testimonials).orderBy(desc(testimonials.submittedAt));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw new Error('Could not fetch testimonials');
  }
}

export async function submitTestimonial(data: {
  clientName: string;
  clientRole?: string;
  projectReference?: string;
  rating: number;
  feedbackMessage: string;
}) {
  try {
    const newId = `rev-${Date.now()}`;
    const res = await db
      .insert(testimonials)
      .values({
        id: newId,
        clientName: data.clientName,
        clientRole: data.clientRole || null,
        projectReference: data.projectReference || null,
        rating: data.rating,
        feedbackMessage: data.feedbackMessage,
        status: 'PENDING', // Strict moderation gate: default to PENDING
        isFeatured: false,
        submittedAt: new Date(),
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    throw new Error('Could not submit feedback');
  }
}

export async function moderateTestimonial(id: string, status: 'APPROVED' | 'REJECTED', isFeatured?: boolean) {
  try {
    const updateData: any = {
      status,
      moderatedAt: new Date(),
    };
    if (typeof isFeatured === 'boolean') {
      updateData.isFeatured = isFeatured;
    }
    const res = await db.update(testimonials).set(updateData).where(eq(testimonials.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error(`Error moderating testimonial ${id}:`, error);
    throw new Error('Could not moderate testimonial');
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting testimonial ${id}:`, error);
    throw new Error('Could not delete testimonial');
  }
}

// Inquiries / Commission Inquiries Management (Strictly Private)
export async function getAllEnquiries() {
  try {
    return await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    throw new Error('Could not fetch enquiries');
  }
}

export async function createEnquiry(data: {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  location: string;
  budget?: string;
  preferredContact: 'phone' | 'whatsapp' | 'email';
  message: string;
}) {
  try {
    const newId = `enq-${Date.now()}`;
    const res = await db
      .insert(enquiries)
      .values({
        id: newId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        projectType: data.projectType,
        location: data.location,
        budget: data.budget || null,
        preferredContact: data.preferredContact,
        message: data.message,
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('Error creating enquiry:', error);
    throw new Error('Could not create enquiry');
  }
}

export async function updateEnquiryStatus(
  id: string,
  status: 'NEW' | 'READ' | 'CONTACTED' | 'CLOSED',
  internalNotes?: string
) {
  try {
    const updateData: any = { status, updatedAt: new Date() };
    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes;
    }
    const res = await db.update(enquiries).set(updateData).where(eq(enquiries.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error(`Error updating enquiry ${id}:`, error);
    throw new Error('Could not update enquiry status');
  }
}

export async function deleteEnquiry(id: string) {
  try {
    await db.delete(enquiries).where(eq(enquiries.id, id));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting enquiry ${id}:`, error);
    throw new Error('Could not delete enquiry');
  }
}

// FAQs
export async function getAllFaqs(onlyPublished = false) {
  try {
    if (onlyPublished) {
      return await db
        .select()
        .from(faqs)
        .where(eq(faqs.isPublished, true))
        .orderBy(asc(faqs.sortOrder));
    }
    return await db.select().from(faqs).orderBy(asc(faqs.sortOrder));
  } catch (error) {
    console.error('Error fetching faqs:', error);
    throw new Error('Could not fetch faqs');
  }
}

export async function createFaq(data: typeof faqs.$inferInsert) {
  try {
    const res = await db.insert(faqs).values({
      ...data,
      hasUnpublishedChanges: true,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('Error creating faq:', error);
    throw new Error('Could not create FAQ');
  }
}

export async function updateFaq(id: string, data: Partial<typeof faqs.$inferInsert>) {
  try {
    const res = await db.update(faqs).set({
      ...data,
      hasUnpublishedChanges: true,
    }).where(eq(faqs.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error(`Error updating faq ${id}:`, error);
    throw new Error('Could not update FAQ');
  }
}

export async function deleteFaq(id: string) {
  try {
    await db.delete(faqs).where(eq(faqs.id, id));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting faq ${id}:`, error);
    throw new Error('Could not delete FAQ');
  }
}

export async function publishFaq(id: string, isPublished: boolean) {
  try {
    const res = await db
      .update(faqs)
      .set({
        isPublished,
        hasUnpublishedChanges: false,
      })
      .where(eq(faqs.id, id))
      .returning();
    return res[0];
  } catch (error) {
    console.error(`Error publishing/unpublishing faq ${id}:`, error);
    throw new Error('Could not update FAQ publish status');
  }
}

// Site Settings
export async function getSiteSettings() {
  try {
    const res = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).limit(1);
    if (res.length > 0) {
      return res[0];
    }
    const inserted = await db
      .insert(siteSettings)
      .values({
        id: 'default',
        studioName: INITIAL_SETTINGS.studioName,
        tagline: INITIAL_SETTINGS.tagline,
        whatsappNumber: INITIAL_SETTINGS.whatsappNumber,
        phoneNumber: INITIAL_SETTINGS.phoneNumber,
        email: INITIAL_SETTINGS.email,
        address: INITIAL_SETTINGS.address,
        workingHours: INITIAL_SETTINGS.workingHours,
        heroIntervalSeconds: INITIAL_SETTINGS.heroIntervalSeconds,
        instagramUrl: INITIAL_SETTINGS.instagramUrl,
        linkedinUrl: INITIAL_SETTINGS.linkedinUrl,
        pinterestUrl: INITIAL_SETTINGS.pinterestUrl,
        updatedAt: new Date(),
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return INITIAL_SETTINGS;
  }
}

export async function updateSiteSettings(data: Partial<typeof siteSettings.$inferInsert>) {
  try {
    const res = await db
      .insert(siteSettings)
      .values({
        id: 'default',
        ...INITIAL_SETTINGS,
        ...data,
        hasUnpublishedChanges: true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: {
          ...data,
          hasUnpublishedChanges: true,
          updatedAt: new Date(),
        },
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('Error updating site settings:', error);
    throw new Error('Could not update site settings');
  }
}

// About Studio & Manifesto
export async function getAboutStudio() {
  try {
    const res = await db.select().from(aboutStudio).where(eq(aboutStudio.id, 'default')).limit(1);
    if (res.length > 0) {
      return res[0];
    }
    const inserted = await db
      .insert(aboutStudio)
      .values({
        id: 'default',
        studioIntro: INITIAL_ABOUT.studioIntro,
        designerBio: INITIAL_ABOUT.designerBio,
        designerRole: INITIAL_ABOUT.designerRole,
        designerName: INITIAL_ABOUT.designerName,
        designerPhoto: INITIAL_ABOUT.designerPhoto,
        philosophyHeadline: INITIAL_ABOUT.philosophyHeadline,
        philosophyBody: INITIAL_ABOUT.philosophyBody,
        influences: INITIAL_ABOUT.influences,
        studioStats: INITIAL_ABOUT.studioStats,
        updatedAt: new Date(),
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Error fetching about studio data:', error);
    return INITIAL_ABOUT;
  }
}

export async function updateAboutStudio(data: Partial<typeof aboutStudio.$inferInsert>) {
  try {
    const res = await db
      .insert(aboutStudio)
      .values({
        id: 'default',
        ...INITIAL_ABOUT,
        ...data,
        hasUnpublishedChanges: true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: aboutStudio.id,
        set: {
          ...data,
          hasUnpublishedChanges: true,
          updatedAt: new Date(),
        },
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('Error updating about studio data:', error);
    throw new Error('Could not update about studio data');
  }
}

// Publication & Audit Workflow
export async function getUnpublishedChangesSummary() {
  try {
    const summary: { type: string; title: string; action: string }[] = [];

    // Draft or modified projects
    const modProjects = await db
      .select({ id: projects.id, title: projects.title, status: projects.status, hasUnpub: projects.hasUnpublishedChanges })
      .from(projects);

    for (const p of modProjects) {
      if (p.hasUnpub || p.status === 'draft') {
        summary.push({
          type: 'Project',
          title: p.title,
          action: p.status === 'draft' ? 'Draft Project pending publication' : 'Updated Project changes pending live deployment',
        });
      }
    }

    // Hero slides
    const modHero = await db.select({ id: heroSlides.id, headline: heroSlides.headline, hasUnpub: heroSlides.hasUnpublishedChanges }).from(heroSlides);
    for (const h of modHero) {
      if (h.hasUnpub) {
        summary.push({ type: 'Hero Slide', title: h.headline, action: 'Slide updates ready to publish' });
      }
    }

    // Strip items
    const modStrip = await db.select({ id: stripItems.id, title: stripItems.title, hasUnpub: stripItems.hasUnpublishedChanges }).from(stripItems);
    for (const s of modStrip) {
      if (s.hasUnpub) {
        summary.push({ type: 'Continuous Strip', title: s.title, action: 'Strip item changes pending' });
      }
    }

    // Services
    const modServices = await db.select({ id: services.id, title: services.title, hasUnpub: services.hasUnpublishedChanges }).from(services);
    for (const s of modServices) {
      if (s.hasUnpub) {
        summary.push({ type: 'Service', title: s.title, action: 'Service updates pending' });
      }
    }

    // FAQs
    const modFaqs = await db.select({ id: faqs.id, question: faqs.question, hasUnpub: faqs.hasUnpublishedChanges }).from(faqs);
    for (const f of modFaqs) {
      if (f.hasUnpub) {
        summary.push({ type: 'FAQ', title: f.question, action: 'FAQ updates pending' });
      }
    }

    // Site settings & About
    const settings = await getSiteSettings();
    if ((settings as any).hasUnpublishedChanges) {
      summary.push({ type: 'Settings', title: 'Studio Settings & Home Configuration', action: 'Global site settings updated' });
    }

    const about = await getAboutStudio();
    if ((about as any).hasUnpublishedChanges) {
      summary.push({ type: 'About', title: 'Studio Story & Manifesto', action: 'Atelier story updates pending' });
    }

    return {
      count: summary.length,
      summary,
    };
  } catch (error) {
    console.error('Error fetching unpublished changes:', error);
    return { count: 0, summary: [] };
  }
}

export async function publishBatch(publishedBy: string, email: string, note?: string) {
  try {
    const { count, summary } = await getUnpublishedChangesSummary();
    const batchId = `pub-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    // Mark projects as live and clear unpublished flags
    await db.update(projects).set({ hasUnpublishedChanges: false });
    await db.update(heroSlides).set({ hasUnpublishedChanges: false });
    await db.update(stripItems).set({ hasUnpublishedChanges: false });
    await db.update(services).set({ hasUnpublishedChanges: false });
    await db.update(faqs).set({ hasUnpublishedChanges: false });
    await db.update(siteSettings).set({ hasUnpublishedChanges: false });
    await db.update(aboutStudio).set({ hasUnpublishedChanges: false });

    // Record in publication_history
    const historyEntry = await db.insert(publicationHistory).values({
      batchId,
      publishedBy: publishedBy || 'Studio Administrator',
      publishedByEmail: email || process.env.ADMIN_EMAIL || 'admin@conclaveinteriors.com',
      itemsCount: count,
      summary: summary,
      notes: note || `Published batch containing ${count} atelier update(s).`,
      publishedAt: new Date(),
    }).returning();

    return {
      success: true,
      batchId,
      itemsCount: count,
      summary,
      publication: historyEntry[0],
    };
  } catch (error) {
    console.error('Error publishing batch:', error);
    throw new Error('Could not publish changes live');
  }
}

export async function getPublicationHistory() {
  try {
    return await db
      .select()
      .from(publicationHistory)
      .orderBy(desc(publicationHistory.publishedAt))
      .limit(30);
  } catch (error) {
    console.error('Error fetching publication history:', error);
    return [];
  }
}

// Media Upload Record
export async function recordMediaUpload(data: {
  originalName: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}) {
  try {
    const res = await db.insert(mediaUploads).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('Error recording media upload:', error);
    throw new Error('Could not record media upload');
  }
}

export async function getMediaUploads() {
  try {
    return await db.select().from(mediaUploads).orderBy(desc(mediaUploads.createdAt));
  } catch (error) {
    console.error('Error fetching media uploads:', error);
    return [];
  }
}

// Automatic Database Seeding
export async function seedInitialDatabaseIfEmpty() {
  try {
    const existingProjects = await db.select({ id: projects.id }).from(projects).limit(1);
    if (existingProjects.length === 0) {
      console.log('Seeding initial architectural portfolio projects...');
      for (const p of INITIAL_PROJECTS) {
        await db.insert(projects).values({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          location: p.location,
          year: p.year,
          areaSqFt: p.areaSqFt || null,
          description: p.description,
          architecturalBrief: p.architecturalBrief,
          materialsPalette: p.materialsPalette,
          coverImage: p.coverImage,
          galleryImages: p.galleryImages,
          isFeatured: p.isFeatured,
          status: p.status,
          sortOrder: p.sortOrder,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const existingHero = await db.select({ id: heroSlides.id }).from(heroSlides).limit(1);
    if (existingHero.length === 0) {
      console.log('Seeding hero slides...');
      for (const h of INITIAL_HERO_SLIDES) {
        await db.insert(heroSlides).values({
          id: h.id,
          label: h.label,
          headline: h.headline,
          supportingText: h.supportingText,
          primaryCtaText: h.primaryCtaText,
          primaryCtaLink: h.primaryCtaLink,
          secondaryCtaText: h.secondaryCtaText,
          secondaryCtaLink: h.secondaryCtaLink,
          imageUrl: h.imageUrl,
          imageAlt: h.imageAlt,
          layoutMode: h.layoutMode,
          projectTag: h.projectTag || null,
          sortOrder: h.sortOrder,
          isPublished: h.isPublished,
          createdAt: new Date(),
        });
      }
    }

    const existingStrip = await db.select({ id: stripItems.id }).from(stripItems).limit(1);
    if (existingStrip.length === 0) {
      console.log('Seeding continuous strip items...');
      for (const s of INITIAL_STRIP_ITEMS) {
        await db.insert(stripItems).values({
          id: s.id,
          title: s.title,
          category: s.category,
          imageUrl: s.imageUrl,
          altText: s.altText,
          projectId: s.projectId || null,
          sortOrder: s.sortOrder,
          isPublished: s.isPublished,
          createdAt: new Date(),
        });
      }
    }

    const existingServices = await db.select({ id: services.id }).from(services).limit(1);
    if (existingServices.length === 0) {
      console.log('Seeding architectural services...');
      for (const s of INITIAL_SERVICES) {
        await db.insert(services).values({
          id: s.id,
          title: s.title,
          tagline: s.tagline,
          description: s.description,
          deliverables: s.deliverables,
          scopeDuration: s.scopeDuration,
          sortOrder: s.sortOrder,
          isPublished: s.isPublished,
          createdAt: new Date(),
        });
      }
    }

    const existingTestimonials = await db.select({ id: testimonials.id }).from(testimonials).limit(1);
    if (existingTestimonials.length === 0) {
      console.log('Seeding client feedback and testimonials...');
      for (const t of INITIAL_TESTIMONIALS) {
        await db.insert(testimonials).values({
          id: t.id,
          clientName: t.clientName,
          clientRole: t.clientRole || null,
          projectReference: t.projectReference || null,
          rating: t.rating,
          feedbackMessage: t.feedbackMessage,
          status: t.status,
          isFeatured: t.isFeatured,
          submittedAt: new Date(t.submittedAt),
          moderatedAt: t.moderatedAt ? new Date(t.moderatedAt) : null,
        });
      }
    }

    const existingEnquiries = await db.select({ id: enquiries.id }).from(enquiries).limit(1);
    if (existingEnquiries.length === 0) {
      console.log('Seeding sample enquiries for admin review...');
      for (const e of INITIAL_ENQUIRIES) {
        await db.insert(enquiries).values({
          id: e.id,
          name: e.name,
          email: e.email,
          phone: e.phone,
          projectType: e.projectType,
          location: e.location,
          budget: e.budget || null,
          preferredContact: e.preferredContact,
          message: e.message,
          status: e.status,
          internalNotes: e.internalNotes || null,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.createdAt),
        });
      }
    }

    const existingFaqs = await db.select({ id: faqs.id }).from(faqs).limit(1);
    if (existingFaqs.length === 0) {
      console.log('Seeding studio FAQs...');
      for (const f of INITIAL_FAQS) {
        await db.insert(faqs).values({
          id: f.id,
          question: f.question,
          answer: f.answer,
          category: f.category,
          sortOrder: f.sortOrder,
          isPublished: f.isPublished,
          createdAt: new Date(),
        });
      }
    }

    // Ensure site settings & about
    await getSiteSettings();
    await getAboutStudio();

    console.log('Database initial seed check complete.');
  } catch (error) {
    console.error('Error during database seed initialization:', error);
  }
}
