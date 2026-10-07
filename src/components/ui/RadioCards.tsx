"use client";


interface RadioOption {
  value: string;
  label: string;
  description?: string;
  colorTone?: "green" | "yellow" | "red" | "dark-red" | "default";
}

const toneMap: Record<NonNullable<RadioOption["colorTone"]>, { container: string, circle: string, text: string }> = {
  default: {
    container: "has-checked:border-accent has-checked:bg-blue-50/50 has-checked:ring-accent",
    circle: "group-has-checked:border-accent",
    text: "group-has-checked:text-accent",
  },
  green: {
    container: "has-checked:border-green-500 has-checked:bg-green-50/50 has-checked:ring-green-500",
    circle: "group-has-checked:border-green-500",
    text: "group-has-checked:text-green-700",
  },
  yellow: {
    container: "has-checked:border-amber-500 has-checked:bg-amber-50/50 has-checked:ring-amber-500",
    circle: "group-has-checked:border-amber-500",
    text: "group-has-checked:text-amber-700",
  },
  red: {
    container: "has-checked:border-red-500 has-checked:bg-red-50/50 has-checked:ring-red-500",
    circle: "group-has-checked:border-red-500",
    text: "group-has-checked:text-red-700",
  },
  "dark-red": {
    container: "has-checked:border-rose-700 has-checked:bg-rose-50/50 has-checked:ring-rose-700",
    circle: "group-has-checked:border-rose-700",
    text: "group-has-checked:text-rose-800",
  },
};

interface RadioCardsProps {
  label?: string;
  options: RadioOption[];
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

/**
 * RadioCards — card-style radio buttons for prominent choices.
 *
 * Usage:
 * ```tsx
 * <RadioCards
 *   label="Tingkat Bahaya"
 *   name="severity"
 *   options={[
 *     { value: "rendah", label: "Rendah", description: "Tidak mengganggu operasional" },
 *     { value: "tinggi", label: "Tinggi", description: "Butuh penanganan segera" },
 *   ]}
 *   value={severity}
 *   onChange={setSeverity}
 * />
 * ```
 */
export default function RadioCards({
  label,
  options,
  name,
  value: controlledValue,
  onChange,
  error,
}: RadioCardsProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <span className="text-sm font-medium text-text">{label}</span>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const tone = toneMap[opt.colorTone || "default"];
          return (
            <label key={opt.value} className={`group relative flex cursor-pointer rounded-xl border border-border bg-white p-4 shadow-sm transition-all has-checked:shadow-md has-checked:ring-1 hover:border-gray-300 ${tone.container}`}>
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={controlledValue === opt.value}
                onChange={(e) => onChange?.(e.target.value)}
                className="sr-only"
              />
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <span className={`text-sm font-medium text-text ${tone.text}`}>
                    {opt.label}
                  </span>
                  {/* Custom radio indicator */}
                  <div className={`h-4 w-4 rounded-full border border-gray-300 bg-white group-has-checked:border-[5px] transition-all duration-200 ${tone.circle}`} />
                </div>
                {opt.description && (
                  <span className="text-xs text-text-muted mt-0.5">{opt.description}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs font-medium text-red-500 mt-1">{error}</p>}
    </div>
  );
}
