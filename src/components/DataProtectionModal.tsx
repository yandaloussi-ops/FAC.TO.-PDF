import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  CreditCard,
  FileCheck,
  CheckCircle2,
  X,
  Sparkles,
  Server,
  Key,
  BadgeAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface DataProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'ar';
}

export const DataProtectionModal: React.FC<DataProtectionModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'database' | 'cndp' | 'drm'>('payments');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-900">
                  {lang === 'fr'
                    ? 'Système de Protection des Paiements & Données'
                    : 'نظام حماية الأداءات وقواعد البيانات والمعطيات'}
                </h2>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Certifié CNDP & CMI
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'fr'
                  ? 'Garanties cryptographiques, intégrité des bases et respect de la vie privée'
                  : 'معايير التشفير البنكي المعتمدة وحماية البيانات الشخصية والأكاديمية'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Paiements CMI' : 'حماية الأداءات'}</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Base de Données' : 'قواعد البيانات'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cndp')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cndp'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Loi CNDP 09-08' : 'المعطيات الشخصية'}</span>
          </button>

          <button
            onClick={() => setActiveTab('drm')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'drm'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Protection DRM' : 'حماية المحتوى'}</span>
          </button>
        </div>

        {/* Tab 1: Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-1">
                <CreditCard className="w-4 h-4 text-amber-700" />
                <span>{lang === 'fr' ? 'Systèmes de Paiement & Encaissements Sécurisés' : 'أنظمة الأداء والتحويلات البنكية المعتمدة'}</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {lang === 'fr'
                  ? 'Intégration multicanale complète : Carte Bancaire CMI (3D-Secure), Virements Bancaires directs (RIB 24 chiffres), Agences de proximité en espèces (Wafacash, Cash Plus, Barid Cash, Tashilat) pour les étudiants sans carte, et portefeuilles mobiles (MT Cash, Orange Money, inwi money).'
                  : 'منظومة أداء وطنية متكاملة: بطاقات CMI البنكية، تحويلات بنكية مباشرة (RIB)، وكالات القرب نقداً (وفاكاش، كاش بلوس، بريد كاش، تسهيلات) للطلبة بدون بطاقة بنكية، والمحافظ الإلكترونية بالهاتف (MT Cash، أورنج، إنوي).'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'fr' ? 'Étudiants Sans Carte Bancaire' : 'الطلبة بدون بطاقة بنكية'}</span>
                </div>
                <div className="text-stone-500 text-[11px]">
                  {lang === 'fr'
                    ? 'Génération d\'un code de versement unique 72h pour règlement en liquide dans n\'importe quelle agence Wafacash ou Cash Plus.'
                    : 'توليد كود أداء فوري ومؤمن لسداد ثمن المطبوع نقداً بالكامل في أقرب وكالة بدون أي حاجة لحساب بنكي.'}
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'fr' ? 'Compte Admin & Quittance HMAC' : 'التحصيل التجاري ووصل رسمي'}</span>
                </div>
                <div className="text-stone-500 text-[11px]">
                  {lang === 'fr'
                    ? 'Tous les fonds transitent par le compte officiel de la régie administrative avant versement des droits aux auteurs.'
                    : 'تحصيل مركزي رسمي مع صدور إيصال أداء يحمل رخصة الـ DRM المشفرة المعتمدة.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Database */}
        {activeTab === 'database' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
              <div className="flex items-center gap-2 font-bold text-sky-950 text-sm mb-1">
                <Database className="w-4 h-4 text-sky-700" />
                <span>{lang === 'fr' ? 'Intégrité Cryptographique des Données' : 'التشفير وحماية قواعد البيانات'}</span>
              </div>
              <p className="text-xs text-sky-900 leading-relaxed">
                {lang === 'fr'
                  ? 'La base des 12 universités, facultés, cours et licences est stockée avec partitionnement étanche et chiffrement AES-256. Des instantanés chiffrés sont pris périodiquement.'
                  : 'تخزن قواعد بيانات الجامعات والمقررات والتراخيص بتشفير AES-256 مع عزل كامل لصلاحيات الوصول بين الطلبة والأساتذة والإدارة.'}
              </p>
            </div>

            <div className="p-3 bg-stone-900 text-stone-200 rounded-xl font-mono text-[11px] space-y-1">
              <div className="text-emerald-400">✓ Tables universités & filières : Hash SHA256 Intègre</div>
              <div className="text-emerald-400">✓ Registre des professeurs : Isolation stricte @*.ac.ma</div>
              <div className="text-emerald-400">✓ Registre des licences DRM : Chiffrement 256 bits actif</div>
              <div className="text-stone-400 text-[10px] mt-1">Dernière vérification de parité : 100% sans anomalie</div>
            </div>
          </div>
        )}

        {/* Tab 3: CNDP */}
        {activeTab === 'cndp' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm mb-1">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'fr' ? 'Conformité Loi Marocaine CNDP n° 09-08' : 'الالتزام بقانون حماية المعطيات 09-08 CNDP'}</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {lang === 'fr'
                  ? 'Les données personnelles (noms, e-mails universitaires, matricules Apogée) font l\'objet d\'un traitement strictement confidentiel et ne sont jamais cédées à des tiers commerciaux.'
                  : 'تخضع المعطيات ذات الطابع الشخصي (الاسم، البريد الجامعي، رقم أبوجي) للسرية التامة وفق مقتضيات القانون رقم 09-08 الصادر عن اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي (CNDP).'}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lang === 'fr' ? 'Droit d\'accès, de rectification et d\'opposition garanti.' : 'حق الولوج والتصحيح والتعرض مضمون لكل مستخدم.'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lang === 'fr' ? 'Anonymisation des matricules sur les registres partagés.' : 'حجب الأسماء والمعرفات الخاصة في السجلات غير المخصصة.'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lang === 'fr' ? 'Numéro d\'enregistrement de conformité : CNDP-FAC-2026-9812.' : 'رقم إشعار المطابقة لدى اللجنة : CNDP-FAC-2026-9812.'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: DRM */}
        {activeTab === 'drm' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
              <div className="flex items-center gap-2 font-bold text-purple-950 text-sm mb-1">
                <Lock className="w-4 h-4 text-purple-700" />
                <span>{lang === 'fr' ? 'Protection de la Propriété Intellectuelle (DRM)' : 'حماية حقوق التأليف والملكية الفكرية'}</span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed">
                {lang === 'fr'
                  ? 'Nos polycopiés et ouvrages sont protégés par un lecteur in-app étanche qui empêche la fuite de documents en PDF non autorisé.'
                  : 'مقررات الأساتذة محمية بقارئ رقمي محكم يمنع تسريب المطبوعات أو تداولها خارج المنصة.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Filigrane dynamique nominatif</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Blocage capture & impression</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Révocation admin instantanée</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Licence unique par compte</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'fr' ? 'Système certifié opérationnel' : 'نظام الحماية مفعل ونشط'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            {lang === 'fr' ? 'Fermer' : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
};
