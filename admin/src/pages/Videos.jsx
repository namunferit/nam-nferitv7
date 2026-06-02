import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Video, Plus, Edit, Trash2, Search, Play, X, Save } from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('published');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vidList, catList] = await Promise.all([
        api.getVideos(),
        api.getCategories()
      ]);
      setVideos(vidList);
      const vidCats = catList.filter(c => c.type === 'video');
      setCategories(vidCats);
      if (vidCats.length > 0) {
        setCategoryId(vidCats[0].id);
      }
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
    setEditingVideo(null);
    setTitle('');
    setDescription('');
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    setEmbedUrl('');
    setThumbnail('images/article4.png');
    setDuration('15 dk');
    setStatus('published');
    setFormOpen(true);
  };

  const handleOpenEdit = (vid) => {
    setEditingVideo(vid);
    setTitle(vid.title);
    setDescription(vid.description || '');
    setCategoryId(vid.categoryId);
    setEmbedUrl(vid.embedUrl);
    setThumbnail(vid.thumbnail || 'images/article4.png');
    setDuration(vid.duration || '');
    setStatus(vid.status || 'published');
    setFormOpen(true);
  };

  const handleDeleteClick = (id, title) => {
    setConfirmModal({
      id,
      title: 'Videoyu Sil',
      message: `"${title}" videosunu silmek istediğinizden emin misiniz?`,
      onConfirm: () => deleteVideo(id)
    });
  };

  const deleteVideo = async (id) => {
    try {
      await api.deleteVideo(id);
      showToast('Video başarıyla silindi.');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !categoryId || !embedUrl) {
      showToast('Lütfen başlık, kategori ve video URL alanlarını doldurun.', 'error');
      return;
    }

    setSaving(true);
    const data = {
      title,
      description,
      categoryId,
      embedUrl,
      thumbnail,
      duration,
      status
    };

    try {
      if (editingVideo) {
        await api.updateVideo(editingVideo.id, data);
        showToast('Video güncellendi.');
      } else {
        await api.createVideo(data);
        showToast('Video başarıyla eklendi.');
      }
      setFormOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (catId) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.name : 'Genel';
  };

  const filteredVideos = videos.filter(vid =>
    vid.title.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="w-full max-w-lg bg-[#1e1e1e] border border-white/10 rounded-xl text-[#f5f0eb] shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
              <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                <Video className="w-5 h-5 text-[#cb113a]" />
                {editingVideo ? 'Videoyu Düzenle' : 'Yeni Video Ekle'}
              </h3>
              <button onClick={() => setFormOpen(false)} className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Video Başlığı</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Başlık girin..."
                  required
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Açıklama (Opsiyonel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Video hakkında kısa açıklama..."
                  rows={2}
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Süre (Örn: 18 dk)</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Süre..."
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Video Embed veya Paylaş URL</label>
                <input
                  type="text"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/... veya youtube.com/..."
                  required
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Küçük Resim (Thumbnail) URL</label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="images/article4.png veya upload url..."
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Durum</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition cursor-pointer"
                >
                  <option value="published">Yayında</option>
                  <option value="draft">Taslak</option>
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
          <h2 className="text-2xl font-bold font-serif">Videolar</h2>
          <p className="text-sm text-zinc-400">Youtube, röportaj ve sokak söyleşilerinizi buradan yönetin.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#cb113a] hover:bg-[#e61442] text-white text-sm font-semibold rounded-lg transition shadow-md shadow-[#cb113a]/15"
        >
          <Plus className="w-4 h-4" /> Yeni Video Ekle
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500"><Search className="w-4 h-4" /></span>
          <input
            type="text"
            placeholder="Video ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
          />
        </div>
      </div>

      {/* Videos List Grid */}
      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#cb113a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aradığınız kriterlere uygun video bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredVideos.map((vid) => (
              <div key={vid.id} className="bg-black/20 border border-white/5 rounded-xl overflow-hidden group flex flex-col justify-between">
                {/* Thumbnail Preview */}
                <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                  <img src={vid.thumbnail.startsWith('http') || vid.thumbnail.startsWith('/') ? vid.thumbnail : `/${vid.thumbnail}`} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-[#cb113a] border border-white/10 flex items-center justify-center transition">
                      <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-[10px] font-bold text-white rounded">
                    {vid.duration}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">{getCategoryName(vid.categoryId)}</span>
                    <h3 className="font-semibold text-white text-sm mt-1 line-clamp-2">{vid.title}</h3>
                    {vid.description && <p className="text-zinc-500 text-xs mt-1.5 line-clamp-2">{vid.description}</p>}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${vid.status === 'published' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/10' : 'bg-zinc-800 text-zinc-400'}`}>
                      {vid.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(vid)}
                        className="p-1.5 hover:bg-white/5 text-zinc-400 hover:text-white rounded border border-white/5 transition"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(vid.id, vid.title)}
                        className="p-1.5 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded border border-white/5 transition"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
