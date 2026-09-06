import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../types/crm';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setError(res.error || 'Ошибка авторизации');
      }
      setLoading(false);
    }, 250);
  };

  const handleFillSuperAdmin = () => {
    setEmail('abdulazizmurodkosimov@gmail.com');
    setPassword('10022002mm');
    setError(null);
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'uz', label: "O'zbekcha" },
    { code: 'en', label: 'English' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between p-4 sm:p-6 text-neutral-100 selection:bg-white selection:text-black relative overflow-hidden font-mono">
      {/* Subtle background glow effect */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-neutral-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Lang switch */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black shadow-lg">
            UP
          </div>
          <div>
            <span className="font-black tracking-wider text-sm">UNIONPRINT</span>
            <span className="text-[10px] text-neutral-400 block font-bold tracking-widest uppercase">
              CRM & POLYGRAPHY
            </span>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          {languages.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                language === l.code
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-8">
        <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-100 shadow-inner">
              <KeyRound className="w-6 h-6 text-neutral-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Вход в систему UnionPrint
            </h1>
            <p className="text-xs text-neutral-400 font-bold max-w-xs mx-auto">
              Авторизуйтесь для доступа к CRM, заказам и управлению типографией
            </p>
          </div>

          {/* Quick Super Admin Preset Button */}
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Главный аккаунт Супер Админа:
              </span>
              <span className="text-[10px] text-neutral-500 uppercase">Предустановлен</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono bg-neutral-900/80 px-3 py-2 rounded-xl border border-neutral-800">
              <span className="text-neutral-300 truncate max-w-[210px]">
                abdulazizmurodkosimov@gmail.com
              </span>
              <button
                type="button"
                onClick={handleFillSuperAdmin}
                className="text-[11px] font-black text-white hover:text-amber-300 underline underline-offset-2 transition cursor-pointer shrink-0 ml-2"
              >
                Вставить данные
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Email / Логин
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="abdulazizmurodkosimov@gmail.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-bold placeholder:text-neutral-600 focus:border-white focus:ring-1 focus:ring-white outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-bold placeholder:text-neutral-600 focus:border-white focus:ring-1 focus:ring-white outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-white hover:bg-neutral-200 text-black font-black py-3 px-4 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              <span>{loading ? 'Проверка данных...' : 'Войти в рабочий кабинет'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Note */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-center gap-2 text-[10px] text-neutral-500 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Защищенный доступ с разграничением прав персонала</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-neutral-600 font-bold z-10">
        © {new Date().getFullYear()} UnionPrint Polygraphy CRM. Все права защищены.
      </div>
    </div>
  );
};
