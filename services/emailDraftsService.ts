import { db } from '@/lib/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

export interface EmailDraft {
  id?: string
  subject: string
  html: string
  templateId: string
  userId?: string
  createdAt?: string
  updatedAt?: string
}

const emailDraftsCollection = collection(db, 'email_drafts')

export const emailDraftsService = {
  async getAllDrafts() {
    const snapshot = await getDocs(emailDraftsCollection)
    return snapshot.docs.map((snapshotDoc) => ({
      id: snapshotDoc.id,
      ...snapshotDoc.data(),
    })) as EmailDraft[]
  },

  async getDraftsByUser(userId: string) {
    const snapshot = await getDocs(query(emailDraftsCollection, where('userId', '==', userId)))
    return snapshot.docs.map((snapshotDoc) => ({
      id: snapshotDoc.id,
      ...snapshotDoc.data(),
    })) as EmailDraft[]
  },

  async saveDraft(draft: EmailDraft) {
    const payload = {
      subject: draft.subject || '',
      html: draft.html || '',
      templateId: draft.templateId || 'blast',
      updatedAt: new Date().toISOString(),
      ...(draft.userId ? { userId: draft.userId } : {}),
    }

    if (draft.id) {
      const draftRef = doc(db, 'email_drafts', draft.id)
      const draftSnapshot = await getDoc(draftRef)

      if (!draftSnapshot.exists()) {
        await setDoc(draftRef, {
          ...payload,
          createdAt: new Date().toISOString(),
        })
        return draft.id
      }

      await updateDoc(draftRef, payload)
      return draft.id
    }

    const created = await addDoc(emailDraftsCollection, {
      ...payload,
      createdAt: new Date().toISOString(),
    })

    return created.id
  },

  async deleteDraft(id: string) {
    await deleteDoc(doc(db, 'email_drafts', id))
  },
}
