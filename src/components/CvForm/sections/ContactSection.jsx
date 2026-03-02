import { inputBase, sectionTitle } from "../styles/formStyles";

export default function ContactSection({ formData, updateContact }) {
  const c = formData.contact;

  return (
    <div className="space-y-6">
      <h2 className={sectionTitle}>Informazioni Personali</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <input className={inputBase} placeholder="Nome"
          value={c.firstName} onChange={(e) => updateContact("firstName", e.target.value)} />

        <input className={inputBase} placeholder="Cognome"
          value={c.lastName} onChange={(e) => updateContact("lastName", e.target.value)} />

        <input className={inputBase} placeholder="Email"
          value={c.email} onChange={(e) => updateContact("email", e.target.value)} />

        <input className={inputBase} placeholder="PEC"
          value={c.pec || ""} onChange={(e) => updateContact("pec", e.target.value)} />

        <input className={inputBase} placeholder="Telefono"
          value={c.phone} onChange={(e) => updateContact("phone", e.target.value)} />

        <input className={inputBase} placeholder="Indirizzo"
          value={c.location} onChange={(e) => updateContact("location", e.target.value)} />

        <input className={inputBase} placeholder="Data di nascita"
          value={c.dateOfBirth} onChange={(e) => updateContact("dateOfBirth", e.target.value)} />

        <input className={inputBase} placeholder="Nazionalità"
          value={c.nationality} onChange={(e) => updateContact("nationality", e.target.value)} />

        <input className={inputBase} placeholder="Sesso (es. Maschile / Femminile)"
          value={c.gender} onChange={(e) => updateContact("gender", e.target.value)} />

      </div>
    </div>
  );
}
