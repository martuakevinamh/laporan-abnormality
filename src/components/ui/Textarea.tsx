import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

/**
 * Textarea — multi-line text input with label and error support.
 *
 * Usage:
 * ```tsx
 * <Textarea label="Deskripsi Temuan" rows={4} placeholder="Jelaskan temuan..." />
 * ```
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = "", id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={props.rows ?? 4}
          className={[
            "w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-text placeholder:text-[#94A3B8] transition-colors duration-150 resize-y",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-border hover:border-[#94A3B8] focus:border-accent",
            props.disabled ? "bg-surface-muted cursor-not-allowed" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export default Textarea;
