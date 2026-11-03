import React, { useState, useEffect } from 'react';
import { 
  Book, Key, Users, GraduationCap, Building2, Building, Receipt, ArrowLeftRight, 
  Plus, ShieldCheck, RefreshCw, Trash2, Ban, CheckCircle, Upload
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
import { doc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const AdminDashboard: React.FC<{ books?: any[]; professors?: any[]; lang?: string; onToggleLang?: () => void }> = ({ books = [], professors = [], lang, onToggleLang }) => {
  const [activeTab, setActiveTab] = useState('livres');
  
  // Data States
  const [students, setStudents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [drmCodes, setDrmCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
// Real-time synchronization with Firestore
  useEffect(() => {
    const unsubBooks = subscribeToBooks((data) => {
      setBooks(data);
      setLoading(false);
    });

    const unsubProfessors = subscribeToProfessors((data) => {
      setProfessors(data);
    });

    const unsubStudents = subscribeToStudents((data) => {
      setStudents(data);
    });

    return () => {
      unsubBooks();
      unsubProfessors();
      unsubStudents();
    };
  }, []);
  // Subscriptions
  useEffect(() => {
    const unsubBooks = subscribeToBooks((data) => setBooks(data || []));
    const unsubProfs = subscribeToProfessors((data) => setProfessors(data || []));
    const unsubStudents = subscribeToStudents((data) => setStudents(data || []));
    const unsubTx = subscribeToTransactions((data) => setTransactions(data || []));

    // DRM Codes Subscription
    const unsubDrm = onSnapshot(collection(db, 'redemptionCodes'), (snapshot) => {
      const codes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrmCodes(codes || []);
      setLoading(false);
    }, (err) => console.error("Error fetching DRM codes:", err));

    return () => {
      unsubBooks();
      unsubProfs();
      unsubStudents();
      unsubTx();
      unsubDrm();
    };
  }, []);

  // Financial Calculations
  const totalGross = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const platformPart = totalGross * 0.20;
  const authorsPart = totalGross * 0.80;

  // Administrative Actions
  const handleToggleUserStatus = async (collectionName: 'students' | 'professors', userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      const userRef = doc(db, collectionName, userId);
      await updateDoc(userRef, { status: newStatus, updatedAt: new Date().toISOString() });
    } catch (err) {
      alert("خطأ أثناء تحديث حالة الحساب");
    }
  };

  const handleDeleteUser = async (type: 'student' | 'prof' | 'book', id: string) => {
    if (!window.confirm("هل أنت تأكد من إجراء عملية الحذف الإداري؟")) return;
    try {
      if (type === 'student') await deleteStudentFromFirestore(id);
      if (type === 'prof') await deleteProfessorFromFirestore(id);
      if (type === 'book') await deleteBookFromFirestore(id);
    } catch (err) {
      alert("خطأ أثناء الحذف");
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6 text-stone-800 font-sans dir-ltr">
      {/* Top Header & Overview Cards */}
      <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
        <h1 className="text-2xl font-bold mb-4 text-stone-900">Tableau de Bord de Gestion FAC en PDF</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-xs text-stone-500 font-medium">Souscriptions & Encaissements</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{totalGross.toFixed(2)} DH</p>
          </div>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-xs text-stone-500 font-medium">Licences DRM Émises</span>
            <p className="text-xl font-bold text-amber-700 mt-1">{drmCodes.length}</p>
          </div>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-xs text-stone-500 font-medium">Reversé aux Professeurs</span>
            <p className="text-xl font-bold text-blue-700 mt-1">{authorsPart.toFixed(2)} DH</p>
          </div>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-xs text-stone-500 font-medium">Enseignants Partenaires</span>
            <p className="text-xl font-bold text-stone-800 mt-1">{professors.length}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-stone-300">
        {[
          { id: 'livres', label: 'Livres & Polycopiés', count: books.length, icon: Book },
          { id: 'drm', label: 'Licences DRM & Accès', count: drmCodes.length, icon: Key },
          { id: 'profs', label: 'Comptes des Enseignants', count: professors.length, icon: Users },
          { id: 'students', label: 'Comptes des Étudiants', count: students.length, icon: GraduationCap },
          { id: 'faculties', label: 'Facultés & Départements', count: 0, icon: Building2 },
          { id: 'finance', label: 'Compte Commercial & Encaissement', count: transactions.length, icon: Building },
          { id: 'virements', label: 'Relevé des Virements', count: 0, icon: ArrowLeftRight }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                isActive 
                  ? 'bg-stone-900 text-white shadow-md' 
                  : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-700'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        
        {/* Tab 1: Livres & Polycopiés */}
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
                  {books.length === 0 ? (
                    <tr><td colSpan={6} className="p-4 text-center text-stone-400">Aucun livre enregistré</td></tr>
                  ) : (
                    books.map((b) => (
                      <tr key={b.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="p-3 font-semibold text-stone-900">{b.title}</td>
                        <td className="p-3">{b.faculty || '—'} / S{b.semester || '1'}</td>
                        <td className="p-3">{b.author || '—'}</td>
                        <td className="p-3 font-bold text-emerald-700">{b.price || 0} DH</td>
                        <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">Actif</span></td>
                        <td className="p-3">
                          <button onClick={() => handleDeleteUser('book', b.id)} className="text-red-600 hover:text-red-800">
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

        {/* Tab 2: Licences DRM & Accès */}
        {activeTab === 'drm' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Gestion des Licences & Codes d'Accès DRM</h2>
                <p className="text-xs text-stone-500">Générez des codes individuels pour les étudiants.</p>
              </div>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="p-3">CLÉ DRM</th>
                  <th className="p-3">LIVRE ASSIGNÉ</th>
                  <th className="p-3">ÉTUDIANT BÉNÉFICIAIRE</th>
                  <th className="p-3">DATE D'ÉMISSION</th>
                  <th className="p-3">ÉTAT</th>
                </tr>
              </thead>
              <tbody>
                {drmCodes.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-stone-400">Aucune licence DRM générée</td></tr>
                ) : (
                  drmCodes.map((c) => (
                    <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="p-3 font-mono text-amber-700 font-bold">{c.code || c.id}</td>
                      <td className="p-3">{c.bookTitle || '—'}</td>
                      <td className="p-3">{c.studentEmail || 'Non attribué'}</td>
                      <td className="p-3">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${c.used ? 'bg-stone-200 text-stone-700' : 'bg-emerald-100 text-emerald-800'}`}>
                          {c.used ? 'Utilisé' : 'Disponible'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Comptes Enseignants */}
        {activeTab === 'profs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Comptes des Enseignants & Droits d'Auteur</h2>
                <p className="text-xs text-stone-500">Gérez les coordonnées bancaires (RIB) et les droits d'auteur.</p>
              </div>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="p-3">NOM DE L'ENSEIGNANT</th>
                  <th className="p-3">RIB BANCAIRE & AGENCE</th>
                  <th className="p-3">TAUX DROITS</th>
                  <th className="p-3">STATUT</th>
                  <th className="p-3">ACTIONS ADMINISTRATIVES</th>
                </tr>
              </thead>
              <tbody>
                {professors.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-stone-400">Aucun enseignant inscrit</td></tr>
                ) : (
                  professors.map((p) => (
                    <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="p-3 font-semibold">{p.fullName || p.email}</td>
                      <td className="p-3 font-mono">{p.rib || 'Non renseigné'}</td>
                      <td className="p-3 font-bold text-stone-700">80%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${p.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {p.status === 'suspended' ? 'Suspendu' : 'Actif'}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button 
                          onClick={() => handleToggleUserStatus('professors', p.id, p.status)} 
                          className="px-2 py-1 bg-amber-500 text-white rounded text-[10px] hover:bg-amber-600"
                        >
                          {p.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser('prof', p.id)} 
                          className="px-2 py-1 bg-red-600 text-white rounded text-[10px] hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Comptes Étudiants */}
        {activeTab === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Gestion des Comptes Étudiants</h2>
                <p className="text-xs text-stone-500">Contrôle des inscriptions, consultation des cours et suspension par l'administration.</p>
              </div>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="p-3">ÉTUDIANT & IDENTIFIANT</th>
                  <th className="p-3">FACULTÉ & UNIVERSITÉ</th>
                  <th className="p-3">LIVRES ACQUIS</th>
                  <th className="p-3">STATUT</th>
                  <th className="p-3">ACTIONS ADMINISTRATIVES</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-stone-400">Aucun étudiant inscrit</td></tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="p-3 font-semibold">{s.fullName || s.email}</td>
                      <td className="p-3">{s.university || '—'}</td>
                      <td className="p-3 font-bold text-stone-800">{(s.acquiredBooks || []).length}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${s.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {s.status === 'suspended' ? 'Suspendu' : 'Actif'}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button 
                          onClick={() => handleToggleUserStatus('students', s.id, s.status)} 
                          className="px-2 py-1 bg-amber-500 text-white rounded text-[10px] hover:bg-amber-600"
                        >
                          {s.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser('student', s.id)} 
                          className="px-2 py-1 bg-red-600 text-white rounded text-[10px] hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Facultés & Départements (Crash Protected) */}
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

        {/* Tab 6: Compte Commercial & Encaissement Admin */}
        {activeTab === 'finance' && (
          <div>
            <h2 className="text-lg font-bold mb-2">Journal des Règlements & Droits Académiques</h2>
            <p className="text-xs text-stone-500 mb-4">Chaque règlement effectué par un étudiant valide sa licence nominative.</p>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="p-3">RÉF. COMMANDE</th>
                  <th className="p-3">ÉTUDIANT PAYEUR</th>
                  <th className="p-3">MODE PAIEMENT</th>
                  <th className="p-3">MONTANT ENCAISSÉ</th>
                  <th className="p-3">STATUT</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-stone-400">Aucune transaction enregistrée</td></tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-stone-900">{t.id}</td>
                      <td className="p-3">{t.studentEmail || '—'}</td>
                      <td className="p-3">{t.paymentMethod || 'Carte / CashPlus'}</td>
                      <td className="p-3 font-bold text-emerald-700">{t.amount || 0} DH</td>
                      <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">Confirmé</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 7: Relevé des Virements */}
        {activeTab === 'virements' && (
          <div>
            <h2 className="text-lg font-bold mb-2">Historique des Virements Bancaires aux Enseignants</h2>
            <p className="text-xs text-stone-500 mb-4">Reçus officiels de reversement des redevances avec numéros de référence bancaire.</p>
            <div className="p-8 text-center text-stone-400 text-xs">
              Aucun virement à afficher pour le moment.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
