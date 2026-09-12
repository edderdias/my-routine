import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  ArrowRight,
  CheckCircle,
  Calendar,
  Bell,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Check,
  X,
  MailCheck,
  RefreshCw,
  LogOut,
  Send
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AppBrandIcon } from '../common/AppBrandIcon';
import { LoginWallpaper } from '../common/LoginWallpaper';
import { validatePassword } from '../../utils/passwordValidator';

export const AuthScreen: React.FC = () => {
  const {
    login,
    register,
    forgotPassword,
    emailPendingVerification,
    unverifiedUser,
    checkEmailVerified,
    resendVerificationEmail,
    cancelVerificationFlow
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Real inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Password rules validation in real time
  const passwordStatus = validatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Phone input formatting helper (BR phone: (XX) 9XXXX-XXXX)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);

    if (val.length <= 2) {
      setPhone(val ? `(${val}` : '');
    } else if (val.length <= 6) {
      setPhone(`(${val.slice(0, 2)}) ${val.slice(2)}`);
    } else if (val.length <= 10) {
      setPhone(`(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`);
    } else {
      setPhone(`(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7, 11)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setFeedback({ type: 'error', text: 'Informe seu e-mail e senha de acesso.' });
        return;
      }
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setFeedback({ type: 'error', text: res.message || 'Erro ao realizar login.' });
      }
    } else if (mode === 'register') {
      if (!name.trim()) {
        setFeedback({ type: 'error', text: 'Informe seu nome completo.' });
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setFeedback({ type: 'error', text: 'Informe um e-mail válido.' });
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setFeedback({ type: 'error', text: 'Informe seu número de celular com DDD (mínimo 10 dígitos).' });
        return;
      }
      if (!passwordStatus.isValid) {
        setFeedback({
          type: 'error',
          text: passwordStatus.errorMessage || 'A senha não atende aos requisitos de segurança.',
        });
        return;
      }
      if (password !== confirmPassword) {
        setFeedback({ type: 'error', text: 'A confirmação de senha não confere.' });
        return;
      }

      setLoading(true);
      const res = await register(name, email, phone, password);
      setLoading(false);
      if (!res.success) {
        setFeedback({ type: 'error', text: res.message || 'Erro ao cadastrar usuário.' });
      } else {
        setFeedback({ type: 'success', text: res.message || 'Confirmação enviada!' });
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setFeedback({ type: 'error', text: 'Informe o e-mail cadastrado para redefinir a senha.' });
        return;
      }
      setLoading(true);
      const res = await forgotPassword(email);
      setLoading(false);
      if (res.success) {
        setResetSentSuccess(true);
        setFeedback({ type: 'success', text: res.message || 'Link de redefinição enviado com sucesso!' });
      } else {
        setFeedback({ type: 'error', text: res.message || 'Erro ao enviar e-mail de redefinição.' });
      }
    }
  };

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    setFeedback(null);
    const res = await checkEmailVerified();
    setCheckingVerification(false);
    if (!res.success) {
      setFeedback({ type: 'error', text: res.message || 'O e-mail ainda não foi confirmado.' });
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setResendingEmail(true);
    setFeedback(null);
    const res = await resendVerificationEmail();
    setResendingEmail(false);
    if (res.success) {
      setResendCooldown(60);
      setFeedback({
        type: 'success',
        text: 'Novo e-mail de confirmação enviado! Verifique sua caixa de entrada e spam.',
      });
    } else {
      setFeedback({ type: 'error', text: res.message || 'Erro ao reenviar e-mail.' });
    }
  };

  return (
    <LoginWallpaper>
      {/* Top Navbar / Brand Tag */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <AppBrandIcon size={36} showText={false} />
          <span className="text-white font-extrabold text-base tracking-tight drop-shadow-sm">
            Minha <span className="text-[#38bdf8]">Rotina</span>
          </span>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Banco de Dados em Nuvem</span>
        </span>
      </header>

      {/* Main 2-Column Hero & Auth Layout */}
      <main className="w-full max-w-7xl mx-auto my-auto py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Brand Composition */}
        <section className="lg:col-span-7 flex flex-col justify-center text-white space-y-6 lg:pr-8">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="shrink-0 drop-shadow-2xl">
              <AppBrandIcon size={72} showText={false} />
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white drop-shadow-lg">
                Minha <span className="text-[#38bdf8]">Rotina</span>
              </h1>
              <div className="text-lg sm:text-2xl text-sky-100 font-medium tracking-normal mt-2.5 leading-snug drop-shadow-md">
                <p>Organize seu tempo.</p>
                <p>Conquiste seus objetivos.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
              <div className="w-8 h-8 rounded-xl bg-blue-500/30 flex items-center justify-center mb-2 text-[#38bdf8]">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Dados Reais na Nuvem</h4>
              <p className="text-[11px] text-sky-100/80 mt-0.5">Tarefas e rotina sincronizadas no banco de dados.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center mb-2 text-emerald-300">
                <Bell className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Lembretes Inteligentes</h4>
              <p className="text-[11px] text-sky-100/80 mt-0.5">Avisos automáticos por WhatsApp e E-mail.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/30 flex items-center justify-center mb-2 text-cyan-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Acesso Seguro & PWA</h4>
              <p className="text-[11px] text-sky-100/80 mt-0.5">Confirmação por e-mail e instalação no celular.</p>
            </div>
          </div>
        </section>

        {/* Right Column: Dynamic Auth / Verification Card */}
        <section className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 shadow-blue-950/50">
            {/* Case 1: Email Confirmation Pending View */}
            {emailPendingVerification ? (
              <div className="space-y-5 text-center">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-sm">
                  <MailCheck className="w-8 h-8 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Confirme seu E-mail
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Para acessar o sistema com segurança, confirme sua conta clicando no link que enviamos para:
                  </p>
                  <div className="mt-2.5 inline-block px-3.5 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-800 font-bold text-xs break-all">
                    {unverifiedUser?.email || email}
                  </div>
                </div>

                {feedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2.5 text-left ${
                      feedback.type === 'error'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    )}
                    <span>{feedback.text}</span>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 text-left space-y-1.5">
                  <p className="font-bold text-slate-700">Como ativar sua conta:</p>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
                    <li>Abra seu aplicativo de e-mail ou webmail.</li>
                    <li>Procure a mensagem de confirmação do <strong>Minha Rotina</strong>.</li>
                    <li>Clique no link de confirmação contido no e-mail.</li>
                    <li>Volte aqui e clique no botão abaixo para entrar!</li>
                  </ol>
                  <p className="text-[10px] text-slate-400 italic pt-1">
                    *Não encontrou? Verifique também sua pasta de lixo eletrônico ou spam.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Verify button */}
                  <button
                    type="button"
                    onClick={handleCheckVerification}
                    disabled={checkingVerification}
                    id="btn-check-email-verified"
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {checkingVerification ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Já cliquei no link, entrar agora</span>
                      </>
                    )}
                  </button>

                  {/* Resend button */}
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingEmail || resendCooldown > 0}
                    id="btn-resend-verification"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingEmail ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {resendCooldown > 0
                            ? `Aguarde ${resendCooldown}s para reenviar`
                            : 'Reenviar e-mail de confirmação'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Cancel / Switch account */}
                  <button
                    type="button"
                    onClick={cancelVerificationFlow}
                    id="btn-cancel-verification"
                    className="pt-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair ou entrar com outra conta</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Case 2: Login / Register / Forgot Password Forms */
              <>
                {/* Header / Title */}
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {mode === 'login' && 'Acesse sua conta'}
                    {mode === 'register' && 'Crie sua conta'}
                    {mode === 'forgot' && 'Recuperação de senha'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {mode === 'login' && 'Entre com seu e-mail e senha cadastrados.'}
                    {mode === 'register' && 'Cadastre-se para iniciar o gerenciamento da sua rotina.'}
                    {mode === 'forgot' && 'Receba um link em seu e-mail para cadastrar sua nova senha.'}
                  </p>
                </div>

                {/* Switch Tabs (Login / Register) */}
                {mode !== 'forgot' && (
                  <div className="flex items-center justify-center p-1 bg-slate-100/90 rounded-2xl mb-6">
                    <button
                      type="button"
                      id="tab-login-btn"
                      onClick={() => { setMode('login'); setFeedback(null); }}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        mode === 'login'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Entrar
                    </button>
                    <button
                      type="button"
                      id="tab-register-btn"
                      onClick={() => { setMode('register'); setFeedback(null); }}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        mode === 'register'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Criar Conta
                    </button>
                  </div>
                )}

                {/* Feedback Alerts */}
                {feedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium mb-4 flex items-start gap-2.5 ${
                      feedback.type === 'error'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    )}
                    <span>{feedback.text}</span>
                  </div>
                )}

                {/* Forgot Password Success State */}
                {mode === 'forgot' && resetSentSuccess ? (
                  <div className="text-center py-4 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-900">
                        Link de Redefinição Enviado!
                      </h3>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto">
                        Enviamos um link para o e-mail <strong>{email}</strong>. Abra sua caixa de entrada e clique no link para cadastrar sua nova senha.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResetSentSuccess(false);
                        setMode('login');
                        setFeedback(null);
                      }}
                      className="mt-2 py-2.5 px-6 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Voltar para o Login
                    </button>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Nome Completo
                          </label>
                          <div className="relative">
                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={e => setName(e.target.value)}
                              placeholder="Ex: Maria Silva"
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Celular / WhatsApp (com DDD)
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={handlePhoneChange}
                              placeholder="(11) 98888-7777"
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Número onde você receberá os lembretes automáticos de compromissos.
                          </span>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Endereço de E-mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="seu.email@exemplo.com"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>

                    {mode !== 'forgot' && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Senha
                          </label>
                          {mode === 'login' && (
                            <button
                              type="button"
                              onClick={() => { setMode('forgot'); setFeedback(null); }}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                            >
                              Esqueceu a senha?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={mode === 'register' ? 'Letras, números e caracteres' : '••••••••'}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Interactive Password Requirements Checklist (Register Mode) */}
                        {mode === 'register' && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-700">
                              Requisitos da senha:
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              <div className={`flex items-center gap-1.5 ${passwordStatus.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                                {passwordStatus.hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                                <span>No mínimo 8 caracteres</span>
                              </div>
                              <div className={`flex items-center gap-1.5 ${passwordStatus.hasLetter ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                                {passwordStatus.hasLetter ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                                <span>Pelo menos uma letra</span>
                              </div>
                              <div className={`flex items-center gap-1.5 ${passwordStatus.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                                {passwordStatus.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                                <span>Pelo menos um número</span>
                              </div>
                              <div className={`flex items-center gap-1.5 ${passwordStatus.hasSpecialChar ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                                {passwordStatus.hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                                <span>Caractere especial (!@#$)</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {mode === 'register' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Confirme a Senha
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Repita sua senha exatamente"
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword.length > 0 && (
                          <div className={`text-[10px] mt-1 flex items-center gap-1 font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {passwordsMatch ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Senhas conferem perfeitamente</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" />
                                <span>As senhas não coincidem</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || (mode === 'register' && (!passwordStatus.isValid || !passwordsMatch))}
                      id="auth-submit-btn"
                      className="w-full mt-3 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>
                            {mode === 'login' && 'Entrar no Sistema'}
                            {mode === 'register' && 'Cadastrar & Enviar Confirmação'}
                            {mode === 'forgot' && 'Enviar Link de Redefinição'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {mode === 'forgot' && !resetSentSuccess && (
                  <div className="text-center mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setFeedback(null); }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      Voltar para o Login
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-3 text-center text-xs text-white/70 font-medium">
        <span>Minha Rotina &bull; Sistema de Agenda Pessoal & Notificações PWA</span>
      </footer>
    </LoginWallpaper>
  );
};
