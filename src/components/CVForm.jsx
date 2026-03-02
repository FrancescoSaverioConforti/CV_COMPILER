import { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Languages,
  Award,
  Folder,
  FileText,
  Car,
  Download,
  BookOpen,
} from "lucide-react";

import useCVState from "./CvForm/hooks/useCVState";
import useReorder from "./CvForm/hooks/useReorder";

import ContactSection from "./CvForm/sections/ContactSection";
import ExperienceSection from "./CvForm/sections/ExperienceSection";
import EducationSection from "./CvForm/sections/EducationSection";
import LanguagesSection from "./CvForm/sections/LanguagesSection";
import SkillsSection from "./CvForm/sections/SkillsSection";
import ProjectsSection from "./CvForm/sections/ProjectsSection";
import PublicationsSection from "./CvForm/sections/PublicationsSection";
import CertificationsSection from "./CvForm/sections/CertificationsSection";
import OtherInfoSection from "./CvForm/sections/OtherInfoSection";

import { generateCV, generateCVBlob } from "./generateCV";

import { importPDF_OCR } from "./CvForm/utils/importPDF_OCR";
import parseEuropassOCR from "./CvForm/utils/parseEuropassOCR";

// Normalize parsed OCR data to match the form's expected shape
function normalizeOCRData(parsed) {
  return {
    ...parsed,
    // Normalize skill groups: OCR may produce {title, skills:[{id,name}]}
    // Form expects {name, _skillsText}
    skillGroups: (parsed.skillGroups || []).map(g => ({
      ...g,
      name: g.name || g.title || "",
      _skillsText: g._skillsText || (g.skills ? g.skills.map(s => s.name || s).join(", ") : ""),
    })),
    // Normalize certifications: OCR produces {title}, form uses {name}
    certifications: (parsed.certifications || []).map(c => ({
      ...c,
      name: c.name || c.title || "",
    })),
    // Ensure languages structure is correct
    languages: {
      motherTongue: typeof parsed.languages?.motherTongue === "string"
        ? parsed.languages.motherTongue
        : (typeof parsed.languages === "string" ? parsed.languages : ""),
      other: (parsed.languages?.other || []).map(l => ({
        ...l,
        listen: l.listen || l.read || "",
        interact: l.interact || l.speak || "",
      })),
    },
  };
}

export default function CVForm() {
  const {
    formData,
    setFormData,
    updateContact,
    addItem,
    updateItem,
    removeItem,
  } = useCVState();

  const reorder = useReorder(formData, setFormData);
  const [activeSection, setActiveSection] = useState("contact");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [lastBackup, setLastBackup] = useState(null);

  // -------------------------
  // BACKUP MANUALE
  // -------------------------
  const handleSaveBackup = () => {
    const json = JSON.stringify(formData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}_${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;
    a.href = url;
    a.download = `CV_backup_${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastBackup(now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
  };

  // -------------------------
  // RIPRISTINO DA BACKUP
  // -------------------------
  const handleRestoreBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setFormData(data);
        alert("Backup ripristinato correttamente!");
      } catch {
        alert("File non valido. Assicurati di caricare un backup JSON generato da questa app.");
      }
    };
    reader.readAsText(file);
  };

  // -------------------------
  // AUTO-BACKUP ogni 2 minuti
  // -------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const json = JSON.stringify(formData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}_${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;
      a.href = url;
      a.download = `CV_auto_backup_${ts}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setLastBackup(now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [formData]);

  const handleImportPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset the input so the same file can be re-imported
    e.target.value = "";

    try {
      const text = await importPDF_OCR(file);
      const parsed = parseEuropassOCR(text);
      const normalized = normalizeOCRData(parsed);
      setFormData(normalized);
      alert("CV importato correttamente!");
    } catch (err) {
      console.error("Errore importazione PDF OCR", err);
      alert("Errore durante l'importazione del PDF.");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const blob = await generateCVBlob(formData);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("Errore generazione PDF:", err);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [formData]);

  const sections = [
    { id: "contact", label: "Dati Personali", icon: User },
    { id: "experience", label: "Esperienza", icon: Briefcase },
    { id: "education", label: "Formazione", icon: GraduationCap },
    { id: "languages", label: "Lingue", icon: Languages },
    { id: "skills", label: "Competenze", icon: Award },
    { id: "certifications", label: "Certificazioni", icon: BookOpen },
    { id: "projects", label: "Progetti", icon: Folder },
    { id: "publications", label: "Pubblicazioni", icon: FileText },
    { id: "other", label: "Altro", icon: Car },
  ];

  // Count badge for each section
  const counts = {
    experience: formData.experience?.length || 0,
    education: formData.education?.length || 0,
    languages: formData.languages?.other?.length || 0,
    skills: formData.skillGroups?.length || 0,
    certifications: formData.certifications?.length || 0,
    projects: formData.projects?.length || 0,
    publications: formData.publications?.length || 0,
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">

      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
        <h1 className="text-4xl font-bold">Generatore CV Europass</h1>
        <p className="text-blue-100 text-lg">
          Compila il tuo curriculum europeo con anteprima PDF in tempo reale
        </p>
      </header>

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden max-h-[calc(100vh-160px)]">

        {/* SIDEBAR */}
        <aside className="w-64 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
          <nav className="space-y-2">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon size={20} />
                <span className="flex-1 text-left">{label}</span>
                {counts[id] > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    activeSection === id ? "bg-white text-blue-600" : "bg-blue-100 text-blue-700"
                  }`}>
                    {counts[id]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* FORM + PDF */}
        <main className="flex flex-1 overflow-hidden">

          {/* FORM */}
          <div className="flex-1 p-8 overflow-y-auto">

            {activeSection === "contact" && (
              <ContactSection formData={formData} updateContact={updateContact} />
            )}

            {activeSection === "experience" && (
              <ExperienceSection
                formData={formData}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                reorder={reorder}
              />
            )}

            {activeSection === "education" && (
              <EducationSection
                formData={formData}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                reorder={reorder}
              />
            )}

            {activeSection === "languages" && (
              <LanguagesSection
                formData={formData}
                setFormData={setFormData}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                reorder={reorder}
              />
            )}

            {activeSection === "skills" && (
              <SkillsSection
                formData={formData}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                reorder={reorder}
              />
            )}

            {activeSection === "certifications" && (
              <CertificationsSection
                formData={formData}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                reorder={reorder}
              />
            )}

            {activeSection === "projects" && (
              <ProjectsSection
                formData={formData}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                reorder={reorder}
              />
            )}

            {activeSection === "publications" && (
              <PublicationsSection
                formData={formData}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                reorder={reorder}
              />
            )}

            {activeSection === "other" && (
              <OtherInfoSection formData={formData} setFormData={setFormData} />
            )}

          </div>

          {/* PDF PREVIEW */}
          <div className="w-1/2 border-l bg-gray-200 overflow-y-auto">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="Preview PDF"
              />
            ) : (
              <p className="text-gray-500 p-4">Generazione anteprima…</p>
            )}
          </div>

        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-200">
        {/* Riga pulsanti */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">

          {/* Sinistra: import/export backup */}
          <div className="flex items-center gap-3">
            {/* Importa PDF Europass */}
            <input type="file" accept="application/pdf" id="importPdfInput" className="hidden" onChange={handleImportPDF} />
            <label htmlFor="importPdfInput"
              className="px-4 py-2 bg-yellow-400 text-black rounded-lg shadow hover:bg-yellow-500 cursor-pointer font-medium text-sm">
              📥 Importa PDF
            </label>

            {/* Salva backup JSON */}
            <button onClick={handleSaveBackup}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 font-medium text-sm">
              💾 Salva backup
            </button>

            {/* Ripristina da backup JSON */}
            <input type="file" accept="application/json" id="restoreBackupInput" className="hidden" onChange={handleRestoreBackup} />
            <label htmlFor="restoreBackupInput"
              className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 cursor-pointer font-medium text-sm">
              🔄 Ripristina backup
            </label>

            {/* Indicatore auto-backup */}
            {lastBackup && (
              <span className="text-xs text-gray-500 italic">
                Auto-backup: {lastBackup}
              </span>
            )}
          </div>

          {/* Destra: scarica PDF */}
          <button onClick={() => generateCV(formData)}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 font-medium text-sm">
            <Download size={18} />
            Scarica PDF
          </button>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 py-2 px-6 text-center text-xs text-gray-400">
          Sviluppata da <span className="font-semibold text-gray-500">Francesco Saverio Conforti</span> — Tutti i diritti riservati © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
