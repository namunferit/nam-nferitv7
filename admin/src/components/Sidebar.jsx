import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  LayoutDashboard,
  FileText,
  Video,
  FolderOpen,
  Palette,
  Image,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { to: '/admin/articles', label: 'Yazılar', icon: <FileText className="w-5 h-5" /> },
    { to: '/admin/videos', label: 'Videolar', icon: <Video className="w-5 h-5" /> },
    { to: '/admin/categories', label: 'Kategoriler', icon: <FolderOpen className="w-5 h-5" /> },
    { to: '/admin/design', label: 'Tasarım Ayarları', icon: <Palette className="w-5 h-5" /> },
    { to: '/admin/media', label: 'Medya Kütüphanesi', icon: <Image className="w-5 h-5" /> }
  ];

  return (
    <aside className="w-64 bg-[#141414] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 text-[#f5f0eb] z-20 shrink-0">
      {/* Brand logo / title */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#cb113a] flex items-center justify-center font-bold text-lg text-white">N</div>
        <div>
          <h1 className="font-bold tracking-wide text-sm font-serif">NÂMÜNFERİT</h1>
          <p className="text-[10px] text-zinc-500 uppercase font-sans tracking-widest font-semibold">CMS Panel</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#cb113a] text-white shadow-lg shadow-[#cb113a]/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/5 bg-black/10">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs text-zinc-500">Editör</p>
            <p className="text-sm font-medium truncate">{user?.username || 'admin'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
            title="Çıkış Yap"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
