import { useState } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CollapsibleSection from "../CollapsibleSection";

export default function ProjectsSection({ formData, addItem, updateItem, removeItem, reorder }) {
  const addProject = () => {
    addItem("projects", { title: "", description: "", tech: [] });
  };

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Progetti" count={formData.projects.length}>
        <div className="flex justify-end">
          <button onClick={addProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 shadow hover:bg-blue-700 text-sm font-medium">
            <Plus size={18} /> Aggiungi progetto
          </button>
        </div>

        <SortableContext items={formData.projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {formData.projects.map((project) => (
            <ProjectCard key={project.id} project={project} updateItem={updateItem} removeItem={removeItem} />
          ))}
        </SortableContext>
      </CollapsibleSection>
    </div>
  );
}

function ProjectCard({ project, updateItem, removeItem }) {
  const [open, setOpen] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: project.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const techString = Array.isArray(project.tech) ? project.tech.join(", ") : "";
  const summary = project.title || "Nuovo progetto";

  return (
    <div ref={setNodeRef} style={style} className="p-4 mb-4 bg-white rounded-xl shadow border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="cursor-grab text-gray-400" {...attributes} {...listeners}>
          <GripVertical size={18} />
        </div>
        <button type="button" className="flex-1 flex items-center gap-2 text-left" onClick={() => setOpen(!open)}>
          <span className="font-semibold text-gray-800 truncate">{summary}</span>
          {open ? <ChevronUp size={16} className="text-gray-400 ml-auto shrink-0" /> : <ChevronDown size={16} className="text-gray-400 ml-auto shrink-0" />}
        </button>
        <button onClick={() => removeItem("projects", project.id)}
          style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#ef4444" }}>
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-gray-600 text-sm">Titolo</span>
            <input type="text" className="w-full px-3 py-2 border rounded-lg mt-1" value={project.title}
              onChange={(e) => updateItem("projects", project.id, "title", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-gray-600 text-sm">Descrizione</span>
            <textarea className="w-full px-3 py-2 border rounded-lg mt-1" rows={3} value={project.description}
              onChange={(e) => updateItem("projects", project.id, "description", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-gray-600 text-sm">Tecnologie (separate da virgola)</span>
            <input type="text" className="w-full px-3 py-2 border rounded-lg mt-1" value={techString}
              onChange={(e) => updateItem("projects", project.id, "tech",
                e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
          </label>
        </div>
      )}
    </div>
  );
}
