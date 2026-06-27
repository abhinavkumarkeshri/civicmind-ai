import Link from 'next/link'
import { MapPin, Brain, Shield, Clock, CheckCircle2, ArrowRight, Zap, Users, TrendingUp } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    desc: 'Upload a photo — Gemini Vision identifies the issue, assigns severity, and routes it to the right department in seconds.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: MapPin,
    title: 'Live Location Tracking',
    desc: 'Auto-detects your location, reverse-geocodes the address, and detects duplicate nearby reports.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Shield,
    title: 'Officer Dashboard',
    desc: 'Municipal officers get AI-prioritised queues, repair cost estimates, and step-by-step action plans.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Users,
    title: 'Community Verification',
    desc: 'Citizens upvote and confirm issues. Higher engagement boosts severity scores automatically.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
]

const STATS = [
  { value: '94%', label: 'AI Accuracy', icon: Zap },
  { value: '3.2h', label: 'Avg Response', icon: Clock },
  { value: '12K+', label: 'Issues Resolved', icon: CheckCircle2 },
  { value: '∞ Cities', label: 'Pan-India Ready', icon: TrendingUp },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0d14] text-slate-100">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1f2d45] max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-100">CivicMind AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/choose-role"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
          <Zap className="w-3 h-3" />
          Powered by Gemini AI
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-100 leading-tight mb-6 text-balance">
          Report civic issues.<br />
          <span className="text-blue-400">AI handles the rest.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Snap a photo of a pothole, broken streetlight, or overflowing garbage. CivicMind AI
          instantly analyses it, assigns severity, finds duplicates, and routes it to the right
          department — all in under 10 seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/citizen/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
          >
            Start Reporting Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/choose-role"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#1f2d45] hover:bg-[#111827] text-slate-300 font-medium text-sm transition-colors"
          >
            Officer/Admin Login
            <Shield className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-[#1f2d45] bg-[#111827] p-5 text-center"
            >
              <div className="flex justify-center mb-2">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-100 text-center mb-10 text-balance">
          Everything you need to fix your city
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="rounded-xl border border-[#1f2d45] bg-[#111827] p-6"
            >
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-4 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-10">
          <h2 className="text-2xl font-bold text-slate-100 mb-3 text-balance">
            Ready to make a difference?
          </h2>
          <p className="text-slate-400 mb-8">
            Join citizens across India reporting and tracking civic issues with AI.
          </p>
          <Link
            href="/citizen/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1f2d45] px-6 py-6 text-center text-xs text-slate-600 max-w-7xl mx-auto">
        CivicMind AI &mdash; Powered by Gemini &amp; Supabase
      </footer>
    </main>
  )
}
