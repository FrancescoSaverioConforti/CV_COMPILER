import { inputBase, inputStyle, cardBase, sectionTitle } from "../styles/formStyles";

export default function OtherInfoSection({ formData, setFormData }) {
  return (
    <div className="space-y-6">
      <h2 className={sectionTitle}>Altre Informazioni</h2>

      <div className={cardBase}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patente di guida
        </label>

        <input
          type="text"
          className={inputBase}
          style={inputStyle}
          placeholder="es. B"
          value={formData.drivingLicense}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              drivingLicense: e.target.value,
            }))
          }
        />
      </div>
    </div>
  );
}