'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, MapPin, List, PlusCircle, Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'
import { getInitials } from '@/lib/utils/formatters'

const NAV_ITEMS = [
  { href: '/citizen/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/citizen/report',    icon: PlusCircle,       label: 'Report' },
  { href: '/citizen/complaints', icon: List,            label: 'Complaints' },
  { href: '/citizen/map',       icon: MapPin,           label: 'Map' },
]

interface CitizenNavProps {
  profile: Profile | null
  unreadCount?: number
}

export function CitizenNav({ profile, unreadCount = 0 }: CitizenNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/auth/login')
  }

  return (
    <>
      {/* Top bar — desktop */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-14 items-center justify-between px-6 bg-[#0d1526] border-b border-[#1f2d45]">
        <Link href="/citizen/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-100 text-sm">CivicMind AI</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2235]',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1a2235] transition-colors"
            aria-label={`${unreadCount} unread notifications`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 pl-3 border-l border-[#1f2d45] hover:opacity-80 transition-opacity"
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-semibold text-blue-400">
                {getInitials(profile?.full_name)}
              </div>
              <span className="text-sm text-slate-300 hidden xl:block">
                {profile?.full_name ?? 'Citizen'}
              </span>
              <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', menuOpen && 'rotate-180')} />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                
                {/* Menu Items */}
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[#1f2d45] bg-[#111827] shadow-xl z-50">
                  <div className="px-3 py-3 border-b border-[#1f2d45]">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Account</p>
                    <p className="text-sm font-medium text-slate-200 mt-1">{profile?.full_name ?? 'Citizen'}</p>
                    <p className="text-xs text-slate-400 mt-1">{profile?.role ?? 'citizen'}</p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-[#1a2235] transition-colors border-t border-[#1f2d45]"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Bottom tab bar — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-[#0d1526] border-t border-[#1f2d45] px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]',
                active ? 'text-blue-400' : 'text-slate-500',
              )}
            >
              <Icon className={cn('w-5 h-5', href === '/citizen/report' && 'w-6 h-6')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-slate-500 min-w-[56px]"
          aria-label="Account menu"
          aria-expanded={menuOpen}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Account</span>
        </button>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-2 bottom-20 w-48 rounded-lg border border-[#1f2d45] bg-[#111827] shadow-xl z-50">
              <div className="px-3 py-3 border-b border-[#1f2d45]">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Account</p>
                <p className="text-sm font-medium text-slate-200 mt-1">{profile?.full_name ?? 'Citizen'}</p>
                <p className="text-xs text-slate-400 mt-1">{profile?.role ?? 'citizen'}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-[#1a2235] transition-colors border-t border-[#1f2d45]"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </nav>
    </>
  )
}
