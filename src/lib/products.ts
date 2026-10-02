import { collection, getDocs, getDoc, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from './firebase'
import { Product } from '@/store/useCartStore'

export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'))
    const products: Product[] = []
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product)
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'products', id))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product
    }
    return null
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    return null
  }
}

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), product)
    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
}

export const removeProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'products', id))
  } catch (error) {
    console.error('Error removing product:', error)
    throw error
  }
}

export const toggleProductStock = async (id: string, isOutOfStock: boolean) => {
  try {
    const docRef = doc(db, 'products', id)
    // We use setDoc with merge to only update the isOutOfStock field without overwriting the rest
    await import('firebase/firestore').then(({ setDoc }) => setDoc(docRef, { isOutOfStock }, { merge: true }))
  } catch (error) {
    console.error('Error toggling product stock:', error)
    throw error
  }
}
