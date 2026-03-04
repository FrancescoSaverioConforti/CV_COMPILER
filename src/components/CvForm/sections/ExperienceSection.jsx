import { useState } from "react";
import { Plus, Trash2, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "../../SortableItem";
import CollapsibleSection from "../CollapsibleSection";

import {
  inputBase,
  inputStyle,
  textareaBase,
  cardBase,
  btnAddBase,
  btnDeleteBase,
  btnDeleteStyle,
  sectionTitle,
} from "../styles/formStyles";

function ExperienceCard({ exp, updateItem, handleDelete }) {
  const [open, setOpen] = useState(true);

  const summary = exp.company
    ? `${exp.title ? exp.title + " @ " : ""}${exp.company}`
    : exp.title || "Nuova esperienza";

  return (
    <div className={cardBase}>
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          className="flex-1 flex items-center gap-2 text-left"
          onClick={() => setOpen(!open)}
        >
          <span className="font-semibold text-gray-800 break-words min-w-0 flex-1">{summary}</span>
          {exp.dateFrom && (
            <span className="text-xs text-gray-400 shrink-0">
              {exp.dateFrom}{exp.dateTo ? ` → ${exp.dateTo}` : ""}
            </span>
          )}
          {open ? (
            <ChevronUp size={16} className="text-gray-400 shrink-0 ml-auto" />
          ) : (
            <ChevronDown size={16} className="text-gray-400 shrink-0 ml-auto" />
          )}
        </button>
        <button
          type="button"
          onClick={(e) => handleDelete(e, exp.id)}
          style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#ef4444" }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Da</label>
              <input type="text" className={inputBase} style={inputStyle} placeholder="es. 01/2020" value={exp.dateFrom}
                onChange={(e) => updateItem("experience", exp.id, "dateFrom", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">A</label>
              <input type="text" className={inputBase} style={inputStyle} placeholder="es. 12/2023" value={exp.dateTo}
                onChange={(e) => updateItem("experience", exp.id, "dateTo", e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Datore di lavoro</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Acme Corporation" value={exp.company}
              onChange={(e) => updateItem("experience", exp.id, "company", e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Settore</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Tecnologia" value={exp.company_sector}
              onChange={(e) => updateItem("experience", exp.id, "company_sector", e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo di impiego</label>
            <input type="text" className={inputBase} style={inputStyle} placeholder="es. Software Developer" value={exp.title}
              onChange={(e) => updateItem("experience", exp.id, "title", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mansioni (una per riga)</label>
            <textarea className={textareaBase} style={inputStyle} rows="4"
              placeholder="Sviluppo applicazioni web&#10;Gestione team&#10;Code review"
              value={exp.responsibilities.join("\n")}
              onChange={(e) => updateItem("experience", exp.id, "responsibilities", e.target.value.split("\n"))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExperienceSection({ formData, addItem, updateItem, removeItem, reorder }) {
  const experiences = formData.experience;

  const handleDelete = (e, expId) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem("experience", expId);
  };

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Esperienza Lavorativa" count={experiences.length}>
        <div className="flex justify-end">
          <button type="button" className={btnAddBase}
            onClick={() => addItem("experience", { dateFrom: "", dateTo: "", company: "", company_sector: "", title: "", responsibilities: [] })}>
            <Plus size={20} /> Aggiungi
          </button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={(e) => reorder(e, "experience")}>
          <SortableContext items={experiences.map((exp) => exp.id)} strategy={verticalListSortingStrategy}>
            {experiences.map((exp) => (
              <SortableItem key={exp.id} id={exp.id}>
                <ExperienceCard exp={exp} updateItem={updateItem} handleDelete={handleDelete} />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

        {experiences.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Briefcase size={48} className="mx-auto mb-3 opacity-50" />
            <p>Nessuna esperienza aggiunta. Clicca su "Aggiungi" per iniziare.</p>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
