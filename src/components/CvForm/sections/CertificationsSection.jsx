import { useState } from "react";
import { Plus, Trash2, Award, ChevronDown, ChevronUp } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import SortableItem from "../../SortableItem";
import CollapsibleSection from "../CollapsibleSection";

import { inputBase, inputStyle, cardBase, btnAddBase } from "../styles/formStyles";

function CertCard({ cert, updateItem, removeItem }) {
  const [open, setOpen] = useState(true);
  const summary = cert.name || cert.title || "Nuova certificazione";

  return (
    <div className={cardBase}>
      <div className="flex items-center gap-2 mb-2">
        <button type="button" className="flex-1 flex items-center gap-2 text-left" onClick={() => setOpen(!open)}>
          <span className="font-semibold text-gray-800 break-words min-w-0 flex-1">{summary}</span>
          {open ? <ChevronUp size={16} className="text-gray-400 shrink-0 ml-auto" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 ml-auto" />}
        </button>
        <button type="button" onClick={() => removeItem("certifications", cert.id)}
          style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#ef4444" }}>
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo certificazione</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Certificato Siemens KNX"
              value={cert.name || cert.title || ""}
              onChange={(e) => updateItem("certifications", cert.id, "name", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ente rilasciante</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Siemens"
              value={cert.issuer || ""}
              onChange={(e) => updateItem("certifications", cert.id, "issuer", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anno</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. 2023"
              value={cert.year || ""}
              onChange={(e) => updateItem("certifications", cert.id, "year", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CertificationsSection({ formData, addItem, updateItem, removeItem, reorder }) {
  const certifications = formData.certifications || [];

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Corsi e Certificazioni" count={certifications.length}>
        <div className="flex justify-end">
          <button type="button" className={btnAddBase}
            onClick={() => addItem("certifications", { name: "", issuer: "", year: "" })}>
            <Plus size={20} /> Aggiungi
          </button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={(e) => reorder(e, "certifications")}>
          <SortableContext items={certifications.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {certifications.map((cert) => (
              <SortableItem key={cert.id} id={cert.id}>
                <CertCard cert={cert} updateItem={updateItem} removeItem={removeItem} />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

        {certifications.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Award size={40} className="mx-auto mb-3 opacity-50" />
            <p>Nessuna certificazione aggiunta. Clicca su "Aggiungi" per iniziare.</p>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
