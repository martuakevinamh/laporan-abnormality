import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

/**
 * Input — labelled text input with optional helper/error text.
 *
 * Usage:
 * ```tsx
 * <Input label="Nama Pelapor" placeholder="Masukkan nama..." />
 * <Input label="Email" type="email" error="Format email tidak valid" />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`peer w-full h-10 px-3 rounded-lg border bg-white/50 shadow-sm text-sm text-text placeholder:text-gray-400 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? "border-red-400 focus:ring-red-400/20 focus:border-red-500" : "border-border hover:border-gray-300"
          } ${className}`}
          placeholder={props.placeholder || label || " "}
          {...props}
        />
        {/* Antislop floating label technique (if placeholder is not transparent, we can just use simple label above) 
            Since it already has a top label, I will keep the label on top but style the input very premium. */}
        {error && <p className="text-xs font-medium text-red-500 mt-1">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
