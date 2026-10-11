import { redirect } from 'next/navigation'
import { getAdmin } from '@/lib/admin'
import { Dashboard } from '@/components/admin/Dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Real check (the proxy only looks for the cookie): verifies the session in Postgres
  const admin = await getAdmin()
  if (!admin) redirect('/admin/login')
  return <Dashboard me={admin} />
}
