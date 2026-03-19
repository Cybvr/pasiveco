import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore'

export interface UserCategory {
  id: string
  name: string
  slug: string
}

export const DEFAULT_USER_CATEGORIES = [
  'Arts',
  'Beauty',
  'Business',
  'Cooking',
  'Crypto',
  'Education',
  'Fashion',
  'Fitness',
  'Gaming',
  'Health',
  'Lifestyle',
  'Music',
  'Politics',
  'Science',
  'Sports',
  'Technology',
  'Travel',
]

const categoriesCollection = collection(db, 'categories')

const createSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

async function seedCategoriesIfNeeded() {
  const existingSnapshot = await getDocs(categoriesCollection)
  if (!existingSnapshot.empty) {
    return
  }

  const batch = writeBatch(db)

  for (const name of DEFAULT_USER_CATEGORIES) {
    const slug = createSlug(name)
    batch.set(doc(db, 'categories', slug), {
      name,
      slug,
    })
  }

  await batch.commit()
}

export async function getUserCategories(): Promise<UserCategory[]> {
  await seedCategoriesIfNeeded()

  const snapshot = await getDocs(query(categoriesCollection, orderBy('name', 'asc')))
  return snapshot.docs.map((item) => {
    const data = item.data() as Partial<UserCategory>
    return {
      id: item.id,
      name: data.name || item.id,
      slug: data.slug || item.id,
    }
  })
}

export async function ensureUserCategory(name: string) {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return null
  }

  const slug = createSlug(trimmedName)
  await setDoc(doc(db, 'categories', slug), {
    name: trimmedName,
    slug,
  }, { merge: true })

  return { id: slug, name: trimmedName, slug }
}
