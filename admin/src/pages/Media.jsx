import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Image as ImageIcon, Upload, Trash2, Edit2, Copy, Check, Loader, X } from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

export default function Media() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [copiedFilename, setCopiedFilename] = useState('');

  // Rename states
  const [renameOpen, setRenameOpen] = useState(false);
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const list = await api.getMedia();
      setMedia(list);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      await api.uploadMedia(formData);
      showToast('Görsel başarıyla yüklendi.');
      loadMedia();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyLink = (url, filename) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedFilename(filename);
      showToast('Medya bağlantısı panoya kopyalandı.');
      setTimeout(() => setCopiedFilename(''), 2000);
    });
  };

  const handleDeleteClick = (filename) => {
    setConfirmModal({
      filename,
      title: 'Medyayı Sil',
      message: `"${filename}" isimli görseli sunucudan kalıcı olarak silmek istediğinizden emin misiniz? Bu görseli kullanan yazılar etkilenebilir.`,
      onConfirm: () => deleteMedia(filename)
    });
  };

  const deleteMedia = async (filename) => {
    try {
      await api.deleteMedia(filename);
      showToast('Görsel silindi.');
      loadMedia();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  const handleOpenRename = (filename) => {
    setOldName(filename);
    setNewName(filename);
    setRenameOpen(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName || newName === oldName) {
      setRenameOpen(false);
      return;
    }

    setRenaming(true);
    try {
      await api.renameMedia(oldName, newName);
      showToast('Görsel başarıyla yeniden adlandırıldı.');
      setRenameOpen(false);
      loadMedia();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRenaming(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

      {/* Rename Dialog */}
      {renameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-xl text-[#f5f0eb] shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Dosya Adını Değiştir</h3>
              <button onClick={() => setRenameOpen(false)} className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRename} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Yeni Dosya Adı</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="filename.webp"
                  required
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition font-mono"
                />
              </div>
            </form>
            <div className="flex justify-end gap-3 p-4 bg-black/20 border-t border-white/5">
              <button type="button" onClick={() => setRenameOpen(false)} className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition">İptal</button>
              <button onClick={handleRename} disabled={renaming} className="px-4 py-2 bg-[#cb113a] hover:bg-[#e61442] text-white text-sm font-semibold rounded-lg transition">
                {renaming ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif">Medya Kütüphanesi</h2>
          <p className="text-sm text-zinc-400">Yazılarınıza ekleyeceğiniz kapak görsellerini ve medya dosyalarını yükleyin.</p>
        </div>
        <label className="flex items-center gap-1.5 px-4 py-2 bg-[#cb113a] hover:bg-[#e61442] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#cb113a]/15 transition cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
          <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* Media Grid */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-6 shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#cb113a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : media.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Medya kütüphanesinde hiç görsel bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {media.map((file) => (
              <div key={file.filename} className="bg-black/20 border border-white/5 rounded-xl overflow-hidden group flex flex-col justify-between">
                {/* Preview Image */}
                <div className="aspect-square bg-black/40 overflow-hidden relative flex items-center justify-center border-b border-white/5">
                  <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                  
                  {/* Action overlays on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyLink(file.url, file.filename)}
                      className="p-2 bg-[#1e1e1e] hover:bg-[#cb113a] border border-white/10 rounded-lg text-white transition"
                      title="URL Kopyala"
                    >
                      {copiedFilename === file.filename ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5" />}
                    </button>
                    <button
                      onClick={() => handleOpenRename(file.filename)}
                      className="p-2 bg-[#1e1e1e] hover:bg-zinc-800 border border-white/10 rounded-lg text-white transition"
                      title="Yeniden Adlandır"
                    >
                      <Edit2 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(file.filename)}
                      className="p-2 bg-[#1e1e1e] hover:bg-rose-950 border border-white/10 rounded-lg text-rose-400 transition"
                      title="Sil"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3 bg-black/10">
                  <p className="text-xs text-white truncate font-medium" title={file.filename}>{file.filename}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{formatSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
