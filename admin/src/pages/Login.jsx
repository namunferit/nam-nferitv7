import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gereklidir.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0eb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141414] border border-white/5 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#cb113a] flex items-center justify-center font-bold text-2xl text-white mx-auto shadow-lg shadow-[#cb113a]/20">
            N
          </div>
          <h2 className="text-xl font-bold tracking-wide font-serif">NÂMÜNFERİT</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">CMS Yönetim Paneli</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-500/20 text-rose-300 rounded-lg text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Kullanıcı Adı</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500"><User className="w-4 h-4" /></span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adı"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Şifre</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500"><Lock className="w-4 h-4" /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifre"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#cb113a] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#cb113a] hover:bg-[#e61442] disabled:bg-[#cb113a]/50 text-white rounded-lg text-sm font-semibold tracking-wide shadow-lg shadow-[#cb113a]/10 hover:shadow-[#cb113a]/25 transition-all duration-200 mt-2 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
