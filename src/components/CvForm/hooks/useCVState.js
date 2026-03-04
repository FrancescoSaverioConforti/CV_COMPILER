import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export default function useCVState() {
  const [formData, setFormData] = useState({
    contact: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      pec: "",
      location: "",
      dateOfBirth: "",
      nationality: "",
      gender: "",
    },
    experience: [],
    education: [],
    languages: {
      motherTongue: "Italiano",
      other: []
    },
    skillGroups: [],
    certifications: [],
    projects: [],
    publications: [],
    drivingLicense: "",
    signatureLocation: "",
    customSections: [],
  });

  // -------------------------
  // CONTACT
  // -------------------------
  const updateContact = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  // -------------------------
  // ADD ITEM
  // Languages is special: it's {motherTongue, other}
  // -------------------------
  const addItem = (field, template) => {
    if (field === "languages") {
      setFormData((prev) => ({
        ...prev,
        languages: {
          ...prev.languages,
          other: [
            { id: crypto.randomUUID(), ...template },
            ...prev.languages.other,
          ],
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: [
          { id: crypto.randomUUID(), ...template },
          ...prev[field],
        ],
      }));
    }
  };

  // -------------------------
  // UPDATE BY ID
  // -------------------------
  const updateItem = (field, id, prop, value) => {
    if (field === "languages") {
      setFormData((prev) => ({
        ...prev,
        languages: {
          ...prev.languages,
          other: prev.languages.other.map((item) =>
            item.id === id ? { ...item, [prop]: value } : item
          ),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].map((item) =>
          item.id === id ? { ...item, [prop]: value } : item
        ),
      }));
    }
  };

  // -------------------------
  // REMOVE BY ID
  // -------------------------
  const removeItem = (field, id) => {
    if (field === "languages") {
      setFormData((prev) => ({
        ...prev,
        languages: {
          ...prev.languages,
          other: prev.languages.other.filter((item) => item.id !== id),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((item) => item.id !== id),
      }));
    }
  };

  // -------------------------
  // REORDER
  // -------------------------
  const reorder = (event, field) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    if (field === "languages") {
      setFormData((prev) => {
        const list = prev.languages.other;
        const oldIndex = list.findIndex((i) => i.id === active.id);
        const newIndex = list.findIndex((i) => i.id === over.id);
        return {
          ...prev,
          languages: {
            ...prev.languages,
            other: arrayMove(list, oldIndex, newIndex),
          },
        };
      });
    } else {
      setFormData((prev) => {
        const list = prev[field];
        const oldIndex = list.findIndex((i) => i.id === active.id);
        const newIndex = list.findIndex((i) => i.id === over.id);
        return {
          ...prev,
          [field]: arrayMove(list, oldIndex, newIndex),
        };
      });
    }
  };

  return {
    formData,
    setFormData,
    updateContact,
    addItem,
    updateItem,
    removeItem,
    reorder,
  };
}
