import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { FileText, Video, FolderOpen, Plus, ExternalLink, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ articles: 0, videos: 0, categories: 0 });
  const [recentArticles, setRecentArticles] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [articles, videos, categories] = await Promise.all([
          api.getArticles(),
          api.getVideos(),
          api.getCategories()
        ]);
        
        setStats({
          articles: articles.length,
          videos: videos.length,
          categories: categories.length
        });

        // Filter and sort recent
        const activeArticles = articles.filter(a => !a.deletedAt);
        activeArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentArticles(activeArticles.slice(0, 5));

        const activeVideos = videos.filter(v => !v.deletedAt);
        activeVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentVideos(activeVideos.slice(0, 5));

      } catch (err) {
        console.error('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#cb113a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Toplam Yazı', count: stats.articles, icon: <FileText className="w-5 h-5 text-indigo-400" />, bg: 'from-indigo-500/10 to-indigo-500/0 border-indigo-500/15' },
    { title: 'Toplam Video', count: stats.videos, icon: <Video className="w-5 h-5 text-emerald-400" />, bg: 'from-emerald-500/10 to-emerald-500/0 border-emerald-500/15' },
    { title: 'Kategoriler', count: stats.categories, icon: <FolderOpen className="w-5 h-5 text-amber-400" />, bg: 'from-amber-500/10 to-amber-500/0 border-amber-500/15' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif">Genel Bakış</h2>
          <p className="text-sm text-zinc-400">Nâmünferit içerik yönetim sistemine hoş geldiniz.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/articles/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#cb113a] hover:bg-[#e61442] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#cb113a]/10 transition"
          >
            <Plus className="w-4 h-4" /> Yeni Yazı
          </Link>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 rounded-lg transition"
          >
            Siteyi Gör <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.bg} border rounded-xl p-6 flex items-center justify-between shadow-lg`}>
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
              <h3 className="text-3xl font-bold mt-1">{card.count}</h3>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-wider uppercase text-zinc-400">Son Yazılar</h3>
            <Link to="/admin/articles" className="text-xs text-[#cb113a] hover:underline flex items-center gap-0.5 font-semibold">Tümü <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentArticles.length === 0 ? (
              <p className="py-4 text-sm text-zinc-500 text-center">Henüz yazı bulunmuyor.</p>
            ) : (
              recentArticles.map((art) => (
                <div key={art.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="truncate">
                    <p className="text-sm font-medium truncate text-[#f5f0eb]">{art.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{art.author} · {art.readTime} dk okuma</p>
                  </div>
                  <Link to={`/admin/articles/edit/${art.id}`} className="text-xs px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded border border-white/10 transition">Düzenle</Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-wider uppercase text-zinc-400">Son Videolar</h3>
            <Link to="/admin/videos" className="text-xs text-[#cb113a] hover:underline flex items-center gap-0.5 font-semibold">Tümü <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentVideos.length === 0 ? (
              <p className="py-4 text-sm text-zinc-500 text-center">Henüz video bulunmuyor.</p>
            ) : (
              recentVideos.map((vid) => (
                <div key={vid.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="truncate">
                    <p className="text-sm font-medium truncate text-[#f5f0eb]">{vid.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{vid.duration}</p>
                  </div>
                  <Link to="/admin/videos" className="text-xs px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded border border-white/10 transition">Yönet</Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
