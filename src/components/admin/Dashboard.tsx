'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Edit2, ImagePlus, KeyRound, Loader2, LogOut, ToggleLeft, ToggleRight, Trash2, UserMinus, X } from 'lucide-react'
import { getProducts } from '@/lib/products'
import { authClient } from '@/lib/auth-client'
import type { Product } from '@/store/useCartStore'
import type { AdminUser } from '@/lib/admin'
import {
  saveProduct,
  deleteProduct,
  setOutOfStock,
  listAdmins,
  createAdmin,
  removeAdmin,
  changeMyPassword,
  type AdminAccount,
} from '@/app/admin/actions'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif'

export function Dashboard({ me }: { me: AdminUser }) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Product form
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [isOutOfStock, setIsOutOfStock] = useState(false)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Admin + password forms
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [nextPw, setNextPw] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : existingImage), [imageFile, existingImage])
  useEffect(
    () => () => {
      if (imageFile && previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [imageFile, previewUrl]
  )

  const loadProducts = useCallback(async () => setProducts(await getProducts({ fresh: true })), [])
  const loadAdmins = useCallback(async () => {
    const res = await listAdmins()
    if (res.ok) setAdmins(res.data ?? [])
  }, [])

  useEffect(() => {
    getProducts({ fresh: true }).then((p) => {
      setProducts(p)
      setLoaded(true)
    })
    listAdmins().then((res) => res.ok && setAdmins(res.data ?? []))
  }, [])

  /** Shows the error; if the session is gone, sends the admin back to sign in. */
  const fail = (error: string) => {
    toast.error(error)
    if (error.startsWith('Your session has ended')) router.replace('/admin/login')
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  const cancelEdit = () => {
    setEditingProductId(null)
    setName('')
    setPrice('')
    setDescription('')
    setIsOutOfStock(false)
    setEditingSlug(null)
    setImageFile(null)
    setExistingImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startEdit = (product: Product) => {
    setEditingProductId(product.id)
    setName(product.name)
    setPrice(String(product.price))
    setDescription(product.description || '')
    setIsOutOfStock(Boolean(product.isOutOfStock))
    setEditingSlug(product.slug || null)
    setExistingImage(product.image || null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price) return toast.error('Add a name and a price.')
    if (!editingProductId && !imageFile) return toast.error('Add a photo.')

    const form = new FormData()
    if (editingProductId) form.set('id', editingProductId)
    form.set('name', name)
    form.set('price', price)
    form.set('description', description)
    form.set('isOutOfStock', String(isOutOfStock))
    if (imageFile) form.set('image', imageFile)

    setSavingProduct(true)
    const res = await saveProduct(form).catch(() => ({ ok: false as const, error: 'Upload failed. Check your connection.' }))
    setSavingProduct(false)
    if (!res.ok) return fail(res.error)
    toast(editingProductId ? 'Product updated' : 'Product published')
    cancelEdit()
    loadProducts()
  }

  // Two taps to delete: the first arms the button for a few seconds
  const handleRemoveProduct = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 3000)
      return
    }
    setConfirmDelete(null)
    const res = await deleteProduct(id)
    if (!res.ok) return fail(res.error)
    toast('Product removed')
    if (editingProductId === id) cancelEdit()
    loadProducts()
  }

  const handleToggleStock = async (product: Product) => {
    const nextState = !product.isOutOfStock

    // 1. Instant optimistic update: 0ms delay in UI!
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isOutOfStock: nextState } : p))
    )
    toast(nextState ? `${product.name} marked sold out` : `${product.name} marked in stock`, {
      duration: 2000,
    })

    // 2. Background server update
    try {
      const res = await setOutOfStock(product.id, nextState)
      if (!res.ok) {
        // Revert on error
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isOutOfStock: product.isOutOfStock } : p))
        )
        fail(res.error)
      }
    } catch {
      // Revert on network exception
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isOutOfStock: product.isOutOfStock } : p))
      )
      toast.error('Could not update stock status. Check your connection.')
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingAdmin(true)
    const res = await createAdmin({ name: adminName, email: adminEmail, password: adminPassword })
    setAddingAdmin(false)
    if (!res.ok) return fail(res.error)
    toast('Admin added', { description: `${adminEmail.trim().toLowerCase()} can now sign in at /admin.` })
    setAdminName('')
    setAdminEmail('')
    setAdminPassword('')
    loadAdmins()
  }

  const handleRemoveAdmin = async (admin: AdminAccount) => {
    const res = await removeAdmin(admin.id)
    if (!res.ok) return fail(res.error)
    toast('Admin removed', { description: admin.email })
    loadAdmins()
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPw(true)
    const res = await changeMyPassword({ current: currentPw, next: nextPw })
    setChangingPw(false)
    if (!res.ok) return fail(res.error)
    toast('Password changed', { description: 'Other devices have been signed out.' })
    setCurrentPw('')
    setNextPw('')
  }

  const inStock = products.filter((p) => !p.isOutOfStock).length

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-28 sm:px-6 sm:pt-36">
      <div className="enter flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-primary">Dashboard</p>
          <h1 className="mt-2 text-[clamp(34px,5vw,60px)] font-semibold leading-[1] tracking-[-0.045em]">
            Hi, {me.name.split(' ')[0] || 'there'}.
          </h1>
          <button
            onClick={handleSignOut}
            className="press mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full py-1 text-[13.5px] text-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Sign out · {me.email}</span>
          </button>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:gap-3">
          <Stat label="Products" value={loaded ? products.length : null} />
          <Stat label="In stock" value={loaded ? inStock : null} />
          <Stat label="Sold out" value={loaded ? products.length - inStock : null} />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 lg:mt-12 lg:grid-cols-[1.5fr_1fr] lg:gap-6">
        {/* ADD / EDIT PRODUCT */}
        <section className="enter glass rounded-[28px] p-5 sm:p-7" style={{ animationDelay: '60ms' }}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.025em]">
                {editingProductId ? 'Edit product' : 'Add a product'}
              </h2>
              <p className="mt-0.5 text-[13px] text-muted">
                {editingProductId ? 'Update name, price, stock availability, description, and photo.' : 'Create and publish a new item to your store catalog.'}
              </p>
            </div>
            {editingProductId && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[12px] font-semibold text-amber-700 dark:text-amber-300">
                  Editing
                </span>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="press rounded-full p-1 text-muted hover:bg-surface-2 hover:text-foreground"
                  title="Cancel editing"
                  aria-label="Cancel editing"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProduct} className="mt-5 grid gap-6 sm:grid-cols-[190px_1fr]">
            {/* PHOTO UPLOAD */}
            <div className="flex flex-col gap-2">
              <span className="text-[12.5px] font-semibold text-foreground/85">
                Product photo {!editingProductId && <span className="text-red-500">*</span>}
              </span>
              <label className="group relative mx-auto flex aspect-square w-full max-w-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[22px] border border-dashed border-line-strong bg-surface-2 text-center transition-colors hover:border-primary sm:max-w-none">
                {previewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview, nothing to optimize */}
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute inset-0 grid place-items-center bg-black/55 text-[12.5px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Change photo
                    </span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-7 w-7 text-muted" strokeWidth={1.5} />
                    <span className="mt-2 px-3 text-[12.5px] font-medium text-muted">Click to upload photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept={ACCEPT}
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    if (file && file.size > 8 * 1024 * 1024) {
                      toast.error('That photo is over 8MB. Please pick a smaller one.')
                      e.target.value = ''
                      return
                    }
                    setImageFile(file)
                  }}
                  className="sr-only"
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setImageFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="press absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                    aria-label="Remove uploaded image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>
              <p className="text-center text-[11px] text-muted">JPG, PNG, WebP · Max 8MB</p>
              {editingSlug && (
                <div className="rounded-xl bg-surface-2 p-2 text-center text-[11px] text-muted">
                  <span className="truncate block font-mono text-[10.5px] text-foreground/75">/{editingSlug}</span>
                </div>
              )}
            </div>

            {/* PRODUCT FIELDS */}
            <div className="flex flex-col gap-4">
              {/* PRODUCT NAME */}
              <div>
                <label htmlFor="product-name" className="mb-1.5 flex items-center justify-between text-[12.5px] font-semibold text-foreground/85">
                  <span>Product Name <span className="text-red-500">*</span></span>
                  <span className="text-[11px] font-normal text-muted">{name.length}/120</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pure Wild Honey (250g)"
                  aria-label="Product name"
                  className="field"
                />
              </div>

              {/* PRICE (₹ INR) */}
              <div>
                <label htmlFor="product-price" className="mb-1.5 flex items-center justify-between text-[12.5px] font-semibold text-foreground/85">
                  <span>Price (₹ INR) <span className="text-red-500">*</span></span>
                  <span className="text-[11.5px] font-normal text-muted">Indian Rupees</span>
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3.5 text-[16px] font-bold text-primary">₹</span>
                  <input
                    id="product-price"
                    type="number"
                    required
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price in ₹ (e.g. 75)"
                    aria-label="Product price in Rupees"
                    className="field pl-9 text-[15px] font-semibold tabular-nums"
                  />
                  {price && Number(price) > 0 ? (
                    <span className="pointer-events-none absolute right-3 rounded-md bg-surface px-2 py-0.5 text-[12px] font-medium text-muted">
                      ₹{Number(price).toLocaleString('en-IN')}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[11.5px] text-muted">Customer checkout and catalog display price in Rupees.</p>
              </div>

              {/* STOCK AVAILABILITY */}
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-foreground/85">
                  Stock Availability <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsOutOfStock(false)}
                    className={`press flex items-center justify-center gap-2 rounded-xl border p-2.5 text-[13px] transition-all ${
                      !isOutOfStock
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm ring-1 ring-emerald-500/30'
                        : 'border-line bg-surface-2 text-muted hover:text-foreground'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    In stock (ready to order)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOutOfStock(true)}
                    className={`press flex items-center justify-center gap-2 rounded-xl border p-2.5 text-[13px] transition-all ${
                      isOutOfStock
                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold shadow-sm ring-1 ring-amber-500/30'
                        : 'border-line bg-surface-2 text-muted hover:text-foreground'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    Sold out / Unavailable
                  </button>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label htmlFor="product-desc" className="mb-1.5 flex items-center justify-between text-[12.5px] font-semibold text-foreground/85">
                  <span>Description</span>
                  <span className="text-[11px] font-normal text-muted">{description.length}/2000</span>
                </label>
                <textarea
                  id="product-desc"
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pure and naturally sourced ingredients, usage instructions, benefits..."
                  aria-label="Product description"
                  className="field min-h-[96px] resize-none leading-relaxed"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-1 flex gap-2.5">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="press btn-primary h-11 flex-1 text-[15px] font-semibold disabled:opacity-60 shadow-sm"
                >
                  {savingProduct ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingProductId ? (
                    'Save changes'
                  ) : (
                    'Publish product'
                  )}
                </button>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="press btn-secondary h-11 px-5 text-[15px] font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* ADMINS */}
        <section className="enter glass h-fit rounded-[28px] p-5 sm:p-7" style={{ animationDelay: '120ms' }}>
          <h2 className="text-[20px] font-semibold tracking-[-0.025em]">Admins</h2>
          <p className="mt-1 text-[14px] text-muted">Each signs in at /admin with their own email and password.</p>

          <ul className="mt-5 divide-y divide-line">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tint text-[13px] font-semibold text-tint-foreground">
                  {(a.name || a.email).charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-medium">
                    {a.name || a.email}
                    {a.id === me.id && <span className="ml-1.5 text-[12px] font-normal text-subtle">you</span>}
                  </div>
                  <div className="truncate text-[12.5px] text-muted">{a.email}</div>
                </div>
                {a.id !== me.id && (
                  <AdminAction label={`Remove ${a.email}`} danger onClick={() => handleRemoveAdmin(a)}>
                    <UserMinus className="h-4 w-4" strokeWidth={1.75} />
                  </AdminAction>
                )}
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddAdmin} className="mt-4 flex flex-col gap-3 border-t border-line pt-5">
            <input type="text" required maxLength={80} value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Name" aria-label="New admin name" className="field" />
            <input type="email" required maxLength={254} value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Email" aria-label="New admin email" autoComplete="off" className="field" />
            <input type="password" required minLength={12} maxLength={128} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Password (12+ characters)" aria-label="New admin password" autoComplete="new-password" className="field" />
            <button type="submit" disabled={addingAdmin} className="press btn-secondary mt-1 h-11 text-[15px] disabled:opacity-60">
              {addingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add admin'}
            </button>
          </form>

          <form onSubmit={handleChangePassword} className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.015em]">
              <KeyRound className="h-4 w-4 text-muted" strokeWidth={1.75} /> Change your password
            </h3>
            <input type="password" required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" aria-label="Current password" autoComplete="current-password" className="field" />
            <input type="password" required minLength={12} maxLength={128} value={nextPw} onChange={(e) => setNextPw(e.target.value)} placeholder="New password (12+ characters)" aria-label="New password" autoComplete="new-password" className="field" />
            <button type="submit" disabled={changingPw} className="press btn-secondary mt-1 h-11 text-[15px] disabled:opacity-60">
              {changingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
            </button>
          </form>
        </section>
      </div>

      {/* MANAGE PRODUCTS */}
      <section className="mt-14 sm:mt-16">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em]">On the shelf</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {products.map((product) => (
            <li key={product.id} className="flex items-center gap-3 py-4 sm:gap-4">
              {product.image ? (
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl sm:h-16 sm:w-16">
                  <Image src={product.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
              ) : (
                <span className="h-14 w-14 shrink-0 rounded-2xl bg-surface-2 sm:h-16 sm:w-16" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15.5px] font-semibold tracking-[-0.015em]">{product.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[13.5px] text-muted">
                  <span className="tabular-nums">₹{product.price}</span>
                  <span className="text-line-strong">·</span>
                  <button
                    type="button"
                    onClick={() => handleToggleStock(product)}
                    title={product.isOutOfStock ? 'Click to mark in stock' : 'Click to mark sold out'}
                    className={`press inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium transition-colors ${
                      product.isOutOfStock
                        ? 'bg-danger/10 text-danger hover:bg-danger/20 ring-1 ring-danger/25'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/25'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${product.isOutOfStock ? 'bg-danger' : 'bg-primary animate-pulse'}`} />
                    {product.isOutOfStock ? 'Sold out' : 'In stock'}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <AdminAction label="Edit" onClick={() => startEdit(product)}>
                  <Edit2 className="h-4 w-4" strokeWidth={1.75} />
                </AdminAction>
                <button
                  type="button"
                  onClick={() => handleToggleStock(product)}
                  title={product.isOutOfStock ? 'Currently Sold out. Click to mark In stock' : 'Currently In stock. Click to mark Sold out'}
                  aria-label={product.isOutOfStock ? 'Mark in stock' : 'Mark sold out'}
                  className={`press flex items-center gap-1.5 h-9 px-3 rounded-full border text-[12px] font-medium transition-all ${
                    product.isOutOfStock
                      ? 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20'
                      : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {product.isOutOfStock ? (
                    <>
                      <ToggleLeft className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                      <span className="hidden sm:inline">Sold out</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                      <span className="hidden sm:inline">In stock</span>
                    </>
                  )}
                </button>
                {confirmDelete === product.id ? (
                  <button onClick={() => handleRemoveProduct(product.id)} className="press h-9 rounded-full bg-danger px-3 text-[13px] font-medium text-white">
                    Delete?
                  </button>
                ) : (
                  <AdminAction label="Remove" danger onClick={() => handleRemoveProduct(product.id)}>
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </AdminAction>
                )}
              </div>
            </li>
          ))}
        </ul>
        {loaded && products.length === 0 && <p className="mt-6 text-muted">Nothing listed yet. Add your first product above.</p>}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="glass rounded-2xl px-4 py-3 sm:min-w-[96px]">
      <div className="text-[22px] font-semibold tabular-nums tracking-[-0.03em] sm:text-[24px]">{value ?? '–'}</div>
      <div className="text-[12.5px] text-muted">{label}</div>
    </div>
  )
}

function AdminAction({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`press grid h-9 w-9 place-items-center rounded-full ${danger ? 'text-danger hover:bg-danger/10' : 'text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground'}`}
    >
      {children}
    </button>
  )
}
