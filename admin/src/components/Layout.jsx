import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function Layout() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] text-[#f5f0eb]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#cb113a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0eb] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative animate-slide-in-left">
            <Sidebar />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-[-48px] p-2 bg-[#141414] border border-white/5 text-white rounded-r-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-[#141414] border-b border-white/5 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#cb113a] flex items-center justify-center font-bold text-white">N</div>
            <span className="font-bold tracking-wide font-serif text-sm">NÂMÜNFERİT</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
