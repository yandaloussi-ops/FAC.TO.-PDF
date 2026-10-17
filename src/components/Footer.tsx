import React from 'react';
import { ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';

interface FooterProps {
  lang: 'fr' | 'ar';
  onOpenDataProtectionModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenDataProtectionModal }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-extrabold text-white tracking-tight">FAC en PDF</span>
              <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                DRM Conforme
              </span>
              <span className="text-xs bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800">
                Loi CNDP 09-08
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-md leading-relaxed mb-3">
              {lang === 'fr'
                ? 'Plateforme numérique pour l\'accès sécurisé aux polycopiés et manuels universitaires. Consultation exclusive in-app pour garantir les droits des auteurs et des universités.'
                : 'المنصة الرقمية الموحدة للقراءة الآمنة للمحاضرات والكتب الجامعية. حماية ملكية فكرية متطورة بدون روابط تحميل.'}
            </p>
            {/* Official Platform Gmail (Point 2) */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-700/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-stone-400">{lang === 'fr' ? 'Contact Officiel :' : 'البريد الرسمي للتطبيق:'}</span>
              <a
                href={`mailto:fac.en.pdf.maroc@gmail.com`}
                className="font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors"
                dir="ltr"
              >
                fac.en.pdf.maroc@gmail.com
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400">
            {onOpenDataProtectionModal && (
              <button
                onClick={onOpenDataProtectionModal}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 hover:bg-emerald-900/60 cursor-pointer transition-colors shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'fr' ? 'Système de Sécurité & CNDP' : 'نظام حماية البيانات والأداءات'}</span>
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>{lang === 'fr' ? 'Partenariats Universitaires' : 'شراكات جامعية معتمدة'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>{lang === 'fr' ? 'Polycopiés Conformes aux Programmes' : 'مناهج مطابقة للمقررات'}</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} FAC en PDF. {lang === 'fr' ? 'Tous droits réservés.' : 'جميع الحقوق محفوظة.'}
          </div>
          <div className="flex items-center gap-4">
            {onOpenDataProtectionModal && (
              <button
                onClick={onOpenDataProtectionModal}
                className="hover:text-stone-300 underline cursor-pointer"
              >
                {lang === 'fr' ? 'Protection des Données & CNDP (Loi 09-08)' : 'حماية المعطيات الشخصية (قانون 09-08)'}
              </button>
            )}
            <span aria-hidden="true">·</span>
            <span>{lang === 'fr' ? 'Charte Anti-Piratage Universitaire' : 'ميثاق حماية الملكية الفكرية'}</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'fr' ? 'Conditions d\'Utilisation des Licences' : 'شروط التراخيص الفردية'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

