import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, Save, Star } from 'lucide-react';
import Toast from '../components/Toast';
import FileUpload from '../components/FileUpload';
import RichEditor from '../components/RichEditor';
import slugify from 'slugify';

export default function ArticleEdit() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('Nâmünferit Editör');
  const [authorBio, setAuthorBio] = useState('Nâmünferit Dijital Kültür Platformu yazarı.');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [featured, setFeatured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function loadData() {
      setFetching(true);
      try {
        const catList = await api.getCategories();
        setCategories(catList.filter(c => c.type === 'article'));
        
        // Default to first category if none selected
        const artCats = catList.filter(c => c.type === 'article');
        if (artCats.length > 0 && isNew) {
          setCategoryId(artCats[0].id);
        }

        if (!isNew) {
          const art = await api.getArticle(id);
          setTitle(art.title);
          setSlug(art.slug);
          setAuthor(art.author);
          setAuthorBio(art.authorBio || '');
          setCategoryId(art.categoryId);
          setContent(art.content);
          setCoverImage(art.coverImage);
          setStatus(art.status);
          setFeatured(!!art.featured);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [id]);

  // Handle auto-slugification
  useEffect(() => {
    if (isNew && title) {
      setSlug(slugify(title, { lower: true, strict: true }));
    }
  }, [title, isNew]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSlugBlur = () => {
    if (slug) {
      setSlug(slugify(slug, { lower: true, strict: true }));
    } else {
      setSlug(slugify(title, { lower: true, strict: true }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !categoryId || !content) {
      showToast('Lütfen başlık, kategori ve içerik alanlarını doldurun.', 'error');
      return;
    }

    setLoading(true);
    const data = {
      title,
      slug,
      author,
      authorBio,
      categoryId,
      content,
      coverImage: coverImage || 'images/article1.png',
      status,
      featured
    };

    try {
      if (isNew) {
        await api.createArticle(data);
        showToast('Yazı başarıyla oluşturuldu.');
      } else {
        await api.updateArticle(id, data);
        showToast('Yazı başarıyla güncellendi.');
      }
      setTimeout(() => {
        navigate('/admin/articles');
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#cb113a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/admin/articles" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm">
          <ArrowLeft className="w-4 h-4" /> Yazılara Geri Dön
        </Link>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#cb113a] hover:bg-[#e61442] disabled:bg-[#cb113a]/50 text-white text-sm font-semibold rounded-lg shadow-md shadow-[#cb113a]/15 transition"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <><Save className="w-4 h-4" /> {isNew ? 'Yayınla / Kaydet' : 'Değişiklikleri Kaydet'}</>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b border-white/5 pb-3">İçerik Detayları</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Yazı Başlığı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Yazı başlığını girin..."
                required
                className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Özel Slug (Kalıcı Bağlantı)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onBlur={handleSlugBlur}
                placeholder="yazi-slug-formatinda-kalici-baglanti"
                required
                className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-[#cb113a] transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">İçerik</label>
              <RichEditor value={content} onChange={setContent} />
            </div>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b border-white/5 pb-3">Yazar Bilgileri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Yazar Adı</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Yazar adı soyadı"
                  className="w-full px-3.5 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Yazar Biyografisi</label>
                <input
                  type="text"
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Yazar hakkında kısa açıklama..."
                  className="w-full px-3.5 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info / Settings (1 col) */}
        <div className="space-y-6">
          {/* Cover Image Upload */}
          <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
            <FileUpload value={coverImage} onChange={setCoverImage} label="Kapak Görseli" />
          </div>

          {/* Publishing Settings */}
          <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-2">Yayınlama</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Yayın Durumu</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition cursor-pointer"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayında (Aktif)</option>
              </select>
            </div>

            <div className="space-y-1.5">
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

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-sm font-semibold text-zinc-300">Öne Çıkarılsın mı?</span>
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`p-1.5 rounded transition ${featured ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                <Star className="w-6 h-6" fill={featured ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
