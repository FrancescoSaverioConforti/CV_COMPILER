import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export default function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative mb-4">
      {/* DRAG HANDLE - Solo questo è draggable */}
      <button
        type="button"
        className="absolute -left-8 top-6 p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors z-10"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      
      {/* Contenuto - NON draggable, tutto funziona normalmente */}
      {children}
    </div>
  );
}