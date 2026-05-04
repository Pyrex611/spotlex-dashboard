"use client"

import './globals.css';
import { useState } from 'react';
import { Menu, Home, Wrench, History, X } from 'lucide-react';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const[sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>Spotlex World Environmental Solutions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/spotlex_logo.jpg" />
      </head>
      <body className="bg-[#f0fdf4] text-[#022c22] font-sans min-h-screen flex flex-col md:flex-row antialiased">
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-[#022c22]/60 z-[60] md:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar Navigation */}
        <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#064e3b] text-white transform transition-transform duration-300 ease-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
          <div className="p-6 flex justify-between items-center bg-[#022c22] border-b border-[#065f46]">
            <div className="flex items-center gap-3">
              <img src="/spotlex_logo.jpg" alt="Logo" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md" />
              <h2 className="text-lg font-black tracking-widest uppercase">Spotlex</h2>
            </div>
            <button type="button" className="md:hidden p-2 text-[#a7f3d0] hover:text-white transition-colors bg-white/10 rounded-xl" onClick={() => setSidebarOpen(false)}>
              <X size={24}/>
            </button>
          </div>
          <nav className="p-5 space-y-2 mt-4">
            <div className="text-[10px] font-black text-[#6ee7b7] mb-4 uppercase tracking-widest pl-4 opacity-80">Dashboard</div>
            <Link href="/" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-[#047857] transition-all font-bold text-[#ecfdf5] active:scale-95" onClick={() => setSidebarOpen(false)}>
              <Home size={22} className="text-[#34d399]" /> Projects
            </Link>
            <Link href="/equipments" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-[#047857] transition-all font-bold text-[#ecfdf5] active:scale-95" onClick={() => setSidebarOpen(false)}>
              <Wrench size={22} className="text-[#34d399]" /> Equipments
            </Link>
            
            <div className="text-[10px] font-black text-[#6ee7b7] mb-4 uppercase tracking-widest pl-4 opacity-80 mt-10">Records</div>
            <Link href="/history" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-[#047857] transition-all font-bold text-[#ecfdf5] active:scale-95" onClick={() => setSidebarOpen(false)}>
              <History size={22} className="text-[#34d399]" /> History
            </Link>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar relative">
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm px-4 md:px-10 py-4 md:py-5 flex items-center border-b border-green-100">
            <button type="button" className="md:hidden mr-4 text-green-900 bg-green-100/80 p-2.5 rounded-xl hover:bg-green-200 transition-colors pointer-events-auto active:scale-95" onClick={() => setSidebarOpen(true)}>
              <Menu size={26} />
            </button>
            <div className="flex items-center gap-4">
              <div className="hidden md:block w-10 h-10 rounded-full bg-green-100 overflow-hidden border-2 border-green-600 shadow-sm">
                <img src="/spotlex_logo.jpg" alt="Spotlex Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-green-950 tracking-wide">Spotlex World</h1>
            </div>
          </header>
          
          {/* Add generous pb-28 on mobile to account for the bottom tab bar */}
          <div className="p-4 md:p-10 pb-28 md:pb-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Footer Menu */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#064e3b] text-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex justify-around p-2 pb-6 z-50 border-t border-[#047857]">
          <Link href="/" className="flex flex-1 flex-col items-center justify-center gap-1.5 py-3 hover:text-[#a7f3d0] transition-colors rounded-xl active:bg-[#047857]">
            <Home size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/equipments" className="flex flex-1 flex-col items-center justify-center gap-1.5 py-3 hover:text-[#a7f3d0] transition-colors rounded-xl active:bg-[#047857]">
            <Wrench size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Equipments</span>
          </Link>
          <Link href="/history" className="flex flex-1 flex-col items-center justify-center gap-1.5 py-3 hover:text-[#a7f3d0] transition-colors rounded-xl active:bg-[#047857]">
            <History size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">History</span>
          </Link>
        </div>
      </body>
    </html>
  );
}