'use client'

import { useRouter } from 'next/navigation'
import AdminNav from '@/components/shared/AdminNav'
import { Settings, LogOut, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleLogout() {
    setLogoutLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('[v0] Logout error:', error)
      setLogoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <AdminNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Settings className="w-8 h-8 text-blue-400" />
            </div>
            Admin Settings
          </h1>
          <p className="text-slate-400">Manage your admin account and system settings</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/5 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-300">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Security */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Account Security
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">Password Management</p>
                <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-700/50">
                  Change Password
                </button>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Two-Factor Authentication</p>
                <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-700/50">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">System Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email Allowlist</label>
                <p className="text-sm text-slate-400 mb-3">
                  Currently configured in environment variables. Update ADMIN_EMAILS to add or remove authorized administrators.
                </p>
                <code className="block px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs overflow-x-auto">
                  ADMIN_EMAILS=email1@example.com,email2@example.com
                </code>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 accent-blue-500" />
                <span className="text-slate-300 text-sm">Email on new officer signups</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 accent-blue-500" />
                <span className="text-slate-300 text-sm">Email on critical complaints</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 accent-blue-500" />
                <span className="text-slate-300 text-sm">Daily summary report</span>
              </label>
            </div>
          </div>

          {/* Session Management */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Session Management</h2>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Manage your login sessions and active devices</p>
              <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-700/50">
                View Active Sessions
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-3">
                  <strong>Logout:</strong> End your current admin session and return to login page
                </p>
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {logoutLoading ? 'Logging out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <p className="text-xs text-slate-500">
            <strong>System Info:</strong> CivicMind AI v1.0 | Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  )
}
