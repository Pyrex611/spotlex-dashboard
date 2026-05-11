import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, LogIn } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="animate-in flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative">
      
      {/* Quick Access Sign In Link */}
      <div className="absolute top-0 right-0 p-4">
        <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
          <LogIn size={16} /> Sign In
        </Link>
      </div>

      <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase">
        Enterprise Solutions
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
        Spotlex World <br /> 
        <span className="text-emerald-600 border-b-4 border-emerald-100">Environmental Systems</span>
      </h1>
      <p className="max-w-2xl text-slate-500 text-lg md:text-xl mb-10 leading-relaxed">
        High-end deployment management for complex environmental projects. Reliable, secure, and optimized for professional teams.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link href="/signup" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
          Get Started <ArrowRight size={20} />
        </Link>
        <button className="bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
          View Solutions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4"><Shield className="text-emerald-600" size={20}/></div>
          <h3 className="font-bold text-slate-800 mb-2">Secure Cloud</h3>
          <p className="text-sm text-slate-500">Enterprise-grade security powered by Supabase architecture.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4"><Zap className="text-emerald-600" size={20}/></div>
          <h3 className="font-bold text-slate-800 mb-2">Real-time Data</h3>
          <p className="text-sm text-slate-500">Instant updates across all devices for equipment and staff tracking.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4"><Globe className="text-emerald-600" size={20}/></div>
          <h3 className="font-bold text-slate-800 mb-2">Global Access</h3>
          <p className="text-sm text-slate-500">Optimized mobile interface for managing deployments in the field.</p>
        </div>
      </div>
    </div>
  );
}