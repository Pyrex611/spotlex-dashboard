"use client"

import './globals.css';
import { useState } from 'react';
import { Menu, Home, Wrench, History, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  return (
    <html lang="en">
      <head>
        <title>Spotlex World - Enterprise</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-[100dvh] flex flex-col md:flex-row antialiased">
        {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-[40] md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-[50] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src="/spotlex_logo.jpg" alt="Logo" className="w-8 h-8 rounded object-cover" />
              <h2 className="font-bold text-slate-800">Spotlex World</h2>
            </div>
            <button type="button" className="md:hidden" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
          </div>
          <nav className="p-4 space-y-1">
            <Link href="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium ${isActive('/') && pathname === '/' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => setSidebarOpen(false)}>
              <Home size={18} /> Projects
            </Link>
            <Link href="/equipments" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium ${isActive('/equipments') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => setSidebarOpen(false)}>
              <Wrench size={18} /> Equipments
            </Link>
            <Link href="/history" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium ${isActive('/history') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => setSidebarOpen(false)}>
              <History size={18} /> History
            </Link>
          </nav>
        </aside>
        <main className="flex-1 flex flex-col min-h-[100dvh]">
          <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 h-16 px-4 md:px-8 flex items-center border-b border-slate-200">
            <button type="button" className="md:hidden mr-4 p-2" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
          </header>
          <div className="p-4 md:p-8 pb-32 md:pb-8 w-full max-w-7xl mx-auto flex-1 relative z-10">{children}</div>
        </main>
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-6 z-40 shadow-lg">
          <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') && pathname === '/' ? 'text-emerald-600' : 'text-slate-500'}`}><Home size={20} /><span className="text-[10px]">Home</span></Link>
          <Link href="/equipments" className={`flex flex-col items-center gap-1 ${isActive('/equipments') ? 'text-emerald-600' : 'text-slate-500'}`}><Wrench size={20} /><span className="text-[10px]">Registry</span></Link>
          <Link href="/history" className={`flex flex-col items-center gap-1 ${isActive('/history') ? 'text-emerald-600' : 'text-slate-500'}`}><History size={20} /><span className="text-[10px]">History</span></Link>
        </div>
      </body>
    </html>
  );
}