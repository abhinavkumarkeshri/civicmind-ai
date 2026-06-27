import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OfficerNav } from '@/components/shared/OfficerNav'

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'officer') redirect('/citizen/dashboard')

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <OfficerNav profile={profile} unreadCount={count ?? 0} />
      <main className="pt-14 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
