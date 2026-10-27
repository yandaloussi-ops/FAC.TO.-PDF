import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Book } from '../types';

/**
 * Generate a genuine multi-page Moroccan academic PDF document for any book
 * Creates real PDF binary data parsed by PDF.js with chapters, syllabus, headers, footers & DRM notice
 */
function safeWinAnsi(str: string | undefined, fallback: string = ''): string {
  if (!str) return fallback;
  const isArabic = /[\u0600-\u06FF]/.test(str);
  if (isArabic) {
    if (str.includes('سياس') || str.includes('المدخل')) {
      return 'Al-Madkhal li-Ouloum As-Siyasiya (Sciences Politiques S1)';
    }
    if (str.includes('قانون') || str.includes('مدني') || str.includes('التزام')) {
      return 'Droit Civil : Théorie Générale des Obligations';
    }
    if (str.includes('شرك') || str.includes('أعمال') || str.includes('تجاري')) {
      return 'Droit Commercial & Droit des Sociétés';
    }
    if (str.includes('دستور')) {
      return 'Droit Constitutionnel & Institutions Politiques';
    }
    if (str.includes('اقتصاد') || str.includes('مال')) {
      return 'Économie & Analyse Financière Universitaire';
    }
    return fallback || 'Manuel Universitaire Homologué & Certifié';
  }
  const clean = str.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, ' ').replace(/\s+/g, ' ').trim();
  return clean || fallback;
}

export async function generateAcademicPdfBlob(book: Partial<Book>): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  const title = safeWinAnsi(book.title, 'Support de Cours Universitaire');
  const author = safeWinAnsi(book.author, 'Pr. Enseignant-Chercheur');
  const faculty = safeWinAnsi(book.facultyLabel || book.faculty, 'Faculté des Sciences Juridiques, Économiques et Sociales');
  const university = safeWinAnsi(book.university, 'Université Marocaine (Établissement Public)');
  const semester = safeWinAnsi(book.semester, 'S1');
  const year = safeWinAnsi(book.year, '2026');

  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const primaryColor = rgb(0.12, 0.18, 0.28); // Academic deep navy
  const goldColor = rgb(0.72, 0.52, 0.12); // Gold accent
  const bodyColor = rgb(0.18, 0.2, 0.24); // Dark gray text
  const mutedColor = rgb(0.45, 0.48, 0.52); // Muted subtext
  const greenColor = rgb(0.08, 0.48, 0.28); // DRM green

  const pageWidth = 595.28; // Standard A4 width in points
  const pageHeight = 841.89; // Standard A4 height in points
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Helper to wrap text into lines
  const wrapText = (text: string, maxW: number, font: any, size: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);
      if (testWidth <= maxW) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Helper to add standard header and footer to content pages
  const addHeaderAndFooter = (page: any, pageNum: number, totalPages: number) => {
    // Header line
    page.drawLine({
      start: { x: margin, y: pageHeight - 45 },
      end: { x: pageWidth - margin, y: pageHeight - 45 },
      thickness: 0.8,
      color: goldColor,
    });

    const headerText = `${title.slice(0, 48)} · ${author}`;
    page.drawText(headerText, {
      x: margin,
      y: pageHeight - 40,
      size: 8,
      font: helvetica,
      color: mutedColor,
    });

    // Footer line
    page.drawLine({
      start: { x: margin, y: 48 },
      end: { x: pageWidth - margin, y: 48 },
      thickness: 0.8,
      color: rgb(0.85, 0.85, 0.85),
    });

    // Footer text
    page.drawText('FAC EN PDF · ÉDITION NUMÉRIQUE UNIVERSITAIRE · COPIE RÉSERVÉE À L\'ÉTUDIANT DÉTENTEUR DU COMPTE', {
      x: margin,
      y: 35,
      size: 7,
      font: courier,
      color: mutedColor,
    });

    const pageStr = `${pageNum} / ${totalPages}`;
    const pageStrW = helvetica.widthOfTextAtSize(pageStr, 8);
    page.drawText(pageStr, {
      x: pageWidth - margin - pageStrW,
      y: 35,
      size: 8,
      font: helveticaBold,
      color: primaryColor,
    });
  };

  // -------------------------------------------------------------
  // PAGE 1: OFFICIAL COVER & TITLE PAGE
  // -------------------------------------------------------------
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);

  // Decorative border
  page1.drawRectangle({
    x: 25,
    y: 25,
    width: pageWidth - 50,
    height: pageHeight - 50,
    borderColor: goldColor,
    borderWidth: 1.5,
  });

  page1.drawRectangle({
    x: 31,
    y: 31,
    width: pageWidth - 62,
    height: pageHeight - 62,
    borderColor: rgb(0.88, 0.85, 0.78),
    borderWidth: 0.8,
  });

  // Top header text
  page1.drawText('ROYAUME DU MAROC', {
    x: pageWidth / 2 - timesRomanBold.widthOfTextAtSize('ROYAUME DU MAROC', 11) / 2,
    y: pageHeight - 70,
    size: 11,
    font: timesRomanBold,
    color: primaryColor,
  });

  page1.drawText('MINISTÈRE DE L\'ENSEIGNEMENT SUPÉRIEUR, DE LA RECHERCHE SCIENTIFIQUE ET DE L\'INNOVATION', {
    x: pageWidth / 2 - helvetica.widthOfTextAtSize('MINISTÈRE DE L\'ENSEIGNEMENT SUPÉRIEUR, DE LA RECHERCHE SCIENTIFIQUE ET DE L\'INNOVATION', 7.5) / 2,
    y: pageHeight - 85,
    size: 7.5,
    font: helvetica,
    color: mutedColor,
  });

  // University & Faculty
  page1.drawText(university.toUpperCase(), {
    x: pageWidth / 2 - timesRomanBold.widthOfTextAtSize(university.toUpperCase(), 10) / 2,
    y: pageHeight - 110,
    size: 10,
    font: timesRomanBold,
    color: primaryColor,
  });

  page1.drawText(faculty, {
    x: pageWidth / 2 - timesRoman.widthOfTextAtSize(faculty, 9.5) / 2,
    y: pageHeight - 125,
    size: 9.5,
    font: timesRoman,
    color: bodyColor,
  });

  page1.drawLine({
    start: { x: 120, y: pageHeight - 145 },
    end: { x: pageWidth - 120, y: pageHeight - 145 },
    thickness: 1.2,
    color: goldColor,
  });

  // Badge: Polycopié de Cours Officiel
  page1.drawRectangle({
    x: pageWidth / 2 - 130,
    y: pageHeight - 210,
    width: 260,
    height: 26,
    color: rgb(0.96, 0.94, 0.88),
    borderColor: goldColor,
    borderWidth: 1,
  });

  page1.drawText(`MANUEL UNIVERSITAIRE OFFICIEL · SEMESTRE ${semester}`, {
    x: pageWidth / 2 - helveticaBold.widthOfTextAtSize(`MANUEL UNIVERSITAIRE OFFICIEL · SEMESTRE ${semester}`, 8.5) / 2,
    y: pageHeight - 198,
    size: 8.5,
    font: helveticaBold,
    color: primaryColor,
  });

  // Book Title wrapped
  const titleLines = wrapText(title, contentWidth - 40, timesRomanBold, 22);
  let titleY = pageHeight - 280;
  for (const line of titleLines) {
    const lineW = timesRomanBold.widthOfTextAtSize(line, 22);
    page1.drawText(line, {
      x: pageWidth / 2 - lineW / 2,
      y: titleY,
      size: 22,
      font: timesRomanBold,
      color: primaryColor,
    });
    titleY -= 28;
  }

  // Subtitle / Arabic title if present
  if (book.titleAr) {
    page1.drawText('Support Pédagogique Intégral · Édition Certifiée', {
      x: pageWidth / 2 - timesRoman.widthOfTextAtSize('Support Pédagogique Intégral · Édition Certifiée', 11) / 2,
      y: titleY - 10,
      size: 11,
      font: timesRoman,
      color: mutedColor,
    });
  }

  // Author Section
  const authorBoxY = 260;
  page1.drawRectangle({
    x: 90,
    y: authorBoxY,
    width: pageWidth - 180,
    height: 85,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.85, 0.87, 0.9),
    borderWidth: 1,
  });

  page1.drawText('Dispensé et rédigé par :', {
    x: pageWidth / 2 - helvetica.widthOfTextAtSize('Dispensé et rédigé par :', 9) / 2,
    y: authorBoxY + 62,
    size: 9,
    font: helvetica,
    color: mutedColor,
  });

  page1.drawText(author, {
    x: pageWidth / 2 - timesRomanBold.widthOfTextAtSize(author, 15) / 2,
    y: authorBoxY + 38,
    size: 15,
    font: timesRomanBold,
    color: primaryColor,
  });

  page1.drawText('Professeur de l\'Enseignement Supérieur (PES) · Enseignant-Chercheur Titulaire', {
    x: pageWidth / 2 - helvetica.widthOfTextAtSize('Professeur de l\'Enseignement Supérieur (PES) · Enseignant-Chercheur Titulaire', 8) / 2,
    y: authorBoxY + 18,
    size: 8,
    font: helvetica,
    color: bodyColor,
  });

  // DRM Seal & Academic Year
  page1.drawRectangle({
    x: 100,
    y: 90,
    width: pageWidth - 200,
    height: 48,
    color: rgb(0.94, 0.98, 0.95),
    borderColor: greenColor,
    borderWidth: 1,
  });

  page1.drawText('PROTÉGÉ PAR LE LECTEUR IN-APP SECURE DRM', {
    x: pageWidth / 2 - helveticaBold.widthOfTextAtSize('PROTÉGÉ PAR LE LECTEUR IN-APP SECURE DRM', 9) / 2,
    y: 118,
    size: 9,
    font: helveticaBold,
    color: greenColor,
  });

  page1.drawText(`Année Universitaire ${year} - Dépôt Légal Pédagogique Certifié`, {
    x: pageWidth / 2 - helvetica.widthOfTextAtSize(`Année Universitaire ${year} - Dépôt Légal Pédagogique Certifié`, 8) / 2,
    y: 102,
    size: 8,
    font: helvetica,
    color: bodyColor,
  });

  // -------------------------------------------------------------
  // PAGE 2: PEDAGOGICAL NOTICE & LEGAL DRM PROVISIONS
  // -------------------------------------------------------------
  const page2 = pdfDoc.addPage([pageWidth, pageHeight]);
  addHeaderAndFooter(page2, 2, 8);

  page2.drawText('AVANT-PROPOS & CADRE PÉDAGOGIQUE', {
    x: margin,
    y: pageHeight - 80,
    size: 16,
    font: timesRomanBold,
    color: primaryColor,
  });

  page2.drawLine({
    start: { x: margin, y: pageHeight - 90 },
    end: { x: margin + 140, y: pageHeight - 90 },
    thickness: 2,
    color: goldColor,
  });

  const introParagraphs = [
    `Ce polycopié constitue le support pédagogique officiel et exhaustif accompagnant les séances de cours magistraux et de travaux dirigés dispensés au titre de l'année universitaire ${year}. Il s'adresse aux étudiants inscrits en semestre ${semester} au sein de la filière académique correspondante.`,
    'L\'objectif fondamental de cet ouvrage est de doter les étudiants des fondements théoriques, des repères conceptuels rigoureux et des instruments méthodologiques indispensables pour la maîtrise du programme universitaire et la réussite aux examens de fin de semestre.',
    'Chaque chapitre comporte une synthèse des notions fondamentales, des illustrations jurisprudentielles ou cas pratiques d\'application directe, ainsi que des orientations bibliographiques recommandées pour l\'approfondissement.',
  ];

  let pY = pageHeight - 125;
  for (const paragraph of introParagraphs) {
    const wrapped = wrapText(paragraph, contentWidth, timesRoman, 10.5);
    for (const line of wrapped) {
      page2.drawText(line, { x: margin, y: pY, size: 10.5, font: timesRoman, color: bodyColor });
      pY -= 17;
    }
    pY -= 12;
  }

  // Legal Notice Box
  pY -= 10;
  page2.drawRectangle({
    x: margin,
    y: pY - 140,
    width: contentWidth,
    height: 140,
    color: rgb(0.98, 0.95, 0.92),
    borderColor: rgb(0.85, 0.45, 0.2),
    borderWidth: 1,
  });

  page2.drawText('MENTIONS LÉGALES & PROTECTION DES DROITS D\'AUTEUR (LOI N° 34-05)', {
    x: margin + 15,
    y: pY - 24,
    size: 9.5,
    font: helveticaBold,
    color: rgb(0.65, 0.2, 0.05),
  });

  const legalLines = [
    'Conformément aux dispositions de la loi marocaine n° 34-05 modifiant et complétant la loi n° 2-00 relative aux droits d\'auteur et droits voisins, ce manuel universitaire est une œuvre protégée.',
    'Toute reproduction intégrale ou partielle, distribution, numérisation non autorisée, mise à disposition sur des plateformes de partage, ou capture d\'écran commerciale ou publique est formellement prohibée.',
    'La licence d\'accès accordée à l\'étudiant est nominative, strictement personnelle et liée au poste de lecture in-app au sein de la plateforme FAC en PDF. Tout partage d\'identifiant entraîne la révocation automatique de la clé DRM.',
  ];

  let legY = pY - 45;
  for (const leg of legalLines) {
    const wrapped = wrapText(leg, contentWidth - 30, helvetica, 8);
    for (const line of wrapped) {
      page2.drawText(line, { x: margin + 15, y: legY, size: 8, font: helvetica, color: bodyColor });
      legY -= 12;
    }
    legY -= 6;
  }

  // -------------------------------------------------------------
  // PAGE 3: TABLE OF CONTENTS (SOMMAIRE DÉTAILLÉ)
  // -------------------------------------------------------------
  const page3 = pdfDoc.addPage([pageWidth, pageHeight]);
  addHeaderAndFooter(page3, 3, 8);

  page3.drawText('PLAN DÉTAILLÉ DU COURS', {
    x: margin,
    y: pageHeight - 80,
    size: 16,
    font: timesRomanBold,
    color: primaryColor,
  });

  page3.drawLine({
    start: { x: margin, y: pageHeight - 90 },
    end: { x: margin + 120, y: pageHeight - 90 },
    thickness: 2,
    color: goldColor,
  });

  const tocItems = [
    { title: 'INTRODUCTION GÉNÉRALE & CADRE NOTIONNEL', page: 'Page 4' },
    { title: '  Section 1 : Définition, genèse historique et sources', page: 'Page 4' },
    { title: '  Section 2 : Les principes directeurs et les fondements doctrinaux', page: 'Page 5' },
    { title: 'CHAPITRE I : LES NOTIONS FONDAMENTALES & CLASSIFICATIONS', page: 'Page 6' },
    { title: '  Sous-section 1.1 : Les critères de distinction théorique', page: 'Page 6' },
    { title: '  Sous-section 1.2 : Le régime juridique applicable et obligations des parties', page: 'Page 7' },
    { title: 'CHAPITRE II : DÉVELOPPEMENTS PRATIQUES, CAS D\'APPLICATION & JURISPRUDENCE', page: 'Page 8' },
    { title: '  Section 1 : Analyse des décisions récentes et interprétations des tribunaux', page: 'Page 8' },
    { title: '  Section 2 : Études de cas, exercices dirigés et méthodologie d\'examen', page: 'Page 8' },
  ];

  let tocY = pageHeight - 130;
  for (const item of tocItems) {
    const isMain = item.title.startsWith('CHAPITRE') || item.title.startsWith('INTRODUCTION');
    page3.drawText(item.title, {
      x: margin,
      y: tocY,
      size: isMain ? 10.5 : 9.5,
      font: isMain ? timesRomanBold : timesRoman,
      color: isMain ? primaryColor : bodyColor,
    });

    const pageW = helveticaBold.widthOfTextAtSize(item.page, 9);
    page3.drawText(item.page, {
      x: pageWidth - margin - pageW,
      y: tocY,
      size: 9,
      font: helveticaBold,
      color: goldColor,
    });

    // Dot leader
    page3.drawLine({
      start: { x: margin + timesRoman.widthOfTextAtSize(item.title, isMain ? 10.5 : 9.5) + 10, y: tocY + 3 },
      end: { x: pageWidth - margin - pageW - 10, y: tocY + 3 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });

    tocY -= isMain ? 32 : 24;
  }

  // -------------------------------------------------------------
  // PAGES 4 to 8: ACADEMIC CHAPTERS & LECTURES
  // -------------------------------------------------------------
  const chapters = [
    {
      num: 4,
      title: 'INTRODUCTION GÉNÉRALE : DÉFINITIONS & FONDEMENTS',
      section: 'Section 1 — Genèse, champ d\'application et articulation normative',
      paragraphs: [
        'L\'étude approfondie de cette discipline exige au préalable la délimitation rigoureuse de ses contours scientifiques et de son champ d\'investigation. En droit comme en sciences économiques et de gestion, la conceptualisation méthodique prévient toute ambiguïté terminologique.',
        'Les sources de la matière puisent leurs racines dans une tradition doctrinale riche complétée par les évolutions législatives contemporaines adoptées au Maroc. L\'harmonisation des normes nationales avec les standards internationaux a permis de moderniser les instruments de régulation.',
        'La compréhension des interactions entre les différents acteurs universitaires, institutionnels et juridictionnels permet de saisir la dynamique évolutive des règles applicables.',
      ],
      keyPoints: [
        'Primauté des règles d\'ordre public et de sécurité juridique.',
        'Rôle moteur de la doctrine académique dans l\'interprétation des textes.',
        'Interconnexion étroite entre théorie doctrinale et impératifs de la pratique.',
      ],
    },
    {
      num: 5,
      title: 'SECTION 2 : LES PRINCIPES DIRECTEURS & MODÈLES D\'ANALYSE',
      section: 'Section 2 — Typologie des relations et obligations réciproques',
      paragraphs: [
        'L\'agencement des relations entre les parties repose sur un postulat d\'équilibre contractuel et d\'efficience économique. La jurisprudence marocaine réaffirme constamment l\'exigence de bonne foi dans l\'exécution des engagements.',
        'La distinction fondamentale entre obligations de résultat et obligations de moyens constitue la clé de voûte de l\'appréciation de la responsabilité. Tandis que la première engage automatiquement le débiteur en l\'absence de survenance du résultat attendu, la seconde requiert l\'administration de la preuve d\'une faute caractérisée.',
        'Les mécanismes contemporains d\'exonération, tels que la force majeure ou le fait imprévisible d\'un tiers, font l\'objet d\'une interprétation restrictive afin de préserver la stabilité des transactions.',
      ],
      keyPoints: [
        'La bonne foi comme critère cardinal d\'évaluation des comportements.',
        'Distinction technique fondamentale entre obligations de résultat et de moyens.',
        'Encadrement rigoureux des causes d\'exonération et des clauses limitatives.',
      ],
    },
    {
      num: 6,
      title: 'CHAPITRE I : LES NOTIONS FONDAMENTALES & CLASSIFICATIONS',
      section: 'Section 1 — Critères de validité et régimes des nullités',
      paragraphs: [
        'La formation régulière de tout acte juridique ou économique demeure subordonnée au respect scrupuleux de conditions de validité substantielles : le consentement libre et éclairé, la capacité des parties, un objet déterminé et une cause licite.',
        'Les vices du consentement (l\'erreur, le dol et la violence) bénéficient d\'un traitement minutieux dans le cadre du Code des Obligations et Contrats. Leur sanction varie de la nullité relative à la nullité absolue selon que la règle enfreinte visait la protection d\'un intérêt particulier ou celle de l\'ordre public.',
        'L\'action en rescision pour lésion fait également l\'objet de règles spécifiques protégeant les personnes vulnérables contre les déséquilibres manifestes.',
      ],
      keyPoints: [
        'Vérification systématique des conditions de validité à l\'ouverture du dossier.',
        'Distinction opérationnelle nette entre nullité relative et nullité absolue.',
        'Délais de prescription et modalités de confirmation des actes annulables.',
      ],
    },
    {
      num: 7,
      title: 'CHAPITRE I (SUITE) : EFFETS ET EXÉCUTION DES OBLIGATIONS',
      section: 'Section 2 — L\'exécution forcée et les mesures conservatoires',
      paragraphs: [
        'Lorsque l\'une des parties fait défaut dans l\'accomplissement de ses devoirs, l\'arsenal procédural offre au créancier plusieurs voies de recours graduées. La mise en demeure préalable demeure le préalable indispensable pour faire courir les intérêts moratoires.',
        'L\'exécution forcée en nature prime en principe sur la compensation pécuniaire, sous réserve qu\'elle ne heurte pas une liberté personnelle fondamentale. À défaut, la condamnation à des dommages-intérêts réparateurs intervient pour replacer la victime dans la situation où elle se serait trouvée.',
        'L\'exception d\'inexécution (exceptio non adimpleti contractus) permet par ailleurs de suspendre unilatéralement ses propres prestations face à l\'inertie de l\'autre partie.',
      ],
      keyPoints: [
        'Nécessité de la mise en demeure formelle pour déclencher les effets du retard.',
        'Priorité doctrinale accordée à l\'exécution en nature chaque fois que possible.',
        'Mise en œuvre des voies d\'exécution et saisies conservatoires prévues par le Code de Procédure Civile.',
      ],
    },
    {
      num: 8,
      title: 'CHAPITRE II : CAS PRATIQUES & MÉTHODOLOGIE D\'EXAMEN',
      section: 'Section Finale — Guide méthodologique et annales d\'examens',
      paragraphs: [
        'La réussite de l\'épreuve universitaire repose pour moitié sur la maîtrise des connaissances de fond, et pour moitié sur la rigueur de la méthode démonstrative (syllogisme juridique, clarté du plan bipartite, précision du vocabulaire académique).',
        'Pour la résolution d\'un cas pratique : identifiez les faits pertinents, qualifiez-les juridiquement, posez le problème de droit sous forme interrogative, exposez la règle applicable, puis appliquez-la rigoureusement à l\'espèce avant de conclure.',
        'Les examens écrits sanctionnent avant tout la capacité de raisonnement critique, l\'esprit de synthèse et la conformité aux exigences formelles enseignées lors des travaux dirigés.',
      ],
      keyPoints: [
        'Respect scrupuleux du syllogisme : Majeure, Mineure, Conclusion.',
        'Clarté du plan en deux parties et deux sous-parties (I-A, I-B, II-A, II-B).',
        'Gestion optimale du temps d\'épreuve : 15 min d\'analyse, 45 min de rédaction.',
      ],
    },
  ];

  for (const ch of chapters) {
    const p = pdfDoc.addPage([pageWidth, pageHeight]);
    addHeaderAndFooter(p, ch.num, 8);

    // Chapter Header
    p.drawText(ch.title, {
      x: margin,
      y: pageHeight - 80,
      size: 13,
      font: timesRomanBold,
      color: primaryColor,
    });

    p.drawText(ch.section, {
      x: margin,
      y: pageHeight - 96,
      size: 9.5,
      font: helveticaBold,
      color: goldColor,
    });

    p.drawLine({
      start: { x: margin, y: pageHeight - 105 },
      end: { x: pageWidth - margin, y: pageHeight - 105 },
      thickness: 1,
      color: rgb(0.88, 0.88, 0.88),
    });

    let cY = pageHeight - 130;
    for (const paragraph of ch.paragraphs) {
      const wrapped = wrapText(paragraph, contentWidth, timesRoman, 10.5);
      for (const line of wrapped) {
        p.drawText(line, { x: margin, y: cY, size: 10.5, font: timesRoman, color: bodyColor });
        cY -= 16;
      }
      cY -= 10;
    }

    // Key points callout box
    cY -= 8;
    const boxHeight = ch.keyPoints.length * 20 + 35;
    p.drawRectangle({
      x: margin,
      y: cY - boxHeight,
      width: contentWidth,
      height: boxHeight,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.2, 0.4, 0.6),
      borderWidth: 1,
    });

    p.drawText('POINTS CLÉS DU COURS À RETENIR POUR L\'EXAMEN', {
      x: margin + 14,
      y: cY - 20,
      size: 9,
      font: helveticaBold,
      color: rgb(0.1, 0.3, 0.5),
    });

    let kpY = cY - 38;
    for (const point of ch.keyPoints) {
      p.drawText('•', { x: margin + 14, y: kpY, size: 10, font: helveticaBold, color: goldColor });
      const wrappedPt = wrapText(point, contentWidth - 35, helvetica, 8.5);
      for (const line of wrappedPt) {
        p.drawText(line, { x: margin + 28, y: kpY, size: 8.5, font: helvetica, color: bodyColor });
        kpY -= 13;
      }
      kpY -= 2;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
