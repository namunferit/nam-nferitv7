import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Palette, Save, HelpCircle, AlertTriangle } from 'lucide-react';
import Toast from '../components/Toast';

export default function Design() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      showToast('Tasarım ayarları kaydedildi ve site yeniden oluşturuldu.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#cb113a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif">Site Ayarları</h2>
          <p className="text-sm text-zinc-400">Site renkleri, başlık, sosyal medya hesapları ve genel görünümü yönetin.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#cb113a] hover:bg-[#e61442] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#cb113a]/15 transition"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save className="w-4 h-4" /> Ayarları Kaydet</>}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Site Details */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-[#cb113a] border-b border-white/5 pb-2">Genel Bilgiler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Site Başlığı</label>
              <input
                type="text"
                value={settings?.site?.title || ''}
                onChange={(e) => updateSetting('site', 'title', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Logo Görsel URL</label>
              <input
                type="text"
                value={settings?.site?.logo || ''}
                onChange={(e) => updateSetting('site', 'logo', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Meta Açıklaması (SEO)</label>
            <textarea
              value={settings?.site?.description || ''}
              onChange={(e) => updateSetting('site', 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition resize-none"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-[#cb113a] border-b border-white/5 pb-2">Ana Sayfa Kahraman (Hero) Bölümü</h3>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Hero Başlık (HTML Kullanılabilir)</label>
            <input
              type="text"
              value={settings?.hero?.title || ''}
              onChange={(e) => updateSetting('hero', 'title', e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Hero Açıklama</label>
              <input
                type="text"
                value={settings?.hero?.description || ''}
                onChange={(e) => updateSetting('hero', 'description', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Hero Kaydırma Buton Metni</label>
              <input
                type="text"
                value={settings?.hero?.buttonText || ''}
                onChange={(e) => updateSetting('hero', 'buttonText', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
          </div>
        </div>

        {/* Colors & Fonts */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-[#cb113a] border-b border-white/5 pb-2">Renkler ve Tipografi</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">Burgonya Rengi (Ana Renk)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings?.colors?.burgundy || '#cb113a'}
                  onChange={(e) => updateSetting('colors', 'burgundy', e.target.value)}
                  className="w-10 h-10 border border-white/10 bg-transparent rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings?.colors?.burgundy || ''}
                  onChange={(e) => updateSetting('colors', 'burgundy', e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition font-mono uppercase text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Yazı Tipi (Serif)</label>
              <select
                value={settings?.fonts?.serif || ''}
                onChange={(e) => updateSetting('fonts', 'serif', e.target.value)}
                className="w-full px-3 py-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition cursor-pointer"
              >
                <option value="Playfair Display">Playfair Display</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Lora">Lora</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Yazı Tipi (Sans)</label>
              <select
                value={settings?.fonts?.sans || ''}
                onChange={(e) => updateSetting('fonts', 'sans', e.target.value)}
                className="w-full px-3 py-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition cursor-pointer"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="System Sans">System Sans</option>
              </select>
            </div>
          </div>
        </div>

        {/* Social Accounts */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-[#cb113a] border-b border-white/5 pb-2">Sosyal Medya ve İletişim</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">YouTube Kanalı</label>
              <input
                type="text"
                value={settings?.social?.youtube || ''}
                onChange={(e) => updateSetting('social', 'youtube', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">X (Twitter)</label>
              <input
                type="text"
                value={settings?.social?.x || ''}
                onChange={(e) => updateSetting('social', 'x', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">TikTok</label>
              <input
                type="text"
                value={settings?.social?.tiktok || ''}
                onChange={(e) => updateSetting('social', 'tiktok', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Instagram</label>
              <input
                type="text"
                value={settings?.social?.instagram || ''}
                onChange={(e) => updateSetting('social', 'instagram', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">İletişim E-posta Adresi</label>
            <input
              type="email"
              value={settings?.social?.email || ''}
              onChange={(e) => updateSetting('social', 'email', e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
            />
          </div>
        </div>

        {/* Integration */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-[#cb113a] border-b border-white/5 pb-2">Google Sheets Entegrasyonu</h3>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              Apps Script URL'si
              <HelpCircle className="w-3.5 h-3.5 text-zinc-500" title="yazi-gonder.html sayfasının formları göndereceği Google Apps Script web uygulaması adresi." />
            </label>
            <input
              type="text"
              value={settings?.appsScriptUrl || ''}
              onChange={(e) => updateSetting('appsScriptUrl', '', e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#cb113a] transition"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
