import { useState } from "react";
import { Plus, Trash2, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import SortableItem from "../../SortableItem";
import CollapsibleSection from "../CollapsibleSection";

import { inputBase, inputStyle, cardBase, btnAddBase } from "../styles/formStyles";

function LanguageCard({ lang, updateItem, handleDelete }) {
  const [open, setOpen] = useState(true);
  const summary = lang.lang || "Nuova lingua";

  return (
    <div className={cardBase}>
      <div className="flex items-center gap-2 mb-2">
        <button type="button" className="flex-1 flex items-center gap-2 text-left" onClick={() => setOpen(!open)}>
          <span className="font-semibold text-gray-800 break-words min-w-0 flex-1">{summary}</span>
          {open ? <ChevronUp size={16} className="text-gray-400 shrink-0 ml-auto" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 ml-auto" />}
        </button>
        <button type="button" onClick={(e) => handleDelete(e, lang.id)}
          style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#ef4444" }}>
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lingua</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Inglese" value={lang.lang || ""}
              onChange={(e) => updateItem("languages", lang.id, "lang", e.target.value)} />
          </div>

          {/* Header row */}
          <div className="grid grid-cols-2 gap-3 mb-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide col-span-2">Comprensione</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ascolto</label>
              <input type="text" className={inputBase} style={inputStyle} placeholder="es. B2" value={lang.listen || ""}
                onChange={(e) => updateItem("languages", lang.id, "listen", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lettura</label>
              <input type="text" className={inputBase} style={inputStyle} placeholder="es. B2" value={lang.read || ""}
                onChange={(e) => updateItem("languages", lang.id, "read", e.target.value)} />
            </div>
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Parlato</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Interazione</label>
              <input type="text" className={inputBase} style={inputStyle} placeholder="es. B1" value={lang.interact || ""}
                onChange={(e) => updateItem("languages", lang.id, "interact", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Produzione orale</label>
              <input type="text" className={inputBase} style={inputStyle} placeholder="es. B1" value={lang.speak || ""}
                onChange={(e) => updateItem("languages", lang.id, "speak", e.target.value)} />
            </div>
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Scritto</p>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Produzione scritta</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. B2" value={lang.write || ""}
              onChange={(e) => updateItem("languages", lang.id, "write", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function LanguagesSection({ formData, setFormData, addItem, updateItem, removeItem, reorder }) {
  const languages = formData.languages?.other || [];

  const updateMotherTongue = (value) => {
    setFormData(prev => ({ ...prev, languages: { ...prev.languages, motherTongue: value } }));
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem("languages", id);
  };

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Lingue" count={languages.length}>
        <div className={cardBase}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Madrelingua</label>
          <input type="text" className={inputBase} style={inputStyle} placeholder="es. Italiano"
            value={formData.languages?.motherTongue || ""}
            onChange={(e) => updateMotherTongue(e.target.value)} />
        </div>

        <div className="flex justify-between items-center mt-4">
          <h3 className="text-lg font-semibold text-gray-700">Altre lingue</h3>
          <button type="button" className={btnAddBase}
            onClick={() => addItem("languages", { lang: "", listen: "", read: "", interact: "", speak: "", write: "" })}>
            <Plus size={20} /> Aggiungi
          </button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={(e) => reorder(e, "languages")}>
          <SortableContext items={languages.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            {languages.map((lang) => (
              <SortableItem key={lang.id} id={lang.id}>
                <LanguageCard lang={lang} updateItem={updateItem} handleDelete={handleDelete} />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

        {languages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Globe size={40} className="mx-auto mb-3 opacity-50" />
            <p>Nessuna lingua aggiunta. Clicca su "Aggiungi" per iniziare.</p>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
