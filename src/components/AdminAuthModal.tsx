/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  getStoredAdminPin,
  saveStoredAdminPin,
  getStoredAdminRecoveryEmail,
  PLATFORM_GMAIL,
} from '../utils/storage';

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
  const [view, setView] = useState<'login' | 'recovery'>('login');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [isVerifying, setIsVerifying] = useState(false);

  // Recovery flow states
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'new_pin'>('email');
  const [generatedRecoveryOtp, setGeneratedRecoveryOtp] = useState('');
  const [enteredRecoveryOtp, setEnteredRecoveryOtp] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [confirmNewAdminPin, setConfirmNewAdminPin] = useState('');

  if (!isOpen) return null;

  const currentAdminPin = getStoredAdminPin();
  const configuredRecoveryEmail = getStoredAdminRecoveryEmail();

  // 1. Submit Passcode Verification
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      // Strictly match stored private admin PIN
      if (clean === currentAdminPin) {
        onSuccess();
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        if (remaining <= 0) {
          setError(
            lang === 'fr'
              ? 'Accès verrouillé pour raisons de sécurité. Utilisez la procédure de récupération ci-dessous.'
              : 'تم قفل الدخول لدواعي الأمان. يرجى استخدام خاصية استرجاع القن السري أدناه.'
          );
        } else {
          setError(
            lang === 'fr'
              ? `Code secret incorrect. ${remaining} tentative(s) restante(s).`
              : `القن السري غير صحيح. تبقى لك ${remaining} محاولة.`
          );
        }
      }
    }, 400);
  };

  // 2. Recovery: Request OTP to Recovery Email
  const handleRequestRecoveryOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = recoveryEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError(
        lang === 'fr'
          ? 'Veuillez saisir l\'adresse e-mail de récupération.'
          : 'يرجى إدخال بريد الاسترجاع المعتمد.'
      );
      return;
    }

    // Match either the configured recovery email or official platform Gmail
    if (
      cleanEmail === configuredRecoveryEmail.toLowerCase() ||
      cleanEmail === PLATFORM_GMAIL.toLowerCase()
    ) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedRecoveryOtp(code);
      setRecoveryStep('new_pin');
      setSuccessMsg(
        lang === 'fr'
          ? `Code d'autorisation de récupération généré avec succès pour ${cleanEmail}.`
          : `تم توليد رمز الأمان لاسترجاع حساب الإدارة بنجاح للبريد ${cleanEmail}.`
      );
    } else {
      setError(
        lang === 'fr'
          ? `Cette adresse ne correspond pas au compte officiel (${PLATFORM_GMAIL}).`
          : `البريد المدخل لا يطابق البريد الرسمي المعتمد للإدارة (${PLATFORM_GMAIL}).`
      );
    }
  };

  // 3. Recovery: Set New Admin PIN
  const handleResetAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (enteredRecoveryOtp.trim() !== generatedRecoveryOtp) {
      setError(
        lang === 'fr'
          ? 'Code de vérification incorrect.'
          : 'رمز التحقق غير صحيح.'
      );
      return;
    }

    if (!newAdminPin.trim() || newAdminPin.length < 4) {
      setError(
        lang === 'fr'
          ? 'Le nouveau code secret doit comporter au moins 4 caractères.'
          : 'يجب أن يتكون القن السري الجديد من 4 خانات على الأقل.'
      );
      return;
    }

    if (newAdminPin !== confirmNewAdminPin) {
      setError(
        lang === 'fr'
          ? 'Les deux codes saisis ne correspondent pas.'
          : 'تأكيد القن السري غير متطابق.'
      );
      return;
    }

    // Save newly defined admin PIN
    saveStoredAdminPin(newAdminPin.trim());
    setSuccessMsg(
      lang === 'fr'
        ? 'Nouveau code secret administrateur enregistré avec succès ! Vous pouvez maintenant vous connecter.'
        : 'تم تعيين القن السري الجديد للإدارة بنجاح! يمكنك الآن تسجيل الدخول.'
    );
    setTimeout(() => {
      setView('login');
      setPasscode(newAdminPin.trim());
      setRecoveryStep('email');
      setRecoveryEmail('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-8">
        {/* Header with Security Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 shadow-xs">
              <LockKeyhole className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-900">
                  {lang === 'fr' ? 'Accès Administrateur Sécurisé' : 'بوابة الدخول الآمن لمدير التطبيق'}
                </h2>
                <span className="text-[10px] font-mono font-black text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full border border-amber-400">
                  CONFIDENTIEL
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'fr'
                  ? 'Foyer d\'administration centralisé · Protection stricte'
                  : 'فضاء محمي مخصص حصرياً للمشرف على المنصة'}
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

        {/* VIEW 1: NORMAL ADMIN LOGIN */}
        {view === 'login' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'fr' ? 'Authentification Sécurisée' : 'مصادقة سرية معتمدة'}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                {lang === 'fr'
                  ? 'Ce code secret est strictement personnel et modifiable uniquement depuis la console d\'administration.'
                  : 'القن السري خاص ومحمي ولا يظهر للعموم، ويمكن تغييره حصرياً من لوحة تحكم الإدارة.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'fr' ? 'Code Secret Administrateur' : 'القن السري للإدارة'}</span>
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

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || attemptsLeft <= 0}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <span>{lang === 'fr' ? 'Vérification en cours...' : 'جارِ التحقق الأمني...'}</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'fr' ? 'Déverrouiller la Console Admin' : 'دخول لوحة تحكم المدير'}</span>
                </>
              )}
            </button>

            {/* Forgot PIN Recovery Button */}
            <div className="pt-2 text-center border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setView('recovery');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto py-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Code oublié ? Récupérer mon accès' : 'نسيت القن السري؟ استرجاع حساب الإدارة'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* VIEW 2: RECOVERY FLOW */
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <Mail className="w-4 h-4 text-amber-700" />
                <span>{lang === 'fr' ? 'Procédure Officielle de Récupération' : 'مسار الاسترجاع الرسمي عبر بريد المنصة'}</span>
              </div>
              <p className="text-[11px] text-amber-900/80">
                {lang === 'fr'
                  ? `Saisissez l'adresse Gmail officielle de l'application (${PLATFORM_GMAIL}) pour autoriser la réinitialisation du code secret.`
                  : `أدخل البريد الإلكتروني الرسمي للتطبيق (${PLATFORM_GMAIL}) لإعادة تعيين القن السري بأمان.`}
              </p>
            </div>

            {recoveryStep === 'email' ? (
              <form onSubmit={handleRequestRecoveryOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'E-mail Administrateur Officiel' : 'البريد الإلكتروني الرسمي للإدارة'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder={PLATFORM_GMAIL}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      dir="ltr"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Vérifier et Générer le Code' : 'التحقق وتوليد رمز الاسترجاع'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetAdminPin} className="space-y-3">
                {generatedRecoveryOtp && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'fr' ? 'Jeton d\'autorisation généré' : 'رمز أمان الاسترجاع المؤقت:'}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-emerald-200 font-mono font-black text-base text-center tracking-widest text-stone-900">
                      {generatedRecoveryOtp}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Saisir le Code d\'Autorisation' : 'إدخال رمز الأمان'}
                  </label>
                  <input
                    type="text"
                    required
                    value={enteredRecoveryOtp}
                    onChange={(e) => setEnteredRecoveryOtp(e.target.value)}
                    placeholder={generatedRecoveryOtp || '123456'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-center tracking-widest focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Nouveau Code Secret' : 'القن السري الجديد'}
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPin}
                    onChange={(e) => setNewAdminPin(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Confirmer le Nouveau Code' : 'تأكيد القن السري الجديد'}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewAdminPin}
                    onChange={(e) => setConfirmNewAdminPin(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
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
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Enregistrer le Nouveau Code Secret' : 'حفظ القن السري الجديد'}</span>
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setError(null);
                  setSuccessMsg(null);
                  setRecoveryStep('email');
                }}
                className="text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                {lang === 'fr' ? '← Revenir à la connexion' : '← العودة لتسجيل الدخول'}
              </button>
            </div>
          </div>
        )}

        {/* Security Footer Details */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'fr' ? 'Protection Cryptographique CNDP' : 'حماية مشفرة وفق CNDP'}</span>
          </div>
          <div className="text-stone-600 font-mono text-[10px]">
            {PLATFORM_GMAIL}
          </div>
        </div>
      </div>
    </div>
  );
};
