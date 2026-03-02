import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import SortableItem from "../../SortableItem";
import CollapsibleSection from "../CollapsibleSection";

import { inputBase, cardBase, btnAddBase, btnDeleteBase, sectionTitle } from "../styles/formStyles";

function PublicationCard({ pub, updateItem, removeItem }) {
  const [open, setOpen] = useState(true);
  const summary = pub.title || "Nuova pubblicazione";

  return (
    <div className={cardBase}>
      <div className="flex items-center gap-2 mb-2">
        <button type="button" className="flex-1 flex items-center gap-2 text-left" onClick={() => setOpen(!open)}>
          <span className="font-semibold text-gray-800 truncate">{summary}</span>
          {pub.year && <span className="text-xs text-gray-400 shrink-0">{pub.year}</span>}
          {open ? <ChevronUp size={16} className="text-gray-400 shrink-0 ml-auto" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 ml-auto" />}
        </button>
        <button onClick={() => removeItem("publications", pub.id)}
          style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#ef4444" }}>
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <input className={inputBase} placeholder="Autori" value={pub.authors}
            onChange={(e) => updateItem("publications", pub.id, "authors", e.target.value)} />
          <input className={inputBase} placeholder="Titolo" value={pub.title}
            onChange={(e) => updateItem("publications", pub.id, "title", e.target.value)} />
          <input className={inputBase} placeholder="Venue" value={pub.venue}
            onChange={(e) => updateItem("publications", pub.id, "venue", e.target.value)} />
          <input type="number" className={inputBase} placeholder="Anno" value={pub.year}
            onChange={(e) => updateItem("publications", pub.id, "year", e.target.value)} />
          <input className={inputBase} placeholder="DOI" value={pub.doi}
            onChange={(e) => updateItem("publications", pub.id, "doi", e.target.value)} />
        </div>
      )}
    </div>
  );
}

export default function PublicationsSection({ formData, addItem, updateItem, removeItem, reorder }) {
  const publications = formData.publications;

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Pubblicazioni" count={publications.length}>
        <div className="flex justify-end">
          <button className={btnAddBase}
            onClick={() => addItem("publications", { authors: "", title: "", venue: "", year: "", doi: "" })}>
            <Plus size={20} /> Aggiungi
          </button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={(e) => reorder(e, "publications")}>
          <SortableContext items={publications.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {publications.map((pub) => (
              <SortableItem key={pub.id} id={pub.id}>
                <PublicationCard pub={pub} updateItem={updateItem} removeItem={removeItem} />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </CollapsibleSection>
    </div>
  );
}
