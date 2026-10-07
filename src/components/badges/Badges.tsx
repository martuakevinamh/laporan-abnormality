// ─── Status Badge ────────────────────────────────────────────────────────────

export type Status = "Reported" | "Investigating" | "Resolved" | "Rejected";

const STATUS_CLASSES: Record<Status, string> = {
  Reported: "bg-blue-100 text-blue-700",
  Investigating: "bg-yellow-100 text-yellow-800",
  Resolved: "bg-green-100 text-green-700",
  Rejected: "bg-slate-100 text-slate-600",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[status]} ${className}`}>
      {status}
    </span>
  );
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

export type Severity = "Rendah" | "Sedang" | "Tinggi" | "Kritis";

const SEVERITY_CLASSES: Record<Severity, { dot: string; text: string }> = {
  Rendah: { dot: "bg-green-600", text: "text-green-700" },
  Sedang: { dot: "bg-amber-600", text: "text-amber-800" },
  Tinggi: { dot: "bg-red-600", text: "text-red-700" },
  Kritis: { dot: "bg-red-800", text: "text-red-900" },
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className = "" }: SeverityBadgeProps) {
  const { dot, text } = SEVERITY_CLASSES[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text} ${className}`}>
      <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      {severity}
    </span>
  );
}

// ─── Late Badge ───────────────────────────────────────────────────────────────

interface LateBadgeProps {
  className?: string;
}

export function LateBadge({ className = "" }: LateBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 ${className}`}>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      Terlambat
    </span>
  );
}
