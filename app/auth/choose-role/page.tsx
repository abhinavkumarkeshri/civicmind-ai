'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Users } from 'lucide-react'

export default function ChooseRolePage() {
  return (
    <main className="min-h-screen bg-[#0a0d14] text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Choose Your Role</h1>
          <p className="text-slate-400 text-sm">Select your role to continue</p>
        </div>

        {/* Role Options */}
        <div className="space-y-4">
          {/* Officer */}
          <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-6 hover:border-amber-500/50 hover:bg-[#131e30] transition-all cursor-pointer group">
            <Link href="/officer/login">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-100 mb-1">Officer Login</h2>
                  <p className="text-sm text-slate-400">Municipal officer account</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Access your complaint queue, assign work orders, and track resolutions
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Officer Registration */}
          <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-6 hover:border-amber-500/50 hover:bg-[#131e30] transition-all cursor-pointer group">
            <Link href="/officer/register">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-100 mb-1">Register as Officer</h2>
                  <p className="text-sm text-slate-400">Create a new officer account</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Apply as a municipal officer (pending admin approval)
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Admin */}
          <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-6 hover:border-red-500/50 hover:bg-[#131e30] transition-all cursor-pointer group">
            <Link href="/admin/login">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <Lock className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-100 mb-1">Admin Login</h2>
                  <p className="text-sm text-slate-400">System administrator account</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Manage officers, review complaints, and configure system settings
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Citizen Link */}
        <div className="mt-8 pt-8 border-t border-[#1f2d45]">
          <p className="text-sm text-slate-400 mb-3">Are you a citizen?</p>
          <Link
            href="/citizen/register"
            className="block w-full text-center px-4 py-3 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-300 font-medium text-sm transition-colors"
          >
            Report a Civic Issue
          </Link>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-[#1f2d45]">
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Admin accounts</span> are restricted to authorized personnel only. Contact system administrator for access.
          </p>
        </div>
      </div>
    </main>
  )
}
