import { arrayMove } from "@dnd-kit/sortable";

export default function useReorder(formData, setFormData) {
  const reorder = (event, fieldName) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (fieldName === "languages") {
      setFormData((prev) => {
        const items = prev.languages.other;
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return {
          ...prev,
          languages: {
            ...prev.languages,
            other: arrayMove(items, oldIndex, newIndex),
          },
        };
      });
    } else {
      setFormData((prev) => {
        const items = prev[fieldName];
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return {
          ...prev,
          [fieldName]: arrayMove(items, oldIndex, newIndex),
        };
      });
    }
  };

  return reorder;
}
