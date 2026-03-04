import { useState } from "react";
import { Plus, Trash2, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import SortableItem from "../../SortableItem";
import CollapsibleSection from "../CollapsibleSection";

import { inputBase, inputStyle, cardBase, btnAddBase, btnDeleteBase, btnDeleteStyle, sectionTitle } from "../styles/formStyles";

function EducationCard({ edu, updateItem, handleDelete }) {
  const [open, setOpen] = useState(true);
  const summary = edu.study || edu.title || "Nuova formazione";

  return (
    <div className={cardBase}>
      <div className="flex items-center gap-2 mb-2">
        <button type="button" className="flex-1 flex items-center gap-2 text-left" onClick={() => setOpen(!open)}>
          <span className="font-semibold text-gray-800 break-words min-w-0 flex-1">{summary}</span>
          {edu.dateFrom && (
            <span className="text-xs text-gray-400 shrink-0">
              {edu.dateFrom}{edu.dateTo ? ` → ${edu.dateTo}` : ""}
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-gray-400 shrink-0 ml-auto" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 ml-auto" />}
        </button>
        <button type="button" onClick={(e) => handleDelete(e, edu.id)}
          style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#ef4444" }}>
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Da</label>
              <input type="text" className={inputBase} style={inputStyle} placeholder="es. 09/2018" value={edu.dateFrom}
                onChange={(e) => updateItem("education", edu.id, "dateFrom", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">A</label>
              <input type="text" className={inputBase} style={inputStyle} placeholder="es. 07/2021" value={edu.dateTo}
                onChange={(e) => updateItem("education", edu.id, "dateTo", e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Istituto</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Università di Bologna" value={edu.study}
              onChange={(e) => updateItem("education", edu.id, "study", e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Settore di studio</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Ingegneria Informatica" value={edu.study_sector}
              onChange={(e) => updateItem("education", edu.id, "study_sector", e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Qualifica</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Laurea Magistrale" value={edu.title}
              onChange={(e) => updateItem("education", edu.id, "title", e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Livello nazionale</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Livello 7 EQF" value={edu.national_level}
              onChange={(e) => updateItem("education", edu.id, "national_level", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Votazione</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. 110/110 con lode" value={edu.grade || ""}
              onChange={(e) => updateItem("education", edu.id, "grade", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function EducationSection({ formData, addItem, updateItem, removeItem, reorder }) {
  const education = formData.education;

  const handleDelete = (e, eduId) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem("education", eduId);
  };

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Istruzione" count={education.length}>
        <div className="flex justify-end">
          <button type="button" className={btnAddBase}
            onClick={() => addItem("education", { dateFrom: "", dateTo: "", study: "", study_sector: "", title: "", national_level: "", grade: "" })}>
            <Plus size={20} /> Aggiungi
          </button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={(e) => reorder(e, "education")}>
          <SortableContext items={education.map((edu) => edu.id)} strategy={verticalListSortingStrategy}>
            {education.map((edu) => (
              <SortableItem key={edu.id} id={edu.id}>
                <EducationCard edu={edu} updateItem={updateItem} handleDelete={handleDelete} />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

        {education.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap size={48} className="mx-auto mb-3 opacity-50" />
            <p>Nessuna formazione aggiunta. Clicca su "Aggiungi" per iniziare.</p>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
