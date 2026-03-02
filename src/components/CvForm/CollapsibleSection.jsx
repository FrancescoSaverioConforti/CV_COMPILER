import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CollapsibleSection({ title, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-4">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-800">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <div
          className={`p-1.5 rounded-lg transition-colors ${
            open ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
          }`}
        >
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Animated content */}
      {open && <div className="space-y-4">{children}</div>}
    </div>
  );
}
