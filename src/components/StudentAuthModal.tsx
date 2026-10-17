import React, { useState } from 'react';
import { StudentProfile, Book } from '../types';
import { UNIVERSITIES_DATABASE } from '../data/mockBooks';
import {
  X,
  GraduationCap,
  Award,
  CheckCircle2,
  Building2,
  Layers,
  BookOpen,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogIn,
  UserCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import {
  getStoredStudents,
  saveStoredStudents,
  saveStoredCurrentStudent,
  PLATFORM_GMAIL,
} from '../utils/storage';

interface StudentAuthModalProps {
  isOpen: boolean;
  student: StudentProfile;
  targetCourse?: Book | null;
  onSaveProfile: (updated: StudentProfile) => void;
  onClose: () => void;
  onGoToLibrary: () => void;
  onOpenTerms?: (target?: 'guide_student' | 'terms_contract' | 'cndp_privacy') => void;
  lang: 'fr' | 'ar';
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  student,
  targetCourse = null,
  onSaveProfile,
  onClose,
  onGoToLibrary,
  onOpenTerms,
  lang,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery' | 'change_pin'>('register');
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states initialized with current student or presets
  const [fullName, setFullName] = useState(student?.fullName || '');
  const [studentId, setStudentId] = useState(student?.studentId || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState('06 61 23 45 67');
  const [registerPin, setRegisterPin] = useState(student?.pinCode || '');
  const [confirmRegisterPin, setConfirmRegisterPin] = useState(student?.pinCode || '');
  const [showRegisterPin, setShowRegisterPin] = useState(false);

  // Terms and Privacy Contract Agreement (User Request 2)
  const [termsAccepted, setTermsAccepted] = useState(true);

  // University & Faculty cascade
  const [selectedUnivCode, setSelectedUnivCode] = useState<string>('UAE');
  const currentUniv = UNIVERSITIES_DATABASE.find((u) => u.code === selectedUnivCode) || UNIVERSITIES_DATABASE[0];
  const [selectedFaculty, setSelectedFaculty] = useState<string>(
    currentUniv.faculties[0] || 'FSJES Tanger'
  );

  const [specialty, setSpecialty] = useState('Droit Privé (القانون الخاص)');
  const [semester, setSemester] = useState('S1');

  // Login states
  const [loginIdentifier, setLoginIdentifier] = useState(student?.studentId || '');
  const [loginPin, setLoginPin] = useState('');
  const [showLoginPin, setShowLoginPin] = useState(false);

  // Recovery States (Forgot PIN)
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'reset'>('request');
  const [generatedRecoveryOtp, setGeneratedRecoveryOtp] = useState('');
  const [enteredRecoveryOtp, setEnteredRecoveryOtp] = useState('');
  const [newRecoveryPin, setNewRecoveryPin] = useState('');
  const [confirmNewRecoveryPin, setConfirmNewRecoveryPin] = useState('');
  const [matchedStudentForRecovery, setMatchedStudentForRecovery] = useState<StudentProfile | null>(null);

  // Change PIN states (when already identified)
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');

  const handleUniversityChange = (code: string) => {
    setSelectedUnivCode(code);
    const univ = UNIVERSITIES_DATABASE.find((u) => u.code === code);
    if (univ && univ.faculties.length > 0) {
      setSelectedFaculty(univ.faculties[0]);
    }
  };

  // 1. Submit Registration with Private PIN
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !studentId.trim()) {
      setErrorMessage(
        lang === 'fr'
          ? 'Veuillez saisir votre nom complet et votre identifiant étudiant (CNE/Massar).'
          : 'يرجى إدخال الاسم الكامل ورقم مسار أو بطاقة الطالب.'
      );
      return;
    }

    if (!registerPin.trim() || registerPin.trim().length < 4) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le code secret (PIN) doit comporter au moins 4 chiffres ou caractères.'
          : 'يجب أن يتكون القن السري من 4 خانات على الأقل.'
      );
      return;
    }

    if (registerPin.trim() !== confirmRegisterPin.trim()) {
      setErrorMessage(
        lang === 'fr'
          ? 'Les deux codes secrets (PIN) ne sont pas identiques.'
          : 'القن السري وتأكيده غير متطابقين.'
      );
      return;
    }

    if (!termsAccepted) {
      setErrorMessage(
        lang === 'fr'
          ? 'Veuillez cocher votre acceptation du contrat d\'utilisation et du traitement des données personnelles pour valider votre adhésion.'
          : 'يرجى التأشير بالموافقة على عقد استعمال التطبيق والموافقة على استعمال المعلومات الشخصية لاستكمال التسجيل.'
      );
      return;
    }

    const students = getStoredStudents();
    const cleanEmail = email.trim() || `${studentId.trim().toLowerCase()}@etu.ac.ma`;
    const cleanStudentId = studentId.trim();

    // Check if student is suspended
    const existing = students.find(
      (s) => s.studentId.toLowerCase() === cleanStudentId.toLowerCase() || s.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    if (existing && existing.status === 'suspended') {
      setErrorMessage(
        lang === 'fr'
          ? `Ce compte étudiant a été suspendu par l'administration (${PLATFORM_GMAIL}).`
          : `تم تجميد هذا الحساب الطلابي من طرف الإدارة. يرجى التواصل مع (${PLATFORM_GMAIL}).`
      );
      return;
    }

    const newProfile: StudentProfile = {
      id: existing ? existing.id : `usr_student_${Date.now()}`,
      studentId: cleanStudentId,
      fullName: fullName.trim(),
      email: cleanEmail,
      faculty: selectedFaculty,
      university: `${currentUniv.nameFr} (${currentUniv.code})`,
      ipAddress: student.ipAddress || '196.200.142.12',
      registeredDevice: 'Navigateur Web Authentifié',
      drmLicenseKey: student.drmLicenseKey || `DRM-FAC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      acquiredBookIds: Array.isArray(existing?.acquiredBookIds)
        ? existing.acquiredBookIds
        : Array.isArray(student?.acquiredBookIds)
        ? student.acquiredBookIds
        : ['book-droit-civil', 'book-algo-data'],
      bookProgress: existing?.bookProgress || student?.bookProgress || {},
      pinCode: registerPin.trim(),
      status: 'active',
    };

    // Update list of students in storage
    const updatedStudents = existing
      ? students.map((s) => (s.id === existing.id ? newProfile : s))
      : [newProfile, ...students];

    saveStoredStudents(updatedStudents);
    saveStoredCurrentStudent(newProfile);
    onSaveProfile(newProfile);

    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
      onClose();
      onGoToLibrary();
    }, 1500);
  };

  // 2. Submit Login with Massar/Email + PIN
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdent = loginIdentifier.trim().toLowerCase();
    const cleanPin = loginPin.trim();

    if (!cleanIdent || !cleanPin) {
      setErrorMessage(
        lang === 'fr'
          ? 'Veuillez saisir votre CNE/Massar/E-mail et votre code secret (PIN).'
          : 'يرجى إدخال رقم مسار أو البريد والقن السري.'
      );
      return;
    }

    const students = getStoredStudents();
    const foundStudent = students.find(
      (s) =>
        s.studentId.toLowerCase() === cleanIdent ||
        s.email.toLowerCase() === cleanIdent
    );

    if (!foundStudent) {
      setErrorMessage(
        lang === 'fr'
          ? 'Aucun compte étudiant trouvé. Veuillez créer votre compte dans l\'onglet Inscription.'
          : 'لم يتم العثور على حساب طالب بهذا الرقم. يرجى التسجيل في خانة فضاء الطالب.'
      );
      return;
    }

    if (foundStudent.status === 'suspended') {
      setErrorMessage(
        lang === 'fr'
          ? `Ce compte a été suspendu par l'administration. Contact : ${PLATFORM_GMAIL}`
          : `تم تجميد هذا الحساب من طرف الإدارة. التواصل: ${PLATFORM_GMAIL}`
      );
      return;
    }

    const expectedPin = foundStudent.pinCode || '123456';
    if (cleanPin === expectedPin) {
      saveStoredCurrentStudent(foundStudent);
      onSaveProfile(foundStudent);
      setSaveSuccessToast(true);
      setTimeout(() => {
        setSaveSuccessToast(false);
        onClose();
        onGoToLibrary();
      }, 1200);
    } else {
      setErrorMessage(
        lang === 'fr'
          ? 'Code secret (PIN) incorrect. Cliquez sur "Code oublié" pour le réinitialiser.'
          : 'القن السري غير صحيح. يمكنك النقر على "نسيت القن السري" لاسترجاعه.'
      );
    }
  };

  // 3. Recovery: Request OTP
  const handleRecoveryRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdent = recoveryIdentifier.trim().toLowerCase();
    if (!cleanIdent) {
      setErrorMessage(
        lang === 'fr'
          ? 'Veuillez saisir votre e-mail ou votre identifiant Massar.'
          : 'يرجى إدخال البريد أو رقم مسار.'
      );
      return;
    }

    const students = getStoredStudents();
    const found = students.find(
      (s) =>
        s.studentId.toLowerCase() === cleanIdent ||
        s.email.toLowerCase() === cleanIdent
    );

    if (!found) {
      setErrorMessage(
        lang === 'fr'
          ? 'Identifiant non trouvé dans la base des étudiants.'
          : 'المعطيات المدخلة غير مسجلة في قاعدة الطلبة.'
      );
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setMatchedStudentForRecovery(found);
    setGeneratedRecoveryOtp(code);
    setRecoveryStep('reset');
  };

  // 4. Recovery: Reset PIN with OTP
  const handleRecoveryReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (enteredRecoveryOtp.trim() !== generatedRecoveryOtp.trim()) {
      setErrorMessage(
        lang === 'fr' ? 'Le code de sécurité OTP est incorrect.' : 'رمز الأمان OTP غير صحيح.'
      );
      return;
    }

    if (!newRecoveryPin.trim() || newRecoveryPin.trim().length < 4) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le nouveau code secret doit comporter au moins 4 caractères.'
          : 'يجب أن يتكون القن السري الجديد من 4 خانات على الأقل.'
      );
      return;
    }

    if (newRecoveryPin.trim() !== confirmNewRecoveryPin.trim()) {
      setErrorMessage(
        lang === 'fr' ? 'Les deux codes ne correspondent pas.' : 'القن السري وتأكيده غير متطابقين.'
      );
      return;
    }

    if (!matchedStudentForRecovery) return;

    const students = getStoredStudents();
    const updated: StudentProfile = {
      ...matchedStudentForRecovery,
      pinCode: newRecoveryPin.trim(),
    };

    const updatedList = students.map((s) => (s.id === updated.id ? updated : s));
    saveStoredStudents(updatedList);
    saveStoredCurrentStudent(updated);
    onSaveProfile(updated);

    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
      setActiveTab('login');
      setRecoveryStep('request');
      setLoginPin(newRecoveryPin.trim());
    }, 1500);
  };

  // 5. Change PIN directly
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const expectedCurrent = student.pinCode || '123456';
    if (currentPinInput.trim() !== expectedCurrent) {
      setErrorMessage(
        lang === 'fr' ? 'L\'ancien code secret est incorrect.' : 'القن السري الحالي غير صحيح.'
      );
      return;
    }

    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le nouveau code doit comporter au moins 4 caractères.'
          : 'يجب أن يتكون القن السري من 4 خانات على الأقل.'
      );
      return;
    }

    if (newPinInput.trim() !== confirmNewPinInput.trim()) {
      setErrorMessage(
        lang === 'fr' ? 'Les deux codes ne correspondent pas.' : 'القن السري وتأكيده غير متطابقين.'
      );
      return;
    }

    const students = getStoredStudents();
    const updated: StudentProfile = {
      ...student,
      pinCode: newPinInput.trim(),
    };

    const updatedList = students.map((s) => (s.id === updated.id ? updated : s));
    saveStoredStudents(updatedList);
    saveStoredCurrentStudent(updated);
    onSaveProfile(updated);

    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
      setActiveTab('login');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">
                {lang === 'fr'
                  ? 'Espace & Profil Étudiant · Sécurité par Code Secret (PIN)'
                  : 'فضاء وبروفايل الطالب · تسجيل ودخول محمي بقن سري'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'fr'
                  ? 'Accès sécurisé à vos polycopiés, vos notes et vos licences DRM in-app'
                  : 'سجل معطياتك وقنك السري لحفظ رخصك ومطالعة المقررات واسترجاع الحساب عند النسيان'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast */}
        {saveSuccessToast && (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {lang === 'fr'
                ? 'Opération réussie ! Votre profil et votre code secret ont été enregistrés.'
                : 'تمت العملية بنجاح! تم حفظ بروفايلك وتحديث القن السري في المنصة.'}
            </span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Target Course Academic Banner */}
        {targetCourse && (
          <div className="mb-5 p-4 bg-gradient-to-r from-amber-50 to-sky-50 border border-amber-300 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in">
            <img
              src={targetCourse.coverImage}
              alt={targetCourse.title}
              className="w-12 h-16 object-cover rounded-xl shadow-xs border border-amber-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-xs flex-1 min-w-0">
              <div className="font-black text-amber-950 flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {lang === 'fr'
                    ? 'Inscription Étudiante · Déblocage du Tarif Préférentiel'
                    : 'مطبوع تسجيل الطالب · الاستفادة من التعريفة التفضيلية المدعومة'}
                </span>
              </div>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                {lang === 'fr'
                  ? `Vous accédez au cours "${targetCourse.title}". Remplissez votre inscription ou connectez-vous pour valider votre statut d'étudiant et accéder directement à l'acquisition au tarif subventionné (${targetCourse.priceMAD} MAD).`
                  : `أنت بصدد الانخراط لمقرر "${targetCourse.titleAr || targetCourse.title}" للأستاذ ${targetCourse.author}. سجل معطياتك لإثبات صفتك الجامعية والاستفادة من التعريفة التفضيلية للطلبة (${targetCourse.priceMAD} درهم) مع الدخول التلقائي للاقتناء.`}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'fr' ? 'Fespace Étudiant (Inscription)' : 'فضاء الطالب (تسجيل جديد)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-4 h-4 text-amber-600" />
            <span>{lang === 'fr' ? 'Profil Étudiant (Connexion PIN)' : 'بروفايل الطالب (دخول بالقن)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('change_pin');
              setErrorMessage(null);
            }}
            className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'change_pin'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            title="Changer mon code PIN / تغيير القن السري"
          >
            <KeyRound className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Changer PIN' : 'تغيير القن'}</span>
          </button>
        </div>

        {/* 1. REGISTRATION FORM WITH PIN CODE CHOICE (Requirement 10) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Nom et Prénom *' : 'الاسم الكامل للطالب *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Youssef El Andaloussi"
                    className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Code Massar / N° Étudiant (CNE) *' : 'رقم مسار أو رقم بطاقة الطالب (CNE) *'}
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Ex: P134567890"
                    className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Adresse E-mail Institutionnelle ou Personnelle *' : 'البريد الإلكتروني الجامعي أو الشخصي *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="etudiant@uae.ac.ma"
                    className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Numéro de Téléphone (WhatsApp)' : 'رقم الهاتف (للتواصل وإرسال الإشعارات)'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 61 00 00 00"
                    className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* University & Faculty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Université' : 'الجامعة'}
                </label>
                <select
                  value={selectedUnivCode}
                  onChange={(e) => handleUniversityChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {UNIVERSITIES_DATABASE.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.nameFr} ({u.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Faculté / Établissement' : 'الكلية أو المؤسسة الجامعية'}
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {currentUniv.faculties.map((f, i) => (
                    <option key={i} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Private PIN Code Setup (Requirement 10) */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>{lang === 'fr' ? 'Création de votre Code Secret (PIN) Personnel *' : 'تحديد القن السري الخاص بالطالب (يستخدم للدخول لبروفايلك) *'}</span>
              </div>
              <p className="text-[11px] text-amber-800">
                {lang === 'fr'
                  ? 'Ce code secret vous permettra de vous reconnecter à votre profil étudiant, consulter vos cours et réinitialiser vos identifiants.'
                  : 'اختر قناً سرياً من 4 خانات على الأقل. ستحتاجه في كل مرة للدخول إلى بروفايلك ومطالعة المقررات الخاصة بك.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Code Secret (PIN) *' : 'القن السري (PIN) *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPin ? 'text' : 'password'}
                      required
                      value={registerPin}
                      onChange={(e) => setRegisterPin(e.target.value)}
                      placeholder="Ex: 9482 أو كلمة مرور"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPin(!showRegisterPin)}
                      className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showRegisterPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Confirmer le Code Secret *' : 'تأكيد القن السري *'}
                  </label>
                  <input
                    type={showRegisterPin ? 'text' : 'password'}
                    required
                    value={confirmRegisterPin}
                    onChange={(e) => setConfirmRegisterPin(e.target.value)}
                    placeholder="إعادة إدخال نفس القن"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Contract Agreement & CNDP Privacy Consent (User Request 2) */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
                <div className="text-xs text-stone-700 leading-relaxed select-none">
                  <span className="font-bold text-stone-900">
                    {lang === 'fr'
                      ? 'J\'accepte le contrat d\'utilisation de la plateforme et le traitement de mes données personnelles.'
                      : 'أوافق على عقد استعمال التطبيق وشروطه العامة وعلى استعمال ومعالجة المعلومات الشخصية.'}
                  </span>{' '}
                  <span className="text-stone-500 text-[11px] block mt-0.5">
                    {lang === 'fr'
                      ? 'Vos données sont protégées conformément à la loi CNDP 09-08 et réservées exclusivement à la gestion de vos accès in-app.'
                      : 'معطياتك محمية ومحفوظة بسرية تامة طبقاً لمقتضيات القانون رقم 09-08 الصادر عن CNDP وتستخدم حصراً لتفعيل رخص القراءة.'}
                  </span>
                </div>
              </label>

              <div className="flex items-center justify-end pt-1 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => onOpenTerms ? onOpenTerms('terms_contract') : null}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'fr'
                      ? 'Lire les détails complets du contrat d\'utilisation et de confidentialité →'
                      : 'قراءة تفاصيل عقد الاستعمال وبنود حماية المعطيات الشخصية ←'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* زر الخروج من استمارة التسجيل للطالب */}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  title={lang === 'fr' ? 'Fermer et quitter le formulaire' : 'الخروج من استمارة التسجيل'}
                >
                  <X className="w-4 h-4 text-stone-500" />
                  <span>{lang === 'fr' ? 'Quitter / Fermer' : 'خروج من الاستمارة'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  {lang === 'fr' ? 'Déjà un compte ? Se connecter' : 'لديك حساب؟ تسجيل الدخول'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Enregistrer & Activer mon Profil' : 'تسجيل وتفعيل بروفايل الطالب'}</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. LOGIN WITH MASSAR/EMAIL + PIN CODE (Requirement 10) */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>{lang === 'fr' ? 'Connexion Sécurisée au Profil Étudiant' : 'تسجيل الدخول إلى بروفايل الطالب'}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                {lang === 'fr'
                  ? 'Saisissez votre CNE/Massar ou votre adresse e-mail ainsi que votre code secret (PIN) configuré.'
                  : 'أدخل رقم مسار أو البريد الإلكتروني مع القن السري الذي اخترته أثناء التسجيل لمطالعة مقرراتك.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'fr' ? 'CNE / Massar ou Adresse E-mail *' : 'رقم مسار (CNE) أو البريد الإلكتروني *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Ex: ETU-2026-9482 أو etudiant@etu.ac.ma"
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">
                  {lang === 'fr' ? 'Code Secret (PIN) *' : 'القن السري (PIN) *'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('recovery');
                    setErrorMessage(null);
                  }}
                  className="text-[11px] text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                >
                  {lang === 'fr' ? 'Code oublié ?' : 'نسيت القن السري؟'}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                <input
                  type={showLoginPin ? 'text' : 'password'}
                  required
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPin(!showLoginPin)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-stone-400 hover:text-stone-700"
                >
                  {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  title={lang === 'fr' ? 'Fermer la fenêtre' : 'إغلاق النافذة'}
                >
                  <X className="w-4 h-4 text-stone-500" />
                  <span>{lang === 'fr' ? 'Fermer' : 'خروج'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  {lang === 'fr' ? 'Pas encore de compte ? S\'inscrire' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Accéder à mon Profil' : 'دخول لبروفايل الطالب'}</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. RECOVERY FLOW: FORGOT PIN (Requirement 10) */}
        {activeTab === 'recovery' && (
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-sky-600" />
                <span>{lang === 'fr' ? 'Procédure de Récupération du Code Secret' : 'استرجاع القن السري لبروفايل الطالب'}</span>
              </div>
              <p className="text-[11px] text-sky-800">
                {lang === 'fr'
                  ? 'Saisissez votre e-mail ou Massar pour vérifier votre identité et définir un nouveau code secret.'
                  : 'أدخل بريدك الإلكتروني أو رقم مسار المسجل للتحقق وتعيين قن سري جديد فوراً.'}
              </p>
            </div>

            {recoveryStep === 'request' ? (
              <form onSubmit={handleRecoveryRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'E-mail ou Massar enregistré *' : 'البريد الإلكتروني أو رقم مسار المسجل *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder="Ex: etudiant@etu.ac.ma"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs font-bold text-stone-500 hover:underline cursor-pointer"
                  >
                    {lang === 'fr' ? 'Retour à la connexion' : 'العودة لتسجيل الدخول'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Générer le Code de Vérification' : 'إرسال رمز التحقق الأمني'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRecoveryReset} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center space-y-1">
                  <span className="text-[11px] font-bold text-amber-900">
                    {lang === 'fr' ? 'Code d\'Autorisation de Récupération (OTP) :' : 'رمز التحقق الأمني المولد:'}
                  </span>
                  <div className="text-xl font-mono font-black text-amber-700 tracking-widest">
                    {generatedRecoveryOtp}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Saisir le Code OTP ci-dessus *' : 'أدخل رمز التحقق OTP الظاهر أعلاه *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={enteredRecoveryOtp}
                    onChange={(e) => setEnteredRecoveryOtp(e.target.value)}
                    placeholder="6 chiffres"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs font-mono text-center tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'fr' ? 'Nouveau Code Secret (PIN) *' : 'القن السري الجديد *'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newRecoveryPin}
                      onChange={(e) => setNewRecoveryPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'fr' ? 'Confirmer le Nouveau Code *' : 'تأكيد القن الجديد *'}
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewRecoveryPin}
                      onChange={(e) => setConfirmNewRecoveryPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep('request')}
                    className="text-xs font-bold text-stone-500 hover:underline cursor-pointer"
                  >
                    {lang === 'fr' ? 'Recommencer' : 'إعادة المحاولة'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Valider le Nouveau Code' : 'حفظ القن السري الجديد وتفعيل الدخول'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 4. CHANGE PIN TAB */}
        {activeTab === 'change_pin' && (
          <form onSubmit={handleChangePinSubmit} className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-sky-600" />
                <span>{lang === 'fr' ? 'Modification du Code Secret (PIN)' : 'تغيير القن السري للطالب'}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                {lang === 'fr'
                  ? 'Pour des raisons de sécurité, saisissez votre ancien code avant de définir votre nouveau code.'
                  : 'يرجى إدخال القن السري القديم لتأكيد هويتك، ثم تحديد القن السري الجديد.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'fr' ? 'Ancien Code Secret *' : 'القن السري الحالي *'}
              </label>
              <input
                type="password"
                required
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Nouveau Code Secret *' : 'القن السري الجديد *'}
                </label>
                <input
                  type="password"
                  required
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Confirmer Nouveau Code *' : 'تأكيد القن الجديد *'}
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPinInput}
                  onChange={(e) => setConfirmNewPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs font-bold text-stone-500 hover:underline cursor-pointer"
              >
                {lang === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Enregistrer le Nouveau Code' : 'حفظ وتحديث القن السري'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
