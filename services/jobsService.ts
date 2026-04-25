
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { sendResendEmail, getResendConfig } from '@/lib/resend';

export interface Job {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  location?: string;
  type?: string; // e.g., Full-time, Contract
}

export interface JobApplication {
  id?: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  portfolioUrl?: string;
  message?: string;
  createdAt: Timestamp;
}

const JOBS_COLLECTION = 'jobs';
const APPLICATIONS_COLLECTION = 'job_applications';
const ADMIN_EMAIL = 'hello@pasive.co';

export const jobsService = {
  async getAllJobs(onlyActive = true) {
    let q = query(collection(db, JOBS_COLLECTION), orderBy('createdAt', 'desc'));
    if (onlyActive) {
      q = query(collection(db, JOBS_COLLECTION), where('active', '==', true), orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
  },

  async getJob(id: string) {
    if (!id) return null;
    try {
      const docRef = await getDoc(doc(db, JOBS_COLLECTION, id));
      return docRef.exists() ? { id: docRef.id, ...docRef.data() } as Job : null;
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      return null;
    }
  },

  async getJobBySlug(slug: string) {
    if (!slug) return null;
    try {
      const q = query(collection(db, JOBS_COLLECTION), where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Job;
    } catch (error) {
      console.error('Error fetching job by slug:', error);
      return null;
    }
  },

  async createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Timestamp.now();
    return await addDoc(collection(db, JOBS_COLLECTION), {
      ...job,
      createdAt: now,
      updatedAt: now,
    });
  },

  async updateJob(id: string, updates: Partial<Job>) {
    const docRef = doc(db, JOBS_COLLECTION, id);
    return await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteJob(id: string) {
    return await deleteDoc(doc(db, JOBS_COLLECTION, id));
  },

  async submitApplication(application: Omit<JobApplication, 'createdAt'>) {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...application,
      createdAt: now,
    });

    // 1. "Auto-register" the user in Firestore if they don't exist
    try {
      const userRef = doc(db, 'users', application.email.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: application.email.toLowerCase(),
          displayName: application.fullName,
          role: 'user',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          metadata: {
            signUpMethod: 'job_application'
          }
        });
      }
    } catch (error) {
      console.error('Error auto-registering user:', error);
    }

    // 2. Send Emails via Resend
    const { from } = getResendConfig();
    if (from) {
      try {
        const firstName = application.fullName.split(' ')[0] || 'there';
        
        // Send Welcome Email to Applicant
        await sendResendEmail({
          from,
          to: application.email,
          subject: `Welcome to Pasive, ${firstName}!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #4F46E5;">Welcome to Pasive!</h1>
              <p>Hi ${firstName},</p>
              <p>Thanks for applying for the <strong>${application.jobTitle}</strong> position. We've received your application and our team is reviewing it.</p>
              <p>In the meantime, feel free to check out what we're building at <a href="https://pasive.co">pasive.co</a>.</p>
              <p>Best regards,<br>The Pasive Team</p>
            </div>
          `
        });

        // Send Notification to Admin
        await sendResendEmail({
          from,
          to: ADMIN_EMAIL,
          subject: `New Job Application: ${application.jobTitle}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>New Application Received</h2>
              <p><strong>Job:</strong> ${application.jobTitle}</p>
              <p><strong>Name:</strong> ${application.fullName}</p>
              <p><strong>Email:</strong> ${application.email}</p>
              <p><strong>Portfolio:</strong> ${application.portfolioUrl || 'N/A'}</p>
              <p><strong>Message:</strong></p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
                ${application.message || 'No message provided.'}
              </div>
            </div>
          `
        });
      } catch (error) {
        console.error('Error sending emails via Resend:', error);
      }
    }

    return docRef.id;
  },

  async getApplications() {
    const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
  }
};
