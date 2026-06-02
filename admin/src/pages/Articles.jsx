import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { FileText, Plus, Trash2, RotateCcw, Search, Star, Filter } from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    loadData();
  }, [showTrash]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [artList, catList] = await Promise.all([
        api.getArticles(showTrash),
        api.getCategories()
      ]);
      setArticles(artList);
      setCategories(catList.filter(c => c.type === 'article'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleDeleteClick = (id, title) => {
    setConfirmModal({
      id,
      title: 'Yazıyı Sil',
      message: `"${title}" başlıklı yazıyı çöp kutusuna taşımak istediğinizden emin misiniz?`,
      onConfirm: () => deleteArticle(id)
    });
  };

  const deleteArticle = async (id) => {
    try {
      await api.deleteArticle(id);
      showToast('Yazı çöp kutusuna taşındı.');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.restoreArticle(id);
      showToast('Yazı geri yüklendi.');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      await api.updateArticle(id, { featured: !currentFeatured });
      showToast(!currentFeatured ? 'Yazı öne çıkarıldı.' : 'Öne çıkarma kaldırıldı.');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filter articles by search query & category
  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) || 
                          art.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === '' || art.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (catId) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.name : 'Belirtilmemiş';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <Modal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif">{showTrash ? 'Çöp Kutusu (Yazılar)' : 'Yazılar'}</h2>
          <p className="text-sm text-zinc-400">
            {showTrash ? 'Silinmiş olan makaleleri inceleyebilir veya kurtarabilirsiniz.' : 'Yazılarınızı oluşturun, güncelleyin ve yayın durumunu yönetin.'}
          </p>
        </div>
        <div className="flex gap-2">
          {!showTrash && (
            <Link
              to="/admin/articles/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#cb113a] hover:bg-[#e61442] text-white text-sm font-semibold rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Yeni Yazı
            </Link>
          )}
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border rounded-lg transition ${
              showTrash 
                ? 'bg-zinc-800 border-zinc-700 text-white' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {showTrash ? 'Aktif Yazılar' : <><Trash2 className="w-4 h-4" /> Çöp Kutusu</>}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#141414] border border-white/5 rounded-xl p-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500"><Search className="w-4 h-4" /></span>
          <input
            type="text"
            placeholder="Başlık veya yazar ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
          />
        </div>
        {/* Category Filter */}
        <div className="relative min-w-[200px]">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500"><Filter className="w-4 h-4" /></span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition appearance-none cursor-pointer"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#cb113a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aradığınız kriterlere uygun yazı bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-black/10">
                  <th className="px-6 py-4">Öne Çıkan</th>
                  <th className="px-6 py-4">Başlık / Yazar</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Okuma Süresi</th>
                  <th className="px-6 py-4">Yayın Durumu</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      {!art.deletedAt && (
                        <button
                          onClick={() => handleToggleFeatured(art.id, art.featured)}
                          className={`p-1 rounded transition ${art.featured ? 'text-amber-400 hover:text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                          title={art.featured ? 'Öne çıkarılanlardan kaldır' : 'Öne çıkar'}
                        >
                          <Star className="w-5 h-5" fill={art.featured ? 'currentColor' : 'none'} />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs sm:max-w-md truncate">
                      <div className="font-semibold text-white truncate">{art.title}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{art.author}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-zinc-300 font-medium">
                        {getCategoryName(art.categoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {art.readTime} dk
                    </td>
                    <td className="px-6 py-4">
                      {art.deletedAt ? (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/40 border border-rose-500/20 text-rose-300">Silindi</span>
                      ) : art.status === 'published' ? (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">Yayında</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-300 border border-white/5">Taslak</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {art.deletedAt ? (
                        <button
                          onClick={() => handleRestore(art.id)}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition inline-flex items-center gap-1 text-xs font-semibold"
                          title="Geri Yükle"
                        >
                          <RotateCcw className="w-4 h-4" /> Kurtar
                        </button>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/articles/edit/${art.id}`}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-lg text-xs font-semibold transition"
                          >
                            Düzenle
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(art.id, art.title)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Çöp Kutusuna Taşı"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
