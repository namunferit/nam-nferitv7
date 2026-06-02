import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Loader } from 'lucide-react';
import { api } from '../lib/api';

export default function FileUpload({ value, onChange, label = 'Görsel Seç' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.uploadMedia(formData);
      onChange(res.url);
    } catch (err) {
      setError(err.message || 'Dosya yükleme başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleUrlSubmit = () => {
    onChange(urlInput);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">{label}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`text-xs px-2.5 py-1 rounded transition ${mode === 'upload' ? 'bg-[#cb113a] text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
          >
            Dosya Yükle
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`text-xs px-2.5 py-1 rounded transition ${mode === 'url' ? 'bg-[#cb113a] text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
          >
            URL ile Ekle
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-[#cb113a]/50 bg-black/10 hover:bg-black/20 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition min-h-[160px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader className="w-8 h-8 text-[#cb113a] animate-spin" />
              <p className="text-xs text-zinc-400">Görsel optimize ediliyor...</p>
            </div>
          ) : value ? (
            <div className="relative w-full aspect-video max-h-[160px] rounded-lg overflow-hidden group">
              <img src={value.startsWith('http') || value.startsWith('/') ? value : `/${value}`} alt="Seçilen görsel" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <p className="text-xs font-semibold flex items-center gap-1.5"><Upload className="w-4 h-4" /> Değiştirmek için tıklayın veya sürükleyin</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm text-zinc-300 font-medium">Görsel yüklemek için tıklayın veya sürükleyip bırakın</p>
              <p className="text-xs text-zinc-500">JPG, PNG, WEBP, GIF (Max. 10MB)</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500"><LinkIcon className="w-4 h-4" /></span>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg veya images/filename.png"
                className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
            >
              Uygula
            </button>
          </div>

          {value && (
            <div className="relative w-full aspect-video max-h-[160px] rounded-lg overflow-hidden border border-white/5">
              <img src={value.startsWith('http') || value.startsWith('/') ? value : `/${value}`} alt="Seçilen görsel" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
