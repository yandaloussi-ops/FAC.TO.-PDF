import React from 'react';
import {
  ShieldCheck,
  BookOpen,
  Languages,
  Home,
  Award,
  Sparkles,
  Building2,
  Lock,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { FacLogo } from './FacLogo';
import { Professor } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'catalog' | 'library' | 'drm-info' | 'admin';
  onSelectTab: (tab: 'home' | 'catalog' | 'library' | 'drm-info' | 'admin') => void;
  onOpenProfessorPortal?: () => void;
  onOpenProfessorRegister?: () => void;
  onOpenUniversitiesModal?: () => void;
  onOpenStudentAuth?: () => void;
  onOpenAdmin?: () => void;
  isAdminAuthenticated?: boolean;
  onLockAdmin?: () => void;
  onOpenDataProtectionModal?: () => void;
  authenticatedProfessor?: Professor | null;
  onLogoutProfessor?: () => void;
  lang: 'fr' | 'ar';
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenProfessorPortal,
  onOpenProfessorRegister,
  onOpenUniversitiesModal,
  onOpenStudentAuth,
  onOpenAdmin,
  isAdminAuthenticated = false,
  onLockAdmin,
  onOpenDataProtectionModal,
  authenticatedProfessor,
  onLogoutProfessor,
  lang,
  onToggleLang,
}) => {
  return (
    <header className="sticky top-0 z-40 relative backdrop-blur-xl bg-stone-950/90 text-white border-b border-amber-500/20 shadow-2xl transition-all">
      {/* Ambient luxury lighting overlays in header background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-12 -left-12 w-64 h-24 bg-amber-500/15 rounded-full blur-2xl" />
        <div className="absolute top-0 right-1/4 w-80 h-16 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-6 right-8 w-48 h-20 bg-amber-600/10 rounded-full blur-2xl" />
        {/* Subtle geometric hairline border */}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/35 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
        {/* Zone 1: Bespoke Brand Logo with Insignia & Quick Home button */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => onSelectTab('home')}
            className="text-left group cursor-pointer focus:outline-none transition-transform hover:scale-[1.01]"
            title="FAC en PDF — Accueil / الرئيسية"
          >
            <FacLogo size="md" />
          </button>

          {/* Quick Home Button (Restyled Modern Pill) */}
          <button
            onClick={() => onSelectTab('home')}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                : 'text-stone-300 hover:text-white hover:bg-stone-850/80 border border-stone-800'
            }`}
            title="Revenir à la page d'accueil / العودة للرئيسية"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'fr' ? 'Accueil' : 'الرئيسية'}</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links with Polish */}
        <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold text-stone-300">
          <button
            onClick={() => onSelectTab('catalog')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'catalog'
                ? 'bg-stone-800 text-white font-bold border border-amber-500/40 shadow-xs'
                : 'hover:text-white hover:bg-stone-900 border border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'fr' ? 'Bibliothèque Publique' : 'المعرض العام للمكتبة'}</span>
          </button>

          {/* Direct Universities & Faculties Database modal trigger */}
          {onOpenUniversitiesModal && (
            <button
              onClick={onOpenUniversitiesModal}
              className="px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-sky-300 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-600/40 hover:border-sky-400 shadow-2xs"
              title="Base de données des 12 universités et facultés - Test rapide sans saisie"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'fr' ? 'Universités & Facultés' : 'الجامعات والكليات'}</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('library')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'library'
                ? 'bg-stone-800 text-white font-bold border border-amber-500/40 shadow-xs'
                : 'hover:text-white hover:bg-stone-900 border border-transparent'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'fr' ? 'Profil Étudiant' : 'بروفايل الطالب'}</span>
          </button>

          <button
            onClick={() => onSelectTab('drm-info')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'drm-info'
                ? 'bg-stone-800 text-white font-bold border border-amber-500/40 shadow-xs'
                : 'hover:text-white hover:bg-stone-900 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'fr' ? 'Sécurité DRM' : 'نظام الحماية'}</span>
          </button>

          {/* Data Protection & CNDP Shield Trigger */}
          {onOpenDataProtectionModal && (
            <button
              onClick={onOpenDataProtectionModal}
              className="px-3 py-1.5 rounded-xl hover:text-emerald-300 hover:bg-stone-900 border border-emerald-900/60 transition-all cursor-pointer flex items-center gap-1.5 text-emerald-400 shadow-xs"
              title="Système de protection des paiements, BDD et conformité CNDP"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'fr' ? 'Protection CNDP & CMI' : 'حماية المعطيات CNDP'}</span>
            </button>
          )}

          {/* Professor Free Inscription trigger in Nav (shown only if not already logged in) */}
          {!authenticatedProfessor && onOpenProfessorRegister && (
            <button
              onClick={onOpenProfessorRegister}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Rejoignez gratuitement la plateforme en tant qu'enseignant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'fr' ? 'Espace Enseignants' : 'فضاء الأساتذة'}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Restyled Action Buttons (Professor Authentication + Lang + GORGEOUS ADMIN BUTTON) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Professor Portal Access (Gated with Institutional Email Auth) */}
          {onOpenProfessorPortal && (
            <>
              {authenticatedProfessor ? (
                /* Authenticated Professor Chip with Logout */
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/50 px-2.5 py-1.5 rounded-xl">
                  <button
                    onClick={onOpenProfessorPortal}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white cursor-pointer"
                    title="Ouvrir mon espace enseignant sécurisé"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[120px]">{authenticatedProfessor.fullName}</span>
                  </button>

                  {onLogoutProfessor && (
                    <button
                      onClick={onLogoutProfessor}
                      className="p-1 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Se déconnecter / تسجيل الخروج"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                /* Unauthenticated: Protected Portal Button */
                <button
                  onClick={onOpenProfessorPortal}
                  className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-600/40 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                  title="Accès sécurisé réservé aux enseignants (Authentification e-mail @*.ac.ma)"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'fr' ? 'Profil Enseignant' : 'بروفايل الأستاذ'}</span>
                </button>
              )}
            </>
          )}

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white px-3 py-2 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-900/60 hover:bg-stone-850 transition-all cursor-pointer shadow-xs"
            title="Changer de langue / تغيير اللغة"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'fr' ? 'العربية' : 'Français'}</span>
          </button>

          {/* GORGEOUS ADMIN BUTTON (GATED & SECURE) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  onSelectTab(currentTab === 'admin' ? 'home' : 'admin');
                } else if (onOpenAdmin) {
                  onOpenAdmin();
                } else {
                  onSelectTab('admin');
                }
              }}
              className={`group relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-md ${
                currentTab === 'admin'
                  ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 shadow-amber-500/30'
                  : isAdminAuthenticated
                  ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 border border-amber-300/50 hover:shadow-lg hover:shadow-amber-500/25'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 border border-amber-300/50 hover:shadow-lg hover:shadow-amber-500/25'
              }`}
              title={
                isAdminAuthenticated
                  ? 'Console d\'Administration Déverrouillée (حساب المدير)'
                  : 'Console d\'Administration Sécurisée — Accès Super-Administrateur Réservé'
              }
            >
              {isAdminAuthenticated ? (
                /* Active admin indicator */
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-950 opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-950"></span>
                </span>
              ) : (
                /* Protected Lock Icon */
                <Lock className="w-3.5 h-3.5 text-stone-950" />
              )}

              <ShieldCheck className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-wider font-extrabold text-[12px]">ADMIN</span>

              {isAdminAuthenticated && (
                <span className="hidden sm:inline-block text-[9px] font-bold bg-stone-950/20 px-1 py-0.2 rounded">
                  ACTIF
                </span>
              )}
            </button>

            {/* Quick Lock Button if Admin is Authenticated */}
            {isAdminAuthenticated && onLockAdmin && (
              <button
                onClick={onLockAdmin}
                className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-850 rounded-xl transition-colors cursor-pointer border border-stone-800"
                title={lang === 'fr' ? 'Verrouiller la console admin' : 'قفل لوحة المدير'}
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
