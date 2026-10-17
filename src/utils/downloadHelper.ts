/**
 * Utility helper for authentic, reliable client-side file downloads
 * Works reliably within iframes and across all desktop & mobile browsers.
 */

export const triggerBrowserDownload = (
  filename: string,
  content: string,
  mimeType: string = 'text/plain;charset=utf-8'
) => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

/**
 * Generate official receipt text for student purchases
 */
export const generateOfficialReceiptText = (order: {
  orderRef: string;
  bookTitle: string;
  bookTitleAr?: string;
  author: string;
  university: string;
  faculty: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  amountMAD: number;
  paymentMethod: string;
  drmKey: string;
  date: string;
  deviceId?: string;
}) => {
  return `========================================================================
ROYAUME DU MAROC - REPUBLIQUE ACADEMIQUE NUMERIQUE
PLATEFORME NATIONALE "FAC en PDF" · ENCAISSEMENT COMMERCIAL OFFICIEL
========================================================================
QUITTANCE D'ACQUISITION OFFICIELLE & JUSTIFICATIF FISCAL D'ACHAT
Document certifie conforme · Loi 09-08 & Code de Commerce Marocain
------------------------------------------------------------------------

REFERENCE COMMERCIALE : ${order.orderRef}
DATE & HEURE          : ${order.date}
STATUT DU PAIEMENT    : ENCAISSE & VALIDE (REGIE CENTRALE)

------------------------------------------------------------------------
DONNEES DU BENEFICIAIRE (ETUDIANT) :
------------------------------------------------------------------------
Nom & Prenom          : ${order.studentName}
Numero Apogee / CNE   : ${order.studentId}
E-mail Institutionnel : ${order.studentEmail}
Universite            : ${order.university}
Etablissement         : ${order.faculty}
Terminal Lie (DRM)    : ${order.deviceId || 'PC / Navigateur Securise Unitaire (Poste 01)'}

------------------------------------------------------------------------
SUPPORT ACADEMIQUE ACQUIS :
------------------------------------------------------------------------
Titre du Polycopie    : ${order.bookTitle}
${order.bookTitleAr ? `Titre en Arabe        : ${order.bookTitleAr}\n` : ''}Professeur Auteur     : ${order.author}
Montant Total TTC     : ${order.amountMAD} MAD (Dirhams Marocains)
Mode de Reglement     : ${order.paymentMethod}

------------------------------------------------------------------------
CLE DE LICENCE DRM STRICTEMENT INDIVIDUELLE :
------------------------------------------------------------------------
CODE DE LICENCE       : ${order.drmKey}
RESTRICTION DRM       : USAGE UNIQUE · VERROUILLE SUR CE PREMIER TERMINAL
REGLE ANTI-PARTAGE    : CETTE LICENCE EST STRICTEMENT VALABLE UNIQUEMENT
                        POUR LE POLYCOPIE ACQUIS. LE PREMIER UTILISATEUR
                        SUR LE PREMIER APPAREIL EST LE SEUL ET UNIQUE
                        BENEFICIAIRE. TOUTE TENTATIVE DE PARTAGE EST
                        BLOQUEE PAR LE SYSTEME FORENSIC WATERMARK.

------------------------------------------------------------------------
REGULATION FISCALE ET DROITS D'AUTEUR :
- Repartition legale : 80% revertis au Professeur auteur / 20% Frais plateforme.
- Lecture autorisee exclusivement in-app avec bouclier anti-capture d'ecran.
- Interdiction absolue d'impression et d'extraction de donnees.
========================================================================
TIMBRE ELECTRONIQUE DE LA REGIE COMMERCIALE · FAC EN PDF 2026
========================================================================`;
};

/**
 * Generate official course syllabus & summary sheet for student download
 */
export const generateCourseSummaryText = (book: {
  title: string;
  titleAr?: string;
  author: string;
  university: string;
  facultyLabel: string;
  semester: string;
  totalPages: number;
  isbn: string;
  description: string;
  studentName: string;
  studentId: string;
  drmLicenseKey: string;
}) => {
  return `========================================================================
FAC en PDF · FICHE OFFICIELLE DE SYNTHESE ET PLAN DU COURS
ACADEMIE UNIVERSITAIRE DU ROYAUME DU MAROC
========================================================================
MODULE ACADEMIQUE : ${book.title}
${book.titleAr ? `INTITULE ARABE    : ${book.titleAr}\n` : ''}ENSEIGNANT        : ${book.author}
ETABLISSEMENT     : ${book.facultyLabel} (${book.university})
SEMESTRE          : ${book.semester}
VOLUME            : ${book.totalPages} Pages
ISBN / DEPOT      : ${book.isbn}
------------------------------------------------------------------------
BENEFICIAIRE AUTORISE (LICENCE INDIVIDUELLE INTRANSMISSIBLE) :
Etudiant          : ${book.studentName} (Apogee: ${book.studentId})
Cle de Licence    : ${book.drmLicenseKey}
Statut DRM        : Verrouille sur le terminal de ${book.studentName}
------------------------------------------------------------------------
SYLLABUS OFFICIEL & OBJECTIFS PEDAGOGIQUES :
${book.description}

PLAN DE FORMATION :
- Chapitre 1 : Introduction generale, concepts cles et fondements theoriques.
- Chapitre 2 : Analyse approfondie, etudes de cas et jurisprudence/exercices.
- Chapitre 3 : Travaux diriges et applications pratiques pour examens.
- Annexes    : Bibliographie selective et textes reglementaires.

CONDITIONS D'EXPLOITATION :
Le contenu integral est consultable avec moteur de surlignage et notes
directement dans votre espace in-app FAC en PDF.
Ce document constitue une attestation d'acquisition a valeur probante.
========================================================================
ARCHIVAGE DIGITAL SECURISE · FAC en PDF MAROC
========================================================================`;
};
