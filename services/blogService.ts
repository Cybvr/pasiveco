
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  image: string;
  imageUrl?: string;
  slug: string;
}

function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function uploadImage(file: File): Promise<string> {
  const storageRef = ref(storage, `blog_images/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export const blogService = {
  async getAllPosts() {
    const snapshot = await getDocs(collection(db, 'blog_posts'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getPost(id: string) {
    const docRef = await getDoc(doc(db, 'blog_posts', id));
    return docRef.exists() ? { id: docRef.id, ...docRef.data() } : null;
  },

  async createPost(post: BlogPost) {
    const slug = generateSlug(post.title);
    return await addDoc(collection(db, 'blog_posts'), { ...post, slug });
  },

  async updatePost(id: string, post: Partial<BlogPost>) {
    const docRef = doc(db, 'blog_posts', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return await setDoc(docRef, post);
    }
    return await updateDoc(docRef, post);
  },

  async deletePost(id: string) {
    return await deleteDoc(doc(db, 'blog_posts', id));
  }
};
