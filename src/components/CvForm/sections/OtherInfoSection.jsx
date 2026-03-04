import { useState } from "react";
import { Plus, Trash2, PlusCircle, X } from "lucide-react";
import { inputBase, inputStyle, cardBase, sectionTitle, btnAddBase, labelBase } from "../styles/formStyles";

function CustomSectionCard({ section, onChange, onRemove }) {
  const updateTitle = (val) => onChange({ ...section, title: val });
  const updateRow = (rowId, field, val) => onChange({
    ...section,
    rows: section.rows.map(r => r.id === rowId ? { ...r, [field]: val } : r)
  });
  const addRow = () => onChange({
    ...section,
    rows: [...section.rows, { id: crypto.randomUUID(), label: "", value: "" }]
  });
  const removeRow = (rowId) => onChange({
    ...section,
    rows: section.rows.filter(r => r.id !== rowId)
  });

  return (
    <div className={cardBase} style={{ marginBottom: "16px" }}>
      <div className="flex items-start gap-2 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Titolo sezione</label>
          <input
            type="text"
            className={inputBase}
            style={inputStyle}
            placeholder="es. PUBBLICAZIONI, VOLONTARIATO..."
            value={section.title}
            onChange={(e) => updateTitle(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          style={{ marginTop: "28px", background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: "#ef4444", flexShrink: 0 }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {section.rows.map((row) => (
          <div key={row.id} className="flex items-start gap-2">
            <div style={{ width: "200px", flexShrink: 0 }}>
              <label className="block text-xs font-medium text-gray-500 mb-1">Etichetta (sx)</label>
              <input
                type="text"
                className={inputBase}
                style={{ ...inputStyle, fontSize: "13px", padding: "8px 12px" }}
                placeholder="es. Data, Ruolo..."
                value={row.label}
                onChange={(e) => updateRow(row.id, "label", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Contenuto (dx)</label>
              <textarea
                className={inputBase}
                style={{ ...inputStyle, fontSize: "13px", padding: "8px 12px", resize: "vertical", minHeight: "40px" }}
                placeholder="es. 2020-2023, Descrizione attivita..."
                value={row.value}
                onChange={(e) => updateRow(row.id, "value", e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              style={{ marginTop: "22px", background: "none", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px 8px", cursor: "pointer", color: "#9ca3af", flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: "14px", fontWeight: "500", padding: "4px 0" }}
      >
        <PlusCircle size={16} /> Aggiungi campo
      </button>
    </div>
  );
}

export default function OtherInfoSection({ formData, setFormData }) {
  const today = new Date();
  const autoDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
  const customSections = formData.customSections || [];

  const addCustomSection = () => {
    setFormData(prev => ({
      ...prev,
      customSections: [
        ...(prev.customSections || []),
        { id: crypto.randomUUID(), title: "", rows: [{ id: crypto.randomUUID(), label: "", value: "" }] }
      ]
    }));
  };

  const updateCustomSection = (id, updated) => {
    setFormData(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => s.id === id ? updated : s)
    }));
  };

  const removeCustomSection = (id) => {
    setFormData(prev => ({
      ...prev,
      customSections: prev.customSections.filter(s => s.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Altre Informazioni</h2>

      <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Patente di guida</label>
        <input
          type="text"
          className={inputBase}
          style={inputStyle}
          placeholder="es. B"
          value={formData.drivingLicense}
          onChange={(e) => setFormData(prev => ({ ...prev, drivingLicense: e.target.value }))}
        />
      </div>

      <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Firma e Data</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Luogo</label>
            <input
              type="text"
              className={inputBase}
              style={inputStyle}
              placeholder="es. Roma"
              value={formData.signatureLocation || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, signatureLocation: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
            <input
              type="text"
              className={inputBase}
              style={{ ...inputStyle, backgroundColor: "#f9fafb", color: "#6b7280" }}
              value={autoDate}
              readOnly
            />
            <p className="text-xs text-gray-400 mt-1">Generata automaticamente</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">Firma e data appariranno in fondo all'ultima pagina del CV.</p>
      </div>

      <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Sezioni personalizzate</h3>
          <button type="button" className={btnAddBase} onClick={addCustomSection}>
            <Plus size={18} /> Aggiungi sezione
          </button>
        </div>

        {customSections.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6">
            Nessuna sezione personalizzata. Clicca "Aggiungi sezione" per crearne una.
          </p>
        )}

        {customSections.map(section => (
          <CustomSectionCard
            key={section.id}
            section={section}
            onChange={(updated) => updateCustomSection(section.id, updated)}
            onRemove={() => removeCustomSection(section.id)}
          />
        ))}
      </div>
    </div>
  );
}
