// parseEuropassOCR.js — Parser Europass italiano

export default function parseEuropassOCR(structuredText) {
  console.log("=== PARSING EUROPASS ===");

  // ----------------------------------------------------------------
  // STEP 1: costruisce array di {label, value} dal testo strutturato
  // Formato righe: "label | value" oppure "\tvalue" (continuazione)
  // ----------------------------------------------------------------
  const lines = structuredText.split("\n");
  const pairs = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(" | ")) {
      const idx = line.indexOf(" | ");
      const label = line.substring(0, idx).replace(/^[•*\-\s]+/, "").trim();
      let value = line.substring(idx + 3).trim();
      // Righe successive con tab = continuazione valore
      while (i + 1 < lines.length && lines[i + 1].startsWith("\t")) {
        i++;
        value += " " + lines[i].trim();
      }
      if (label || value) pairs.push({ label, value: value.trim() });
    } else if (line.startsWith("\t") && line.trim()) {
      // Valore standalone (label vuota)
      pairs.push({ label: "", value: line.trim() });
    } else if (line.trim()) {
      pairs.push({ label: line.replace(/^[•*\-\s]+/, "").trim(), value: "" });
    }
  }

  console.log("Pairs:", pairs.length, "- Prime 25:", pairs.slice(0, 25));

  // ----------------------------------------------------------------
  // UTILITY
  // ----------------------------------------------------------------
  const findValue = (regex) => {
    const p = pairs.find(p => regex.test(p.label));
    return p ? p.value : "";
  };

  const findIdx = (regex) => pairs.findIndex(p => regex.test(p.label));

  // Restituisce i pairs da startIdx+1 fino alla prima sezione successiva
  const getSection = (startRegex, endRegex) => {
    const start = findIdx(startRegex);
    if (start < 0) return [];
    let end = pairs.length;
    for (let i = start + 1; i < pairs.length; i++) {
      if (!pairs[i].value && endRegex.test(pairs[i].label) && pairs[i].label.length > 3) {
        end = i; break;
      }
    }
    return pairs.slice(start + 1, end);
  };

  // ----------------------------------------------------------------
  // DATI PERSONALI
  // ----------------------------------------------------------------
  const nomeCognome = findValue(/^nome$/i);
  let firstName = "", lastName = "";
  if (nomeCognome) {
    const parts = nomeCognome.trim().split(/\s+/);
    // Primo split = cognome, il resto = nome
    lastName  = parts[0] || "";
    firstName = parts.slice(1).join(" ") || "";
  }

  const contact = {
    firstName,
    lastName,
    email:       findValue(/^e-?mail$|^email$/i),
    pec:         findValue(/^pec$/i),
    phone:       findValue(/^telefono$|^cellulare$/i),
    location:    findValue(/^indirizzo$/i),
    nationality: findValue(/^nazionalit/i),
    gender:      findValue(/^sesso$/i),
    dateOfBirth: findValue(/^data di nascita$/i),
  };
  console.log("Contact:", contact);

  // ----------------------------------------------------------------
  // ESPERIENZA LAVORATIVA
  // ----------------------------------------------------------------
  const experience = [];
  const END_EXP = /^(istruzione|formazione|lingue|capacit|competenze|certificazioni|patente)/i;

  const expPairs = getSection(/^esperienza lavorativa$/i, END_EXP);

  // Splitta in blocchi su ogni "Date (da"
  const expBlocks = splitBlocks(expPairs, /^date\s*\(da/i);

  expBlocks.forEach(block => {
    const dateRaw      = blockVal(block, /^date\s*\(da/i);
    const tipoContr    = blockVal(block, /tipo di contratto/i);
    const company      = blockVal(block, /nome e indirizzo del datore|datore di lavoro/i);
    const sector       = blockVal(block, /tipo di attivit|tipo di azienda/i);
    const title        = blockVal(block, /lavoro o posizione|posizione ricop/i);
    const respRaw      = blockVal(block, /principali attivit|principali mansioni/i);

    const { dateFrom, dateTo } = parseDateRange(dateRaw);
    const responsibilities = respRaw
      ? respRaw.split(/(?<=[a-z])\s+(?=[A-Z])/).map(s => s.trim()).filter(s => s.length > 3)
      : [];

    if (company || title || dateFrom) {
      experience.push({
        id: crypto.randomUUID(),
        dateFrom, dateTo, company,
        company_sector: [tipoContr, sector].filter(Boolean).join(" — "),
        title, responsibilities,
      });
    }
  });
  console.log("Esperienza:", experience.length);

  // ----------------------------------------------------------------
  // ISTRUZIONE E FORMAZIONE
  // ----------------------------------------------------------------
  const education = [];
  const END_EDU = /^(lingue|capacit|competenze|certificazioni|corsi|patente)/i;

  const eduPairs = getSection(/^istruzione e formazione$|^istruzione$/i, END_EDU);
  const eduBlocks = splitBlocks(eduPairs, /^date\s*\(da/i);

  eduBlocks.forEach(block => {
    const dateRaw     = blockVal(block, /^date\s*\(da/i);
    const study       = blockVal(block, /nome e tipo d.organizzazione|istituto|università|scuola/i);
    const study_sector= blockVal(block, /corso di studio|principali materie/i);
    const title       = blockVal(block, /titolo della qualifica|qualifica|diploma|laurea|master/i);
    const national_level = blockVal(block, /livello.*classificazione|livello eqf|isced/i);
    const { dateFrom, dateTo } = parseDateRange(dateRaw);

    if (study || title || dateFrom) {
      education.push({
        id: crypto.randomUUID(),
        dateFrom, dateTo, study, study_sector, title, national_level,
      });
    }
  });
  console.log("Istruzione:", education.length);

  // ----------------------------------------------------------------
  // LINGUE
  // "Inglese | buono buono buono buono buono"
  // 5 valori in ordine: ascolto lettura interazione produzione-orale scritto
  // ----------------------------------------------------------------
  const motherTongue = findValue(/^madrelingua/i);
  const otherLanguages = [];

  const SKIP_LANG = /^(Comprensione|Parlato|Scritto|Ascolto|Lettura|Interazione|Produzione|Autovalutazione|Livello|Altra|ALTRE)/i;
  const LEVEL_WORD = /\b(A1|A2|B1|B2|C1|C2|elementare|buono|ottimo|intermedio|avanzato|madrelingua|excellent|fluent|basic)\b/i;

  // Cerca nella zona dopo "Altra/e lingua/e" fino alla prossima sezione grande
  const langStart = findIdx(/altra.*lingua|^ALTRE LINGUE$/i);
  const langEnd = (() => {
    if (langStart < 0) return 0;
    for (let i = langStart + 1; i < pairs.length; i++) {
      const lbl = pairs[i].label;
      if (!pairs[i].value && /^(COMPETENZE|CAPACIT|CERTIFICAZIONI|CORSI|PATENTE)/i.test(lbl)) return i;
    }
    return pairs.length;
  })();

  const langPairs = langStart >= 0 ? pairs.slice(langStart + 1, langEnd) : [];

  for (const p of langPairs) {
    if (SKIP_LANG.test(p.label)) continue;
    if (SKIP_LANG.test(p.value)) continue;
    if (p.value && LEVEL_WORD.test(p.value)) {
      const levels = p.value.trim().split(/\s+/);
      otherLanguages.push({
        id: crypto.randomUUID(),
        lang:     p.label.replace(/^[•*\s]+/, "").trim(),
        listen:   levels[0] || "",
        read:     levels[1] || "",
        interact: levels[2] || "",
        speak:    levels[3] || "",
        write:    levels[4] || "",
      });
    }
  }
  console.log("Lingue:", otherLanguages.map(l => l.lang));

  // ----------------------------------------------------------------
  // COMPETENZE
  // Nel PDF: "Capacità e competenze informatiche" come label di sezione
  // poi righe con label vuota e valore = testo competenza
  // ----------------------------------------------------------------
  const skillGroups = [];

  const SKILL_SECTIONS = [
    { regex: /capacit.*competenze informatiche|competenze informatiche/i, name: "Capacità e competenze informatiche" },
    { regex: /capacit.*competenze tecniche/i,      name: "Competenze tecniche" },
    { regex: /capacit.*competenze relazionali/i,   name: "Competenze relazionali" },
    { regex: /capacit.*competenze organizzative/i, name: "Competenze organizzative" },
    { regex: /^altre capacit|^altre competenze/i,  name: "Altre competenze" },
  ];

  // Fine sezione competenze = inizio certificazioni o patente
  const END_SKILLS = /^(CERTIFICAZIONI|CORSI FORMATIVI|PATENTE|PUBBLICAZIONI|ULTERIORI)/i;

  for (const { regex, name } of SKILL_SECTIONS) {
    const idx = findIdx(regex);
    if (idx < 0) continue;

    // Raccogli tutti i valori fino alla prossima sezione principale
    const lines = [];
    for (let i = idx + 1; i < pairs.length; i++) {
      const p = pairs[i];
      // Stop se troviamo intestazione di nuova sezione (label maiuscola senza valore)
      if (!p.value && p.label.length > 4 && /^[A-ZÀÈÌÒÙ\s]{4,}$/.test(p.label)) break;
      if (!p.value && END_SKILLS.test(p.label)) break;
      // Raccogli sia value che label (a volte il testo è solo nella label)
      const text = p.value || p.label;
      if (text && text.length > 3) lines.push(text);
    }

    if (lines.length > 0) {
      skillGroups.push({
        id: crypto.randomUUID(),
        name,
        _skillsText: lines.join("\n"),
      });
    }
  }
  console.log("Competenze:", skillGroups.length, "gruppi");

  // ----------------------------------------------------------------
  // CERTIFICAZIONI
  // Stessa struttura: lista libera di righe dopo la sezione header
  // ----------------------------------------------------------------
  const certifications = [];
  const certIdx = findIdx(/^CERTIFICAZIONI$|^CORSI FORMATIVI/i);
  const certEnd = (() => {
    if (certIdx < 0) return 0;
    for (let i = certIdx + 1; i < pairs.length; i++) {
      if (!pairs[i].value && /^(PATENTE|CAPACIT|PUBBLICAZIONI|ULTERIORI)/i.test(pairs[i].label)) return i;
    }
    return pairs.length;
  })();

  const certPairs = certIdx >= 0 ? pairs.slice(certIdx + 1, certEnd) : [];
  certPairs.forEach(p => {
    const text = (p.value && p.value.length > 4) ? p.value
               : (p.label && p.label.length > 4) ? p.label : "";
    if (!text) return;
    if (/^(PATENTE|CAPACIT|Date|Nome|Tipo|Livello|Pagina|\d+\s*[\/\-])/i.test(text)) return;
    certifications.push({ id: crypto.randomUUID(), name: text, issuer: "", year: "" });
  });
  console.log("Certificazioni:", certifications.length);

  // ----------------------------------------------------------------
  // PATENTE
  // ----------------------------------------------------------------
  const drivingLicense = findValue(/patente o patenti|patente di guida|^patente$/i);

  // ----------------------------------------------------------------
  // OUTPUT
  // ----------------------------------------------------------------
  return {
    contact,
    experience,
    education,
    languages: { motherTongue: motherTongue || "", other: otherLanguages },
    skillGroups,
    certifications,
    projects: [],
    publications: [],
    drivingLicense,
  };
}

// ----------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------

function splitBlocks(pairs, startRegex) {
  const blocks = [];
  let current = [];
  for (const p of pairs) {
    if (startRegex.test(p.label) && current.length > 0) {
      blocks.push(current);
      current = [p];
    } else {
      current.push(p);
    }
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

function blockVal(block, regex) {
  return block.find(p => regex.test(p.label))?.value || "";
}

function parseDateRange(raw) {
  if (!raw) return { dateFrom: "", dateTo: "" };
  const t = raw.trim();

  // "15/11/2023 alla data attuale" o "2023 alla data attuale"
  const m1 = t.match(/^([\d\/]+)\s+alla\s+data\s+attuale/i);
  if (m1) return { dateFrom: m1[1], dateTo: "Attuale" };

  // "15/05/2023-15/11/2023" o "2019–2023"
  const m2 = t.match(/^([\d\/]+)\s*[-–]\s*([\d\/]+|[Aa]ttuale|[Pp]resente)/);
  if (m2) return { dateFrom: m2[1], dateTo: m2[2] };

  // Singola data
  return { dateFrom: t, dateTo: "" };
}
