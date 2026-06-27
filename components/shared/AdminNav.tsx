'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, LayoutDashboard, Users, FileText, Settings, LogOut, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/officers', icon: Users, label: 'Officers' },
    { href: '/admin/complaints', icon: FileText, label: 'Complaints' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">CivicMind Admin</div>
              <div className="text-xs text-slate-400">System Administration</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                  pathname === item.href
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-semibold text-amber-400">
                A
              </div>
              <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', menuOpen && 'rotate-180')} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-700/50 bg-slate-900 shadow-xl z-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                pathname === item.href
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50',
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
