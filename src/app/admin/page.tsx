'use client'

import { useUserStore } from '@/store/useUserStore'
import { getProducts, addProduct, removeProduct, toggleProductStock } from '@/lib/products'
import { Product } from '@/store/useCartStore'
import { useState, useEffect, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { Trash2, X, PackageX, PackageCheck } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useUserStore()
  const [products, setProducts] = useState<Product[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Add Product State
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [addingProduct, setAddingProduct] = useState(false)

  // Add Admin State
  const [adminName, setAdminName] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)

  useEffect(() => {
    if (user?.isAdmin) {
      loadProducts()
    }
  }, [user])

  const loadProducts = async () => {
    const fetched = await getProducts()
    setProducts(fetched)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !description || !imageFile) return
    
    setAddingProduct(true)
    try {
      // 1. Convert Image to Base64 (Bypassing Firebase Storage)
      const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = error => reject(error)
        })
      }
      
      const base64Image = await getBase64(imageFile)
      
      // 2. Add to Firestore directly
      await addProduct({
        name,
        price: Number(price),
        description,
        image: base64Image
      })
      
      // Reset form
      setName('')
      setPrice('')
      setDescription('')
      setImageFile(null)
      
      // Refresh list
      loadProducts()
      alert("Product added successfully!")
    } catch (error) {
      console.error(error)
      alert("Error adding product. If image is too large, try compressing it first.")
    } finally {
      setAddingProduct(false)
    }
  }

  const handleRemoveProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product?')) return
    try {
      await removeProduct(id)
      loadProducts()
    } catch (error) {
      console.error(error)
      alert("Error removing product.")
    }
  }

  const handleToggleStock = async (id: string, currentlyOutOfStock: boolean) => {
    try {
      await toggleProductStock(id, !currentlyOutOfStock)
      loadProducts()
    } catch (error) {
      console.error(error)
      alert("Error updating product stock status.")
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminName || !adminPhone) return
    
    setAddingAdmin(true)
    try {
      const cleanPhone = adminPhone.replace(/\D/g, '')
      await setDoc(doc(db, 'admins', cleanPhone), {
        name: adminName,
        addedBy: user?.phone,
        addedAt: new Date().toISOString()
      })
      setAdminName('')
      setAdminPhone('')
      alert("Admin added successfully!")
    } catch (error) {
      console.error(error)
      alert("Error adding admin.")
    } finally {
      setAddingAdmin(false)
    }
  }

  if (!user || !user.isAdmin) {
    return <div className="container mx-auto px-4 py-16 text-center text-xl text-red-500">Access Denied. You are not an admin.</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-primary mb-12">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ADD PRODUCT SECTION */}
        <div className="bg-card p-6 rounded-3xl border border-border">
          <h2 className="text-2xl font-bold text-primary mb-6">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-3 rounded-xl border border-border bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium">Price (₹)</label>
              <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full mt-1 p-3 rounded-xl border border-border bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-3 rounded-xl border border-border bg-background min-h-[100px]" />
            </div>
            <div>
              <label className="text-sm font-medium">Product Image</label>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  required={!imageFile}
                  ref={fileInputRef}
                  onChange={e => setImageFile(e.target.files?.[0] || null)} 
                  className="flex-1 p-3 rounded-xl border border-border bg-background" 
                />
                {imageFile && (
                  <button 
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center"
                    title="Remove Image"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
            <button type="submit" disabled={addingProduct} className="mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-bold disabled:opacity-50">
              {addingProduct ? 'Adding Product...' : 'Publish Product'}
            </button>
          </form>
        </div>

        {/* ADD ADMIN SECTION */}
        <div className="bg-card p-6 rounded-3xl border border-border h-fit">
          <h2 className="text-2xl font-bold text-primary mb-6">Add New Admin</h2>
          <form onSubmit={handleAddAdmin} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Admin Name</label>
              <input type="text" required value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full mt-1 p-3 rounded-xl border border-border bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium">Admin Phone Number</label>
              <input type="text" required value={adminPhone} onChange={e => setAdminPhone(e.target.value)} placeholder="e.g. 917721008644" className="w-full mt-1 p-3 rounded-xl border border-border bg-background" />
            </div>
            <button type="submit" disabled={addingAdmin} className="mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-bold disabled:opacity-50">
              {addingAdmin ? 'Adding Admin...' : 'Grant Admin Access'}
            </button>
          </form>
        </div>
      </div>

      {/* MANAGE PRODUCTS SECTION */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-primary mb-6">Manage Listed Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-card p-4 rounded-2xl border border-border flex flex-col">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-xl mb-4" />
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-primary font-bold">₹{product.price}</p>
              <div className="flex-1"></div>
              {product.isOutOfStock && (
                <div className="mt-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full w-max mx-auto">
                  Currently Out of Stock
                </div>
              )}
              <div className="mt-4 flex flex-col gap-2">
                <button 
                  onClick={() => handleToggleStock(product.id!, !!product.isOutOfStock)} 
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition-colors w-full ${product.isOutOfStock ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                >
                  {product.isOutOfStock ? <PackageCheck className="w-4 h-4" /> : <PackageX className="w-4 h-4" />}
                  {product.isOutOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}
                </button>
                <button onClick={() => handleRemoveProduct(product.id!)} className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-xl font-medium transition-colors w-full">
                  <Trash2 className="w-4 h-4" />
                  Remove Product
                </button>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && <p className="text-muted-foreground">No products listed yet.</p>}
      </div>
    </div>
  )
}
