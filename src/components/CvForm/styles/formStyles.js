// ------------------------------
// INPUT
// ------------------------------
export const inputBase =
  "w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white " +
  "font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
  "transition-all hover:border-gray-400";

// Stile per input con testo visibile forzato
export const inputStyle = {
  color: '#1f2937',
  caretColor: '#1f2937'
};

// ------------------------------
// TEXTAREA
// ------------------------------
export const textareaBase =
  "w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white " +
  "font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
  "transition-all hover:border-gray-400 resize-vertical min-h-[100px]";

// ------------------------------
// CARD CONTAINER
// ------------------------------
export const cardBase =
  "relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow";

// ------------------------------
// BUTTON Aggiungi
// ------------------------------
export const btnAddBase =
  "flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg " +
  "hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm";

// ------------------------------
// BUTTON Cancella
// ------------------------------
export const btnDeleteBase =
  "absolute top-3 right-3 p-2.5 bg-red-50 text-red-600 font-semibold rounded-lg " +
  "hover:bg-red-600 hover:text-white active:bg-red-700 transition-all cursor-pointer " +
  "shadow-md border-2 border-red-200 hover:border-red-600 touch-none";

export const btnDeleteStyle = {
  zIndex: 10000,
  pointerEvents: 'auto',
  touchAction: 'none'
};

// ------------------------------
// LABEL
// ------------------------------
export const labelBase = "block text-sm font-semibold text-gray-700 mb-2";

// ------------------------------
// SECTION TITLE
// ------------------------------
export const sectionTitle = "text-3xl font-bold text-gray-800 mb-6";