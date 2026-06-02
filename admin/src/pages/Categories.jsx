import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { FolderOpen, Plus, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Edit/create state
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('article');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const list = await api.getCategories();
      setCategories(list);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleOpenNew = () => {
    setEditingCategory(null);
    setName('');
    setType('article');
    setFormOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setFormOpen(true);
  };

  const handleDeleteClick = (id, name) => {
    setConfirmModal({
      id,
      title: 'Kategoriyi Sil',
      message: `"${name}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      onConfirm: () => deleteCategory(id)
    });
  };

  const deleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      showToast('Kategori başarıyla silindi.');
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !type) {
      showToast('Kategori adı gereklidir.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, { name, type });
        showToast('Kategori başarıyla güncellendi.');
      } else {
        await api.createCategory({ name, type });
        showToast('Kategori başarıyla oluşturuldu.');
      }
      setFormOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {confirmModal && (
        <Modal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-xl text-[#f5f0eb] shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
              <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#cb113a]" />
                {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}
              </h3>
              <button onClick={() => setFormOpen(false)} className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Kategori Adı</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kategori adını girin..."
                  required
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">İçerik Türü</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition cursor-pointer"
                >
                  <option value="article">Yazı Kategorisi</option>
                  <option value="video">Video Kategorisi</option>
                </select>
              </div>
            </form>

            <div className="flex justify-end gap-3 p-4 bg-black/20 border-t border-white/5">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#cb113a] hover:bg-[#e61442] text-white text-sm font-semibold rounded-lg transition"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save className="w-4 h-4" /> Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif">Kategoriler</h2>
          <p className="text-sm text-zinc-400">Yazı ve video içerikleriniz için kategorileri yönetin.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#cb113a] hover:bg-[#e61442] text-white text-sm font-semibold rounded-lg transition shadow-md shadow-[#cb113a]/15"
        >
          <Plus className="w-4 h-4" /> Yeni Kategori Ekle
        </button>
      </div>

      {/* List */}
      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#cb113a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Henüz kategori bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-black/10">
                  <th className="px-6 py-4">Kategori Adı</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Tür</th>
                  <th className="px-6 py-4">Aktif İçerik Sayısı</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cat.type === 'article' ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/10' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/10'}`}>
                        {cat.type === 'article' ? 'Yazı' : 'Video'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-medium">
                      {cat.count || 0} içerik
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-lg text-xs font-semibold transition"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat.id, cat.name)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Kategoriyi Sil"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
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
