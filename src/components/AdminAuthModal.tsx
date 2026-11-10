/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  LockKeyhole,
  Mail,
  RefreshCw,
  Send,
  Clock,
} from 'lucide-react';
import { getStoredAdminPin, saveStoredAdminPin } from '../utils/storage';

interface AdminAuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  lang: 'fr' | 'ar';
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  lang,
}) => {
  // Mode: 'otp' (Official Admin Email OTP Verification) | 'passcode' (Direct Sovereign Passcode)
  const [authMode, setAuthMode] = useState<'otp' | 'passcode'>('otp');

  // OTP flow states
  const [otpStep, setOtpStep] = useState<'idle' | 'sent'>('idle');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft] = useState(600); // 10 minutes countdown

  // Passcode flow states
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Common status feedback
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentAdminPin = getStoredAdminPin();

  // Reset states on modal open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      setPasscode('');
      setEnteredOtp('');
    }
  }, [isOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    if (otpStep !== 'sent') return;
    if (otpTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setOtpTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [otpStep, otpTimeLeft]);

  if (!isOpen) return null;

  // Format countdown mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Send OTP to authorized Admin Email via backend API
  const handleSendOtp = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSendingOtp(true);

    try {
      const response = await fetch('/api/admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send' }),
      });

      const data = await response.json();

      if (data.success && data.challenge && data.emailSent) {
        setChallengeToken(data.challenge);
        setOtpStep('sent');
        setOtpTimeLeft(600); // 10 minutes
        setSuccessMsg(
          lang === 'fr'
            ? 'Code secret envoyé avec succès vers la boîte de réception autorisée.'
            : 'تم إرسال رمز الأمان السري بنجاح إلى البريد المعتمد لإدارة المنصة.'
        );
      } else {
        throw new Error(data.error || data.emailError || "Service de messagerie non configuré");
      }
    } catch (err: any) {
      setError(
        lang === 'fr'
          ? `Échec d'envoi (${err.message || 'service indisponible'}). Veuillez utiliser votre code direct dans l'onglet "القن المباشر" ci-contre.`
          : `تعذر إرسال الرمز إلى البريد (${err.message || 'خدمة البريد غير مهيأة على Vercel'}). يمكنك الدخول الفوري عبر تبويب [القن المباشر] المجاور.`
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Verify entered OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanOtp = enteredOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError(
        lang === 'fr'
          ? 'Veuillez saisir le code à 6 chiffres reçu par e-mail.'
          : 'يرجى إدخال رمز التحقق المكون من 6 أرقام.'
      );
      return;
    }

    if (!challengeToken) {
      setError(
        lang === 'fr'
          ? 'Session expirée. Veuillez demander un nouveau code.'
          : 'انتهت صلاحية الجلسة. يرجى طلب رمز تحقق جديد.'
      );
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('/api/admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          otp: cleanOtp,
          challenge: challengeToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg(
          lang === 'fr'
            ? 'Identité confirmée avec succès ! Ouverture de la console...'
            : 'تم التحقق من هوية المشرف بنجاح! جاري فتح لوحة التحكم...'
        );
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setError(
          data.message ||
            (lang === 'fr'
              ? 'Code incorrect ou expiré.'
              : 'رمز التحقق غير صحيح أو منتهي الصلاحية.')
        );
      }
    } catch (err) {
      setError(
        lang === 'fr'
          ? 'Erreur lors de la vérification. Veuillez réessayer.'
          : 'حدث خطأ أثناء التحقق. يرجى إعادة المحاولة.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // 3. Direct Passcode Verification (Sovereign Master Key)
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setError(null);
    setSuccessMsg(null);

    const clean = passcode.trim();
    if (!clean) {
      setError(
        lang === 'fr'
          ? 'Veuillez saisir votre code secret administrateur.'
          : 'يرجى إدخال القن السري الخاص بالإدارة.'
      );
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);

      // Strictly ONE Sovereign Master PIN: Exact match required
      const SOVEREIGN_MASTER_PIN = 'FAC-Admin@2026';
      const isMatch = clean === SOVEREIGN_MASTER_PIN;

      if (isMatch) {
        saveStoredAdminPin(SOVEREIGN_MASTER_PIN);
        setSuccessMsg(
          lang === 'fr'
            ? 'Accès autorisé. Session administrateur ouverte.'
            : 'تم تأكيد هوية المشرف بنجاح. جاري فتح لوحة الإدارة.'
        );
        setTimeout(() => {
          onSuccess();
        }, 600);
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        if (remaining <= 0) {
          setIsLockedOut(true);
          setError(
            lang === 'fr'
              ? 'Accès temporairement verrouillé suite à 5 tentatives erronées.'
              : 'تم قفل الدخول مؤقتاً بعد 5 محاولات خاطئة لحماية المنصة.'
          );
        } else {
          setError(
            lang === 'fr'
              ? `Code incorrect. ${remaining} tentative(s) restante(s).`
              : `القن السري غير صحيح. تبقى لك ${remaining} محاولة.`
          );
        }
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-8">
        
        {/* Header (Completely Anonymous & Professional) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 shadow-xs">
              <LockKeyhole className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900">
                  {lang === 'fr' ? 'Console d\'Administration' : 'بوابة الإدارة المركزية'}
                </h2>
                <span className="text-[10px] font-mono font-black text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full border border-amber-400">
                  {lang === 'fr' ? 'CONFIDENTIEL' : 'سري'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'fr'
                  ? 'Système de gestion interne · Accès sécurisé'
                  : 'نظام الإدارة المركزي · الدخول محمي ومشفر'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity Verification Notice (No personal info displayed) */}
        <div className="p-3.5 bg-gradient-to-r from-amber-50/80 to-stone-50 rounded-2xl border border-amber-200 text-xs text-stone-700 mb-5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lang === 'fr' ? 'Authentification Sécurisée' : 'مصادقة إدارية محمية ومشفرة'}</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            {lang === 'fr'
              ? 'Cet espace est strictement réservé à la régie administrative de la plateforme.'
              : 'هذا الفضاء محمي ومخصص حصرياً للمشرف على المنصة.'}
          </p>
        </div>

        {/* Dual Tab Switcher: OTP vs Passcode */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'otp'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'fr' ? 'Code E-mail (OTP)' : 'رمز التحقق (OTP)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('passcode');
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'passcode'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'fr' ? 'القن المباشر' : 'القن المباشر'}</span>
          </button>
        </div>

        {/* TAB 1: OTP EMAIL VERIFICATION */}
        {authMode === 'otp' && (
          <div className="space-y-4">
            {otpStep === 'idle' ? (
              <div className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  {lang === 'fr'
                    ? 'Cliquez ci-dessous pour générer et expédier un code d\'autorisation unique à 6 chiffres vers la boîte de messagerie administrateur configurée.'
                    : 'اضغط على الزر أدناه لتوليد وإرسال رمز أمان سري مؤقت (مكون من 6 أرقام) إلى البريد الإداري المعتمد للمنصة:'}
                </p>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <div className="text-xs font-mono font-bold text-stone-700 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'fr' ? 'Messagerie d\'administration vérifiée' : 'البريد الإداري المعتمد للمنصة'}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-stone-950" />
                  )}
                  <span>
                    {isSendingOtp
                      ? (lang === 'fr' ? 'Génération et envoi du code...' : 'جارِ إرسال الرمز إلى بريدك...')
                      : (lang === 'fr' ? 'Envoyer le Code OTP au Courriel' : 'إرسال رمز التحقق إلى البريد الإداري')}
                  </span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'fr' ? 'Code expédié avec succès' : 'تم إرسال الرمز بنجاح!'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90">
                    {lang === 'fr'
                      ? 'Consultez votre messagerie et saisissez le code reçu à 6 chiffres.'
                      : 'يرجى فتح علبة بريدك الإداري وإدخال الرمز المكون من 6 أرقام.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
                    <span>{lang === 'fr' ? 'Code de Vérification (6 chiffres)' : 'رمز التحقق السري'}</span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimer(otpTimeLeft)}</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setEnteredOtp(val);
                      setError(null);
                    }}
                    placeholder="••••••"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-black text-xl text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || enteredOtp.length !== 6}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>{lang === 'fr' ? 'Valider et Déverrouiller' : 'تأكيد الرمز وفتح لوحة الإدارة'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer transition-colors"
                  >
                    {lang === 'fr' ? 'Renvoyer un nouveau code' : 'إعادة إرسال رمز جديد'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: DIRECT SOVEREIGN PASSCODE */}
        {authMode === 'passcode' && (
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === 'fr'
                ? 'Accès immédiat par clé secrète de la régie administrative.'
                : 'الدخول الفوري المباشر عبر القن السري الخاص بالإدارة.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'fr' ? 'القن السري للإدارة' : 'القن السري للإدارة'}</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError(null);
                  }}
                  placeholder={lang === 'fr' ? 'Saisissez votre code confidentiel' : 'أدخل القن السري الخاص بك'}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all pr-10 rtl:pr-4 rtl:pl-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || isLockedOut}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{lang === 'fr' ? 'Déverrouiller la Console Admin' : 'دخول لوحة تحكم الإدارة'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
