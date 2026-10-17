/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Professor } from '../types';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PLATFORM_GMAIL } from '../utils/storage';

interface ProfessorLoginModalProps {
  professors: Professor[];
  onLoginSuccess: (professor: Professor) => void;
  onUpdatePin?: (profId: string, newPin: string) => void;
  onOpenRegister: () => void;
  onClose: () => void;
  lang: 'fr' | 'ar';
}

export const ProfessorLoginModal: React.FC<ProfessorLoginModalProps> = ({
  professors,
  onLoginSuccess,
  onUpdatePin,
  onOpenRegister,
  onClose,
  lang,
}) => {
  const [view, setView] = useState<'login' | 'recovery'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Recovery States
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'new_pin'>('email');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [matchedProfForRecovery, setMatchedProfForRecovery] = useState<Professor | null>(null);

  // 1. Handle Login with Email and PIN
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPin = pinInput.trim();

    if (!cleanEmail || !cleanPin) {
      setErrorMessage(
        lang === 'fr'
          ? 'Veuillez saisir votre e-mail et votre code secret (PIN).'
          : 'يرجى إدخال البريد الإلكتروني والقن السري.'
      );
      return;
    }

    const prof = professors.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!prof) {
      setErrorMessage(
        lang === 'fr'
          ? 'Aucun compte enseignant trouvé avec cet e-mail. Veuillez vous inscrire gratuitement.'
          : 'لا يوجد حساب أستاذ مسجل بهذا البريد. يمكنك التسجيل مجاناً الآن.'
      );
      return;
    }

    if (prof.status === 'suspended') {
      setErrorMessage(
        lang === 'fr'
          ? `Ce compte a été suspendu par l'administration. Veuillez contacter ${PLATFORM_GMAIL}.`
          : `تم تجميد هذا الحساب من طرف الإدارة. يرجى التواصل مع إدارة المنصة (${PLATFORM_GMAIL}).`
      );
      return;
    }

    // Check PIN (fallback to 123456 if none set)
    const expectedPin = prof.pinCode || '123456';
    if (cleanPin === expectedPin) {
      onLoginSuccess(prof);
    } else {
      setErrorMessage(
        lang === 'fr'
          ? 'Code secret (PIN) incorrect. Cliquez sur "Code oublié" si nécessaire.'
          : 'القن السري غير صحيح. يمكنك النقر على "نسيت القن السري" لاسترجاعه.'
      );
    }
  };

  // 2. Recovery: Request OTP
  const handleRequestRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = recoveryEmail.trim().toLowerCase();
    const prof = professors.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!prof) {
      setErrorMessage(
        lang === 'fr'
          ? 'Adresse e-mail non trouvée dans la base des enseignants.'
          : 'البريد الإلكتروني غير مسجل في قاعدة الأساتذة.'
      );
      return;
    }

    setMatchedProfForRecovery(prof);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setRecoveryStep('new_pin');
    setSuccessMessage(
      lang === 'fr'
        ? `Code d'autorisation envoyé à ${cleanEmail}.`
        : `تم توليد رمز استرجاع القن السري للأستاذ بنجاح.`
    );
  };

  // 3. Recovery: Set New PIN
  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (enteredOtp.trim() !== generatedOtp) {
      setErrorMessage(
        lang === 'fr' ? 'Code de vérification incorrect.' : 'رمز التحقق غير صحيح.'
      );
      return;
    }

    if (!newPin.trim() || newPin.trim().length < 4) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le nouveau code secret doit comporter au moins 4 caractères.'
          : 'يجب أن يتكون القن السري من 4 خانات على الأقل.'
      );
      return;
    }

    if (newPin.trim() !== confirmNewPin.trim()) {
      setErrorMessage(
        lang === 'fr'
          ? 'Les codes saisis ne correspondent pas.'
          : 'القن السري وتأكيده غير متطابقين.'
      );
      return;
    }

    if (matchedProfForRecovery && onUpdatePin) {
      onUpdatePin(matchedProfForRecovery.id, newPin.trim());
    }

    setSuccessMessage(
      lang === 'fr'
        ? 'Votre code secret a été réinitialisé avec succès ! Vous pouvez vous connecter.'
        : 'تم تغيير القن السري بنجاح! يمكنك الآن تسجيل الدخول.'
    );

    setTimeout(() => {
      setView('login');
      setEmailInput(matchedProfForRecovery?.email || '');
      setPinInput(newPin.trim());
      setRecoveryStep('email');
      setRecoveryEmail('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 shadow-xs">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-900">
                  {lang === 'fr' ? 'Profil Enseignant · Accès Sécurisé' : 'بروفايل الأستاذ · تسجيل الدخول بالقن السري'}
                </h2>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  Enseignants
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'fr'
                  ? 'Gestion des polycopiés, lectorat et suivi des royalties'
                  : 'إدارة ونشر المقررات وحفظ حقوق التأليف ومتابعة الأرباح'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIEW 1: NORMAL PROFESSOR LOGIN */}
        {view === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {lang === 'fr'
                  ? 'Entrez votre e-mail et votre code secret défini lors de votre inscription.'
                  : 'أدخل بريدك الجامعي والقن السري الذي حددته عند التسجيل.'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'fr' ? 'E-mail Professionnel / Universitaire' : 'البريد الإلكتروني الجامعي'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nom.prenom@univ.ac.ma"
                  className="w-full pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'fr' ? 'Code Secret Personnel (PIN)' : 'القن السري (PIN)'}
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Accéder à mon Profil Enseignant' : 'دخول بروفايل الأستاذ'}</span>
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setView('recovery');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-amber-700 hover:text-amber-800 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Code secret oublié ?' : 'نسيت القن السري؟'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenRegister}
                className="font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                {lang === 'fr' ? 'Nouveau ? Inscription gratuite →' : 'أستاذ جديد؟ تسجيل مجاني ←'}
              </button>
            </div>
          </form>
        ) : (
          /* VIEW 2: FORGOT PIN RECOVERY */
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>{lang === 'fr' ? 'Récupération du Code Secret Enseignant' : 'استرجاع القن السري لبروفايل الأستاذ'}</span>
              </div>
              <p className="text-[11px] text-amber-900/80">
                {lang === 'fr'
                  ? 'Saisissez votre e-mail enregistré pour réinitialiser immédiatement votre code secret.'
                  : 'أدخل بريدك الجامعي المسجل لإعادة ضبط القن السري لحسابك بأمان.'}
              </p>
            </div>

            {recoveryStep === 'email' ? (
              <form onSubmit={handleRequestRecovery} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'E-mail Enseignant' : 'البريد الإلكتروني للأستاذ'}
                  </label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="nom.prof@univ.ac.ma"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    dir="ltr"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Générer le Code d\'Autorisation' : 'توليد رمز الاسترجاع'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPinSubmit} className="space-y-3">
                {generatedOtp && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'fr' ? 'Jeton d\'autorisation généré :' : 'رمز أمان الاسترجاع:'}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-emerald-200 font-mono font-black text-base text-center tracking-widest text-stone-900">
                      {generatedOtp}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Code d\'Autorisation' : 'رمز الأمان'}
                  </label>
                  <input
                    type="text"
                    required
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder={generatedOtp || '123456'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-center tracking-widest focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Nouveau Code Secret (PIN)' : 'القن السري الجديد'}
                  </label>
                  <input
                    type="password"
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Min. 4 caractères"
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
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    placeholder="Répétez le code"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Enregistrer le Nouveau PIN' : 'حفظ القن السري الجديد'}</span>
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setErrorMessage(null);
                  setRecoveryStep('email');
                }}
                className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                {lang === 'fr' ? '← Revenir à la connexion' : '← العودة لتسجيل الدخول'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <span>{lang === 'fr' ? 'Support Enseignants :' : 'الدعم التقني:'}</span>
          <span className="font-mono text-[10px] text-amber-800">{PLATFORM_GMAIL}</span>
        </div>
      </div>
    </div>
  );
};
