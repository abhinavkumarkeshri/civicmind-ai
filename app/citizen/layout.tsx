import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CitizenNav } from '@/components/shared/CitizenNav'
import { ServiceWorkerRegistrar } from '@/components/shared/ServiceWorkerRegistrar'
import { OfflineBanner } from '@/components/shared/OfflineBanner'

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get unread notification count
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <ServiceWorkerRegistrar />
      <CitizenNav profile={profile} unreadCount={count ?? 0} />
      <OfflineBanner />
      <main className="lg:pt-14 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
