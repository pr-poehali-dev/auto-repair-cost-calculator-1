import Icon from "@/components/ui/icon";

export type EditorTab = "cars" | "works" | "norms";

// ─── tiny helpers ────────────────────────────────────────────────────────────

export const slug = (s: string) => s.toLowerCase().replace(/[\s()]/g, "-");

export function makeId(...parts: string[]) {
  return parts.map(slug).join("__");
}

// ─── modal ───────────────────────────────────────────────────────────────────

export const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-montserrat font-bold text-base">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="X" size={18} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  </div>
);

export const Field = ({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <div>
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">{label}</label>
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]"
    />
  </div>
);
