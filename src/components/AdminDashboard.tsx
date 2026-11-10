import React, { useState, useEffect } from 'react';
import { 
  Book, Key, Users, GraduationCap, Building2, Building, Receipt, ArrowLeftRight, 
  Plus, ShieldCheck, RefreshCw, Trash2, Ban, CheckCircle, Upload, Phone, ExternalLink,
  CreditCard, CheckCircle2, AlertCircle, X, DollarSign, Wallet
} from 'lucide-react';
import { 
  subscribeToBooks, 
  subscribeToProfessors, 
  subscribeToStudents, 
  subscribeToTransactions, 
  deleteBookFromFirestore, 
  deleteStudentFromFirestore, 
  deleteProfessorFromFirestore,
  saveStudentToFirestore,
  saveProfessorToFirestore,
  recordTransactionInFirestore
} from '../services/firestoreService';
import { doc, updateDoc, setDoc, deleteDoc, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const AdminDashboard: React.FC<{ books?: any[]; professors?: any[]; lang?: string; onToggleLang?: () => void }> = ({ books = [], professors = [], lang = 'fr', onToggleLang }) => {
  const [activeTab, setActiveTab] = useState('livres');
  
  // Data States
  const [internalBooks, setInternalBooks] = useState<any[]>(books);
  const [internalProfessors, setInternalProfessors] = useState<any[]>(professors);
  const [students, setStudents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<any[]>([]);
  const [drmCodes, setDrmCodes] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Virement Modal State
  const [payoutModalProf, setPayoutModalProf] = useState<any | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutRef, setPayoutRef] = useState<string>('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Sync with props if they change
  useEffect(() => {
    if (books && books.length > 0) setInternalBooks(books);
  }, [books]);

  useEffect(() => {
    if (professors && professors.length > 0) setInternalProfessors(professors);
  }, [professors]);

  // Real-time synchronization with Firestore
  useEffect(() => {
    const unsubBooks = subscribeToBooks((data) => {
      if (data && data.length > 0) setInternalBooks(data);
      setLoading(false);
    });

    const unsubProfessors = subscribeToProfessors((data) => {
      if (data && data.length > 0) setInternalProfessors(data);
    });

    const unsubStudents = subscribeToStudents((data) => {
      setStudents(data || []);
    });

    const unsubTx = subscribeToTransactions((data) => {
      setTransactions(data || []);
    });

    // Payment Orders Subscription (reçus et commandes des étudiants)
    const unsubOrders = onSnapshot(collection(db, 'paymentOrders'), (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPaymentOrders(orders || []);
    }, (err) => console.error("Error fetching payment orders:", err));

    // DRM Keys Subscription
    const unsubDrm = onSnapshot(collection(db, 'drm_keys'), (snapshot) => {
      const codes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrmCodes(codes || []);
      setLoading(false);
    }, (err) => console.error("Error fetching DRM codes:", err));

    // Payouts (Virements) Subscription
    const unsubPayouts = onSnapshot(collection(db, 'payouts'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayouts(list || []);
    }, (err) => console.error("Error fetching payouts:", err));

    return () => {
      unsubBooks();
      unsubProfessors();
      unsubStudents();
      unsubTx();
      unsubOrders();
      unsubDrm();
      unsubPayouts();
    };
  }, []);

  const displayBooks = internalBooks.length > 0 ? internalBooks : books;
  const displayProfessors = internalProfessors.length > 0 ? internalProfessors : professors;

  // 1. Licences DRM Actives : Source unique et souveraine de vérité financière (exclut les révoquées et les données fictives / فلان الفلاني)
  const activeDrmCodes = drmCodes.filter(c => 
    c.status !== 'revoked' &&
    !c.studentName?.includes('فلان الفلاني') &&
    c.studentEmail !== 'etudiant@univ.ac.ma'
  );

  // 2. Calculs Financiers Globaux (Strictement calculés à partir des clés DRM actives vérifiées)
  const totalGross = activeDrmCodes.reduce((sum, c) => {
    const book = internalBooks.find(b => b.id === c.bookId || b.title === c.bookTitle);
    const price = Number(c.price || c.bookPrice || book?.priceMAD || book?.price || 23);
    return sum + price;
  }, 0);
  const platformPart = Math.round(totalGross * 0.20 * 100) / 100;
  const authorsPart = Math.round(totalGross * 0.80 * 100) / 100;
  const totalPaidToProfessors = payouts.reduce((sum, p) => sum + (Number(p.amountMAD) || 0), 0);
  const totalPendingPayouts = Math.max(0, Math.round((authorsPart - totalPaidToProfessors) * 100) / 100);

  // 3. Liste Filtrée : Uniquement les étudiants disposant d'au moins un مفتاح نشط (Active DRM Key)
  const activeStudentsWithKeys = React.useMemo(() => {
    const studentMap = new Map<string, any>();

    activeDrmCodes.forEach((c) => {
      const rawEmail = (c.studentEmail || '').trim().toLowerCase();
      const rawPhone = (c.studentPhone || '').replace(/\D/g, '');
      const studentIdentifier = rawEmail || (rawPhone ? `phone_${rawPhone}` : `id_${c.studentId || c.id}`);

      // Recherche correspondante dans la collection students
      const matchedProfile = students.find(s => {
        const sEmail = (s.email || '').trim().toLowerCase();
        const sPhone = (s.phone || '').replace(/\D/g, '');
        if (rawEmail && sEmail && rawEmail === sEmail) return true;
        if (rawPhone && sPhone && (rawPhone === sPhone || rawPhone.endsWith(sPhone.slice(-8)) || sPhone.endsWith(rawPhone.slice(-8)))) return true;
        if (c.studentId && s.id && c.studentId === s.id) return true;
        return false;
      });

      if (!studentMap.has(studentIdentifier)) {
        studentMap.set(studentIdentifier, {
          id: matchedProfile?.id || c.studentId || c.id,
          docId: matchedProfile?.id || null,
          fullName: matchedProfile?.fullName || matchedProfile?.name || c.studentName || 'Étudiant',
          name: matchedProfile?.name || matchedProfile?.fullName || c.studentName || 'Étudiant',
          email: matchedProfile?.email || c.studentEmail || '-',
          phone: matchedProfile?.phone || c.studentPhone || '',
          status: matchedProfile?.status || 'active',
          keys: [c],
          acquiredBookTitles: [c.bookTitle || 'Livre']
        });
      } else {
        const existing = studentMap.get(studentIdentifier);
        existing.keys.push(c);
        if (c.bookTitle && !existing.acquiredBookTitles.includes(c.bookTitle)) {
          existing.acquiredBookTitles.push(c.bookTitle);
        }
      }
    });

    return Array.from(studentMap.values());
  }, [activeDrmCodes, students]);

  // Helper date formatter
  const formatDate = (val: any) => {
    if (!val) return '-';
    if (val?.toDate) return val.toDate().toLocaleDateString('fr-FR');
    if (val?.seconds) return new Date(val.seconds * 1000).toLocaleDateString('fr-FR');
    const d = new Date(val);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fr-FR');
  };

  // Helper pour calculer les statistiques d'un professeur en temps réel (Strictement basé sur les clés DRM actives)
  const getProfStats = (p: any) => {
    // Clés DRM actives relatives aux ouvrages de cet enseignant
    const profActiveKeys = activeDrmCodes.filter(c => {
      const book = internalBooks.find(b => b.id === c.bookId || b.title === c.bookTitle);
      const authorMatch = (c.bookAuthor && p.fullName && c.bookAuthor.toLowerCase().includes(p.fullName.toLowerCase())) ||
                          (book?.author && p.fullName && book.author.toLowerCase().includes(p.fullName.toLowerCase())) ||
                          (book?.professorId && book.professorId === p.id);
      const titleMatch = (c.bookTitle && p.module && c.bookTitle.toLowerCase().includes(p.module.toLowerCase())) ||
                         (book?.module && p.module && book.module.toLowerCase().includes(p.module.toLowerCase()));
      return Boolean(authorMatch || titleMatch);
    });

    const salesCount = profActiveKeys.length;
    const grossMAD = profActiveKeys.reduce((sum, c) => {
      const book = internalBooks.find(b => b.id === c.bookId || b.title === c.bookTitle);
      const price = Number(c.price || c.bookPrice || book?.priceMAD || book?.price || 23);
      return sum + price;
    }, 0);
    const royaltiesMAD = Math.round(grossMAD * 0.80 * 100) / 100;

    // Virements déjà effectués pour ce professeur
    const profPayouts = payouts.filter(pay => pay.professorId === p.id || pay.professorName === p.fullName);
    const paidMAD = profPayouts.reduce((sum, pay) => sum + (Number(pay.amountMAD) || 0), (Number(p.paidAmountMAD) || 0));
    const pendingMAD = Math.max(0, Math.round((royaltiesMAD - paidMAD) * 100) / 100);

    return { salesCount, grossMAD, royaltiesMAD, paidMAD, pendingMAD, profPayouts };
  };

  // 1. Bouton Action: Toggling User Status (Geler / Activer)
  const handleToggleUserStatus = async (collectionName: 'students' | 'professors', userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      const userRef = doc(db, collectionName, userId);
      await setDoc(userRef, { status: newStatus, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error("Error toggling user status:", err);
      alert("Erreur lors de la mise à jour du statut (تجميد / تنشيط).");
    }
  };

  // 2. Bouton Action: Toggling DRM Status (Révoquer / Réactiver)
  const handleToggleDrmStatus = async (drmDocId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'revoked' ? 'active' : 'revoked';
      const ref = doc(db, 'drm_keys', drmDocId);
      await updateDoc(ref, { status: newStatus, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error("Error toggling DRM status:", err);
      alert("Erreur lors de la mise à jour de la licence DRM.");
    }
  };

  // 3. Bouton Action: Supprimer Définitivement (Corbeille / محو نهائي)
  const handleDeleteItem = async (type: 'student' | 'prof' | 'book' | 'drm' | 'order', id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet élément (سلة المهملات) ؟\nCette action est irréversible.")) return;
    try {
      if (type === 'student') {
        try {
          await deleteDoc(doc(db, 'students', id));
        } catch (e) {
          console.warn("Could not delete from students collection:", e);
        }
        // Supprimer également les clés DRM associées pour un nettoyage complet
        const studentObj = activeStudentsWithKeys.find(s => s.id === id || s.docId === id);
        if (studentObj?.keys) {
          for (const k of studentObj.keys) {
            try {
              await deleteDoc(doc(db, 'drm_keys', k.id));
            } catch (kErr) {
              console.warn("Could not delete linked DRM key:", kErr);
            }
          }
        }
      }
      if (type === 'prof') await deleteDoc(doc(db, 'professors', id));
      if (type === 'book') await deleteDoc(doc(db, 'books', id));
      if (type === 'drm') await deleteDoc(doc(db, 'drm_keys', id));
      if (type === 'order') await deleteDoc(doc(db, 'paymentOrders', id));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Erreur lors de la suppression de l'élément.");
    }
  };

  // 4. Enregistrement d'un virement bancaire pour un professeur
  const handleConfirmPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModalProf) return;
    if (payoutAmount <= 0) {
      alert("Veuillez saisir un montant de virement valide.");
      return;
    }
    if (!payoutRef.trim()) {
      alert("Veuillez renseigner le numéro de référence du virement bancaire.");
      return;
    }

    setIsSubmittingPayout(true);
    try {
      await addDoc(collection(db, 'payouts'), {
        professorId: payoutModalProf.id,
        professorName: payoutModalProf.fullName,
        amountMAD: Number(payoutAmount),
        bankRib: payoutModalProf.bankRib || '',
        bankName: payoutModalProf.bankName || '',
        reference: payoutRef.trim(),
        date: new Date().toISOString(),
        status: 'completed',
        createdAt: serverTimestamp()
      });

      alert(`Virement de ${payoutAmount} DH enregistré avec succès pour ${payoutModalProf.fullName}!`);
      setPayoutModalProf(null);
      setPayoutAmount(0);
      setPayoutRef('');
    } catch (err) {
      console.error("Error recording payout:", err);
      alert("Erreur lors de l'enregistrement du virement.");
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-6 text-stone-800 font-sans dir-ltr">
      
      {/* Top Header & Overview Cards */}
      <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Tableau de Bord de Gestion FAC en PDF</h1>
            <p className="text-xs text-stone-500">Supervision centrale des droits DRM, finances, enseignants et étudiants.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Synchronisation Firestore Active
            </span>
          </div>
        </div>
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-xs text-stone-500 font-medium">Souscriptions & Encaissements</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{totalGross.toFixed(2)} DH</p>
            <span className="text-[10px] text-stone-400">Total brut perçu</span>
          </div>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-xs text-stone-500 font-medium">Licences DRM Émises</span>
            <p className="text-xl font-bold text-amber-700 mt-1">{drmCodes.length}</p>
            <span className="text-[10px] text-stone-400">{drmCodes.filter(c => c.status !== 'revoked').length} actives · {drmCodes.filter(c => c.status === 'revoked').length} révoquées</span>
          </div>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-xs text-stone-500 font-medium">Reversé aux Auteurs (80%)</span>
            <p className="text-xl font-bold text-blue-700 mt-1">{authorsPart.toFixed(2)} DH</p>
            <span className="text-[10px] text-stone-400">Déjà viré: {totalPaidToProfessors.toFixed(2)} DH</span>
          </div>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-xs text-stone-500 font-medium">Enseignants & Étudiants Actifs</span>
            <p className="text-xl font-bold text-stone-800 mt-1">{displayProfessors.length} / {activeStudentsWithKeys.length}</p>
            <span className="text-[10px] text-stone-400">{displayProfessors.length} Enseignants · {activeStudentsWithKeys.length} Étudiants avec clé active</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-stone-300">
        {[
          { id: 'livres', label: 'Livres & Polycopiés', count: displayBooks.length, icon: Book },
          { id: 'drm', label: 'Licences DRM & Accès', count: drmCodes.length, icon: Key },
          { id: 'finance', label: 'Compte Commercial & Encaissement', count: Math.max(paymentOrders.length, transactions.length), icon: Building },
          { id: 'profs', label: 'Comptes des Enseignants', count: displayProfessors.length, icon: Users },
          { id: 'students', label: 'Comptes des Étudiants', count: activeStudentsWithKeys.length, icon: GraduationCap },
          { id: 'virements', label: 'Relevé des Virements & Droits', count: payouts.length, icon: ArrowLeftRight },
          { id: 'faculties', label: 'Facultés & Départements', count: 0, icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-stone-950 shadow-sm ring-1 ring-amber-500'
                  : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        
        {/* ========================================================= */}
        {/* Tab 1: Livres & Polycopiés */}
        {/* ========================================================= */}
        {activeTab === 'livres' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Inventaire des Polycopiés et Manuels</h2>
                <p className="text-xs text-stone-500">Contrôlez les tarifs et les affectations de cours.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                    <th className="p-3">TITRE & DISCIPLINE</th>
                    <th className="p-3">FACULTÉ / SEMESTRE</th>
                    <th className="p-3">PROFESSEUR / AUTEUR</th>
                    <th className="p-3">PRIX ÉTUDIANT</th>
                    <th className="p-3">STATUT DRM</th>
                    <th className="p-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {displayBooks.length === 0 ? (
                    <tr><td colSpan={6} className="p-4 text-center text-stone-400">Aucun livre enregistré</td></tr>
                  ) : (
                    displayBooks.map((b) => (
                      <tr key={b.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="p-3 font-semibold text-stone-900">{b.title}</td>
                        <td className="p-3">{b.faculty || '-'} / S{b.semester || '1'}</td>
                        <td className="p-3">{b.author || '-'}</td>
                        <td className="p-3 font-bold text-emerald-700">{b.priceMAD ?? b.price ?? 0} DH</td>
                        <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">Actif</span></td>
                        <td className="p-3">
                          <button 
                            onClick={() => handleDeleteItem('book', b.id)} 
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer" 
                            title="Supprimer définitivement (سلة المهملات)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Tab 2: Licences DRM & Accès (WITH REVOKE & TRASH BUTTONS) */}
        {/* ========================================================= */}
        {activeTab === 'drm' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Gestion des Licences & Codes d'Accès DRM</h2>
                <p className="text-xs text-stone-500">Contrôlez les accès étudiants : bouton de tjemid (إبطال) et bouton corbeille (محو نهائي).</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                    <th className="p-3">CLÉ DRM</th>
                    <th className="p-3">LIVRE ASSIGNÉ</th>
                    <th className="p-3">ÉTUDIANT BÉNÉFICIAIRE</th>
                    <th className="p-3">DATE D'ÉMISSION</th>
                    <th className="p-3">ÉTAT</th>
                    <th className="p-3">ACTIONS (CONTRÔLE)</th>
                  </tr>
                </thead>
                <tbody>
                  {drmCodes.length === 0 ? (
                    <tr><td colSpan={6} className="p-4 text-center text-stone-400">Aucune licence DRM enregistrée</td></tr>
                  ) : (
                    drmCodes.map((c) => {
                      const isRevoked = c.status === 'revoked';
                      const keyDisplay = c.key || c.code || c.id;
                      return (
                        <tr key={c.id} className={`border-b border-stone-100 hover:bg-stone-50 ${isRevoked ? 'bg-rose-50/40' : ''}`}>
                          <td className="p-3 font-mono text-amber-700 font-bold select-all">{keyDisplay}</td>
                          <td className="p-3 font-medium">{c.bookTitle || '-'}</td>
                          <td className="p-3">
                            <div className="font-semibold">{c.studentName || 'Étudiant'}</div>
                            <div className="text-[11px] text-stone-500">{c.studentEmail || '-'}</div>
                            {c.studentPhone && <div className="text-[10px] text-emerald-600 font-mono">{c.studentPhone}</div>}
                          </td>
                          <td className="p-3 text-stone-600">{formatDate(c.createdAt)}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isRevoked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isRevoked ? 'Révoqué (معطل/مجمد)' : 'Actif (نشط)'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {/* Bouton 1: Révoquer / Réactiver (تجميد / إعادة التنشيط) */}
                              <button
                                onClick={() => handleToggleDrmStatus(c.id, c.status || 'active')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                  isRevoked
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                }`}
                                title={isRevoked ? 'Réactiver la licence' : 'Révoquer la licence (bloquer l\'accès)'}
                              >
                                {isRevoked ? (
                                  <>
                                    <CheckCircle size={12} />
                                    <span>Réactiver</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban size={12} />
                                    <span>Révoquer</span>
                                  </>
                                )}
                              </button>

                              {/* WhatsApp Contact */}
                              {c.studentPhone && (
                                <a
                                  href={`https://wa.me/${c.studentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Bonjour ${c.studentName || ''}, concernant votre commande du livre ${c.bookTitle || ''} sur FAC en PDF:`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                                  title="Contacter sur WhatsApp"
                                >
                                  <Phone size={14} />
                                </a>
                              )}

                              {/* Bouton 2: Supprimer Définitivement (سلة المهملات 🗑️) */}
                              <button
                                onClick={() => handleDeleteItem('drm', c.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                title="Supprimer définitivement (سلة المهملات)"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Tab 3: Compte Commercial & Encaissement Admin */}
        {/* ========================================================= */}
        {activeTab === 'finance' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Journal des Règlements & Droits Académiques</h2>
                <p className="text-xs text-stone-500">Visualisez les reçus de paiement et vérifiez la conformité de chaque souscription.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                    <th className="p-3">RÉF. COMMANDE</th>
                    <th className="p-3">ÉTUDIANT PAYEUR</th>
                    <th className="p-3">LIVRE SOUSCRIT</th>
                    <th className="p-3">MONTANT</th>
                    <th className="p-3">RÉPARTITION (20% / 80%)</th>
                    <th className="p-3">REÇU DE PAIEMENT</th>
                    <th className="p-3">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentOrders.length === 0 && transactions.length === 0 ? (
                    <tr><td colSpan={7} className="p-4 text-center text-stone-400">Aucune commande enregistrée</td></tr>
                  ) : (
                    paymentOrders.map((ord) => {
                      const price = Number(ord.bookPrice) || 23;
                      const authorPartMAD = ord.authorPart ?? (price * 0.80);
                      const platformPartMAD = ord.platformPart ?? (price * 0.20);
                      return (
                        <tr key={ord.id} className="border-b border-stone-100 hover:bg-stone-50">
                          <td className="p-3 font-mono font-bold text-stone-900 select-all">{ord.id.slice(0, 10)}</td>
                          <td className="p-3">
                            <div className="font-semibold text-stone-900">{ord.studentName || 'Étudiant'}</div>
                            <div className="text-[11px] text-stone-500">{ord.studentEmail || '-'}</div>
                            {ord.studentPhone && <div className="text-[10px] text-emerald-600 font-mono">{ord.studentPhone}</div>}
                          </td>
                          <td className="p-3 font-medium text-stone-800">{ord.bookTitle || '-'}</td>
                          <td className="p-3 font-bold text-emerald-700">{price} DH</td>
                          <td className="p-3 text-[11px]">
                            <div className="text-blue-700 font-medium">Auteur: {authorPartMAD.toFixed(1)} DH</div>
                            <div className="text-stone-500">Plateforme: {platformPartMAD.toFixed(1)} DH</div>
                          </td>
                          <td className="p-3">
                            {ord.receiptUrl ? (
                              <a
                                href={ord.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                              >
                                <ExternalLink size={12} />
                                <span>Voir le reçu 🧾</span>
                              </a>
                            ) : (
                              <span className="text-stone-400">Aucun reçu</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {ord.studentPhone && (
                                <a
                                  href={`https://wa.me/${ord.studentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Bonjour ${ord.studentName || ''}, concernant votre reçu pour le livre ${ord.bookTitle || ''}:`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-bold transition-colors"
                                  title="Contacter sur WhatsApp"
                                >
                                  <Phone size={12} />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteItem('order', ord.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                title="Supprimer cette commande définitivement (سلة المهملات)"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Tab 4: Comptes des Enseignants (WITH GELER & CORBEILLE) */}
        {/* ========================================================= */}
        {activeTab === 'profs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Comptes des Enseignants & Droits d'Auteur</h2>
                <p className="text-xs text-stone-500">Gérez les comptes des professeurs : bouton de tjemid (تجميد الحساب) et bouton corbeille (سلة المهملات).</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                    <th className="p-3">ENSEIGNANT</th>
                    <th className="p-3">ÉTABLISSEMENT & RIB</th>
                    <th className="p-3">VENTES CUMULÉES</th>
                    <th className="p-3">DROITS DUS (80%)</th>
                    <th className="p-3">RESTE À PAYER</th>
                    <th className="p-3">STATUT</th>
                    <th className="p-3">ACTIONS (CONTRÔLE)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayProfessors.map((p) => {
                    const stats = getProfStats(p);
                    const isSuspended = p.status === 'suspended';
                    return (
                      <tr key={p.id} className={`border-b border-stone-100 hover:bg-stone-50 ${isSuspended ? 'bg-amber-50/40' : ''}`}>
                        <td className="p-3">
                          <div className="font-bold text-stone-900">{p.fullName}</div>
                          <div className="text-[11px] text-stone-500">{p.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-stone-800">{p.faculty || '-'}</div>
                          <div className="text-[10px] font-mono text-stone-500">{p.bankRib || 'RIB non renseigné'}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-stone-900">{stats.salesCount} ventes</td>
                        <td className="p-3 font-bold text-blue-700">{stats.royaltiesMAD.toFixed(2)} DH</td>
                        <td className="p-3 font-bold text-amber-700">{stats.pendingMAD.toFixed(2)} DH</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuspended ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isSuspended ? 'Suspendu (مجمد)' : 'Actif (نشط)'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {/* Bouton 1: Geler / Activer le compte de l'enseignant */}
                            <button
                              onClick={() => handleToggleUserStatus('professors', p.id, p.status || 'active')}
                              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                isSuspended
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                              title={isSuspended ? 'Activer le compte enseignant' : 'Geler le compte enseignant (تجميد)'}
                            >
                              {isSuspended ? <CheckCircle size={12} /> : <Ban size={12} />}
                              <span>{isSuspended ? 'Activer' : 'Geler'}</span>
                            </button>

                            {/* Bouton Virement Rapide */}
                            <button
                              onClick={() => {
                                setPayoutModalProf(p);
                                setPayoutAmount(Math.round(stats.pendingMAD));
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                              title="Effectuer un virement bancaire"
                            >
                              <DollarSign size={12} />
                              <span>Virer</span>
                            </button>

                            {/* Bouton 2: Supprimer Définitivement (سلة المهملات 🗑️) */}
                            <button 
                              onClick={() => handleDeleteItem('prof', p.id)} 
                              className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer" 
                              title="Supprimer définitivement (سلة المهملات)"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Tab 5: Comptes des Étudiants (STRICTEMENT CEUX AVEC CLÉ ACTIVE) */}
        {/* ========================================================= */}
        {activeTab === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Comptes des Étudiants Actifs (Détenteurs de Clés DRM)</h2>
                <p className="text-xs text-stone-500">Affichage exclusif des étudiants disposant d'un مفتاح نشط (ترخيص غير ملغى) لضمان دقة الحسابات المالية 100%.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                    <th className="p-3">ÉTUDIANT</th>
                    <th className="p-3">EMAIL ACADÉMIQUE</th>
                    <th className="p-3">TÉLÉPHONE / WHATSAPP</th>
                    <th className="p-3">LIVRES DÉBLOQUÉS (CLÉS ACTIVES)</th>
                    <th className="p-3">STATUT</th>
                    <th className="p-3">ACTIONS (CONTRÔLE)</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudentsWithKeys.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-stone-400">Aucun étudiant avec clé DRM active enregistré</td></tr>
                  ) : (
                    activeStudentsWithKeys.map((s) => {
                      const isSuspended = s.status === 'suspended';
                      return (
                        <tr key={s.id} className={`border-b border-stone-100 hover:bg-stone-50 ${isSuspended ? 'bg-amber-50/40' : ''}`}>
                          <td className="p-3 font-semibold text-stone-900">{s.fullName || s.name || 'Étudiant'}</td>
                          <td className="p-3 font-mono text-stone-700">{s.email || '-'}</td>
                          <td className="p-3">
                            {s.phone ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-emerald-700">{s.phone}</span>
                                <a
                                  href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-800"
                                  title="Contacter sur WhatsApp"
                                >
                                  <Phone size={12} />
                                </a>
                              </div>
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs">
                              {s.keys?.length || 1} licence(s) active(s)
                            </span>
                            {s.acquiredBookTitles && s.acquiredBookTitles.length > 0 && (
                              <div className="text-[11px] text-stone-600 mt-1 max-w-xs truncate" title={s.acquiredBookTitles.join(', ')}>
                                📘 {s.acquiredBookTitles.join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuspended ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isSuspended ? 'Suspendu (مجمد)' : 'Actif (نشط)'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {/* Bouton 1: Geler / Débloquer l'étudiant */}
                              <button
                                onClick={() => handleToggleUserStatus('students', s.docId || s.id, s.status || 'active')}
                                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                  isSuspended
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                                title={isSuspended ? 'Activer le compte étudiant' : 'Geler le compte étudiant (تجميد)'}
                              >
                                {isSuspended ? <CheckCircle size={12} /> : <Ban size={12} />}
                                <span>{isSuspended ? 'Activer' : 'Geler'}</span>
                              </button>

                              {/* Bouton 2: Supprimer Définitivement (سلة المهملات 🗑️) */}
                              <button 
                                onClick={() => handleDeleteItem('student', s.docId || s.id)} 
                                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer" 
                                title="Supprimer définitivement (سلة المهملات)"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Tab 6: Relevé des Virements & Droits d'Auteur (FINANCES RÉELLES) */}
        {/* ========================================================= */}
        {activeTab === 'virements' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold">Relevé des Virements Bancaires aux Enseignants</h2>
                <p className="text-xs text-stone-500">Gestion des redevances d'auteurs (80%) et suivi des ordres de virement exécutés.</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs text-blue-700 font-bold">Total Droits Dus (80%)</span>
                <p className="text-xl font-bold text-blue-900 mt-1">{authorsPart.toFixed(2)} DH</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-xs text-emerald-700 font-bold">Total Déjà Viré</span>
                <p className="text-xl font-bold text-emerald-900 mt-1">{totalPaidToProfessors.toFixed(2)} DH</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-xs text-amber-700 font-bold">Reliquat Restant à Virer</span>
                <p className="text-xl font-bold text-amber-900 mt-1">{totalPendingPayouts.toFixed(2)} DH</p>
              </div>
            </div>

            {/* Tableau de l'historique des virements */}
            <h3 className="font-bold text-sm text-stone-800 mb-3">Historique des ordres de virement enregistrés</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                    <th className="p-3">DATE DU VIREMENT</th>
                    <th className="p-3">ENSEIGNANT BÉNÉFICIAIRE</th>
                    <th className="p-3">MONTANT VIRÉ</th>
                    <th className="p-3">RÉFÉRENCE BANCAIRE</th>
                    <th className="p-3">RIB / BANQUE</th>
                    <th className="p-3">STATUT</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-stone-400">
                        Aucun virement enregistré pour le moment. Utilisez le bouton "Virer" dans l'onglet Enseignants pour consigner un virement.
                      </td>
                    </tr>
                  ) : (
                    payouts.map((pay) => (
                      <tr key={pay.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="p-3 font-mono text-stone-700">{formatDate(pay.date || pay.createdAt)}</td>
                        <td className="p-3 font-semibold text-stone-900">{pay.professorName}</td>
                        <td className="p-3 font-bold text-emerald-700 font-mono">+{Number(pay.amountMAD).toFixed(2)} DH</td>
                        <td className="p-3 font-mono text-amber-800 font-bold">{pay.reference || '-'}</td>
                        <td className="p-3 font-mono text-stone-500">{pay.bankRib || '-'}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 size={10} />
                            Effectué
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Tab 7: Facultés & Départements */}
        {/* ========================================================= */}
        {activeTab === 'faculties' && (
          <div>
            <h2 className="text-lg font-bold mb-2">Facultés & Établissements Partenaires</h2>
            <p className="text-xs text-stone-500 mb-4">Structurez les départements universitaires pour classer les polycopiés.</p>
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-xs font-semibold text-stone-700">BASE DE DONNÉES COMPLÈTE DES UNIVERSITÉS MAROCAINES</span>
              <p className="text-xs text-stone-500 mt-2">Toutes les facultés et filières académiques sont pré-chargées et sécurisées.</p>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* Modal: Enregistrer un Virement Bancaire */}
      {/* ========================================================= */}
      {payoutModalProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-stone-900">
                <CreditCard className="text-blue-600" size={20} />
                <h3 className="font-bold text-base">Enregistrer un Virement Bancaire</h3>
              </div>
              <button 
                onClick={() => setPayoutModalProf(null)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Enseignant Bénéficiaire</label>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg font-semibold text-stone-900">
                  {payoutModalProf.fullName} ({payoutModalProf.faculty || 'Université'})
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Coordonnées Bancaires (RIB)</label>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg font-mono text-stone-700 select-all">
                  {payoutModalProf.bankRib || 'RIB non renseigné'}
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Montant à Virer (en Dirhams)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full p-2.5 pl-3 pr-10 border border-stone-300 rounded-lg text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-3 font-bold text-stone-400">DH</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Numéro de Référence du Virement (Bancaire)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VIR-2026-ATTIJARI-98214"
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalProf(null)}
                  className="flex-1 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isSubmittingPayout ? 'Enregistrement...' : 'Valider le Virement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
