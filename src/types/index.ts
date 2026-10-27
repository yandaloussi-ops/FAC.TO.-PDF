export type FacultyType = 
  | 'droit' 
  | 'economie' 
  | 'sciences' 
  | 'medecine' 
  | 'lettres'
  | 'theologie';

export type SemesterType = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'Master';

export interface BookPage {
  pageNumber: number;
  chapterTitle: string;
  header: string;
  content: string[];
  keyPoints?: string[];
  formulaOrCase?: string;
  diagramTitle?: string;
  diagramData?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  startPage: number;
  pageCount: number;
}

export interface Book {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  authorTitle: string;
  university: string;
  faculty: FacultyType;
  facultyLabel: string;
  specialty?: string;
  specialtyAr?: string;
  module?: string;
  moduleAr?: string;
  semester: SemesterType;
  year: string;
  edition: string;
  totalPages: number;
  priceMAD: number; // In Moroccan Dirhams or currency (Student Subsidized Price)
  publicPriceMAD?: number; // Public visitor price
  isFree?: boolean;
  coverImage: string;
  isbn: string;
  description: string;
  descriptionAr?: string;
  chapters: Chapter[];
  pages: BookPage[];
  sampleMaxPage: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  pdfUrl?: string;
  pdfFileName?: string;
  fileSize?: string;
  hasPdf?: boolean;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  faculty: string;
  university: string;
  ipAddress: string;
  registeredDevice?: string;
  drmLicenseKey: string;
  acquiredBookIds: string[];
  bookProgress: Record<string, { currentPage: number; completedPercent: number; lastReadAt: string }>;
  pinCode?: string;
  status?: 'active' | 'suspended';
}

export interface UserNote {
  id: string;
  bookId: string;
  pageNumber: number;
  text: string;
  createdAt: string;
}

export interface UserBookmark {
  id?: string;
  bookId: string;
  pageNumber: number;
  chapterTitle: string;
  createdAt: string;
}

export interface DRMSecurityAlert {
  id: string;
  type: 'screenshot_shortcut' | 'window_blur' | 'print_attempt' | 'dev_tools' | 'clipboard_clear';
  title: string;
  message: string;
  timestamp: string;
}

export interface Professor {
  id: string;
  fullName: string;
  title: string;
  email: string;
  university: string;
  faculty: string;
  bankRib: string;
  bankName: string;
  royaltyPercentage: number;
  totalSalesCount: number;
  totalEarningsMAD: number;
  paidAmountMAD: number;
  pendingPayoutMAD: number;
  pinCode?: string;
  specialty?: string;
  module?: string;
  status?: 'active' | 'suspended';
}

export interface DRMAccessLicense {
  id: string;
  licenseCode: string;
  bookId: string;
  bookTitle: string;
  studentEmail: string;
  studentId: string;
  issuedAt: string;
  status: 'active' | 'revoked' | 'locked_to_device';
  isRedeemed?: boolean;
  redeemedByStudentId?: string;
  redeemedByStudentEmail?: string;
  redeemedAt?: string;
  boundDeviceFingerprint?: string;
}

export interface PayoutTransaction {
  id: string;
  professorId: string;
  professorName: string;
  amountMAD: number;
  bankRib: string;
  reference: string;
  date: string;
  status: 'completed' | 'processing';
}

export interface FacultyItem {
  id: string;
  code: string;
  nameFr: string;
  nameAr: string;
  description: string;
  bookCount: number;
}

export interface FacultyNews {
  id: string;
  facultyCode: string;
  facultyName: string;
  titleFr: string;
  titleAr: string;
  summaryFr: string;
  summaryAr: string;
  date: string;
  category: 'examen' | 'inscription' | 'cours' | 'partenariat';
  important?: boolean;
}

export interface ProfessorNotice {
  id: string;
  professorId: string;
  professorName: string;
  professorTitle: string;
  faculty: string;
  moduleName: string;
  messageFr: string;
  messageAr: string;
  date: string;
  pinned?: boolean;
}

export interface UniversityEntity {
  id: string;
  code: string;
  nameFr: string;
  nameAr: string;
  city: string;
  faculties: string[];
}

export interface AcademicSpecialty {
  id: string;
  facultyCode: string;
  nameFr: string;
  nameAr: string;
  cycle: 'Licence' | 'Master' | 'Doctorat' | 'Ingénieur' | 'Médecine';
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface AcademicModule {
  id: string;
  nameFr: string;
  nameAr?: string;
  facultyCode: string;
  specialtyName?: string;
  semester?: SemesterType | string;
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface AdminCommercialAccount {
  holderName: string;
  bankName: string;
  bankRib: string;
  agencyCity: string;
  totalCollectedGrossMAD: number;
  platformSharePercentage: number;
  platformNetEarningsMAD: number;
  professorsTotalEarnedMAD: number;
  professorsTotalPaidMAD: number;
  professorsPendingMAD: number;
}

export type MoroccanPaymentMethod =
  | 'Carte Bancaire CMI (3D-Secure)'
  | 'Virement Bancaire Direct (RIB)'
  | 'Agences Cash (Wafacash / Cash Plus / Barid Cash / Tashilat)'
  | 'Portefeuille Mobile (MT Cash / Orange Money / inwi)'
  | 'Paiement à la Livraison (Amana Express)'
  | 'Carte Bancaire CMI'
  | 'Virement Direct'
  | 'Paiement Espèces / Faculté';

export interface PaymentDetails {
  bankName?: string;
  transferRef?: string;
  receiptFileName?: string;
  cashAgency?: 'Wafacash' | 'Cash Plus' | 'Barid Cash' | 'Tashilat' | 'Daman Cash';
  cashPaymentCode?: string;
  agencyAccountTitle?: string;
  cashExpiryDate?: string;
  mobileWallet?: 'MT Cash' | 'Orange Money' | 'inwi money';
  phoneNumber?: string;
  deliveryAddress?: string;
  city?: string;
}

export interface PaymentOrder {
  id: string;
  orderRef: string;
  bookId: string;
  bookTitle: string;
  amountMAD: number;
  studentName: string;
  studentEmail: string;
  studentId: string;
  paymentMethod: MoroccanPaymentMethod;
  paymentDetails?: PaymentDetails;
  recipientAdminRib: string;
  date: string;
  status: 'encaisse_succes' | 'en_attente';
  drmKeyGenerated: string;
  hmacSignature?: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'PAYMENT' | 'DATABASE' | 'ACCESS' | 'DRM' | 'PRIVACY';
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  operator: string;
  details: string;
  signature: string;
}

export interface SecurityShieldConfig {
  aesEncryptionActive: boolean;
  cndpLaw0908Compliance: boolean;
  cmiPciDssGrade: 'A+' | 'A' | 'B';
  tlsVersion: string;
  strictRbacEnforced: boolean;
  immutableAuditActive: boolean;
  lastIntegrityCheck: string;
  databaseChecksum: string;
}




