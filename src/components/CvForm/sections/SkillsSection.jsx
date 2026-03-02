import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import SortableItem from "../../SortableItem";
import CollapsibleSection from "../CollapsibleSection";

import { inputBase, textareaBase, cardBase, btnAddBase, btnDeleteBase, sectionTitle } from "../styles/formStyles";

function SkillCard({ group, updateItem, removeItem }) {
  const [open, setOpen] = useState(true);
  const summary = group.name || group.title || "Nuovo gruppo";

  return (
    <div className={cardBase}>
      <div className="flex items-center gap-2 mb-2">
        <button type="button" className="flex-1 flex items-center gap-2 text-left" onClick={() => setOpen(!open)}>
          <span className="font-semibold text-gray-800 truncate">{summary}</span>
          {open ? <ChevronUp size={16} className="text-gray-400 shrink-0 ml-auto" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 ml-auto" />}
        </button>
        <button onClick={() => removeItem("skillGroups", group.id)}
          style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#ef4444" }}>
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4">
          <input className={inputBase} placeholder="Nome gruppo" value={group.name || group.title || ""}
            onChange={(e) => updateItem("skillGroups", group.id, "name", e.target.value)} />
          <textarea className={textareaBase} rows={4} placeholder="Competenze separate da virgola"
            value={group._skillsText || ""}
            onChange={(e) => updateItem("skillGroups", group.id, "_skillsText", e.target.value)} />
        </div>
      )}
    </div>
  );
}

export default function SkillsSection({ formData, addItem, updateItem, removeItem, reorder }) {
  const skillGroups = formData.skillGroups;

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Competenze" count={skillGroups.length}>
        <div className="flex justify-end">
          <button className={btnAddBase} onClick={() => addItem("skillGroups", { name: "", _skillsText: "" })}>
            <Plus size={20} /> Aggiungi gruppo
          </button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={(e) => reorder(e, "skillGroups")}>
          <SortableContext items={skillGroups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
            {skillGroups.map((group) => (
              <SortableItem key={group.id} id={group.id}>
                <SkillCard group={group} updateItem={updateItem} removeItem={removeItem} />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </CollapsibleSection>
    </div>
  );
}
