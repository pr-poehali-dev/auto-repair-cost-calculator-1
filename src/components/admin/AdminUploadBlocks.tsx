import { useRef } from "react";
import Icon from "@/components/ui/icon";

export const UploadBlock = ({ title, description, buttonLabel, accept, onFile, onUpdate, onDownloadTemplate, status, disabled, hasData, uploading, children, onButtonClick }: {
  title: string; description: string; buttonLabel: string; accept: string;
  onFile: (file: File) => void; onUpdate?: (file: File) => void;
  onDownloadTemplate: () => void;
  status: { type: "success" | "error"; msg: string } | null;
  disabled?: boolean; hasData?: boolean; uploading?: boolean; children?: React.ReactNode;
  onButtonClick?: () => void;
}) => {
  const refLoad = useRef<HTMLInputElement>(null);
  const refUpdate = useRef<HTMLInputElement>(null);
  return (
    <div className={`border rounded-lg p-5 transition-colors ${disabled ? "opacity-50 pointer-events-none bg-gray-50" : "bg-white border-border"}`}>
      <div className="flex items-start justify-between mb-1 gap-3">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <button type="button" onClick={onDownloadTemplate} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[hsl(215,70%,22%)] text-[hsl(215,70%,22%)] rounded text-xs font-semibold hover:bg-blue-50 transition-all shrink-0 disabled:opacity-40 disabled:pointer-events-none">
          <Icon name="Download" size={13} />Скачать шаблон
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {children}
      {status && !uploading && (
        <div className={`flex items-start gap-2 p-3 rounded-lg border mb-3 text-xs animate-fade-in ${status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          <Icon name={status.type === "success" ? "CheckCircle" : "XCircle"} size={14} className="shrink-0 mt-0.5" />
          {status.msg}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <input ref={refLoad} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        <button type="button" onClick={onButtonClick ?? (() => refLoad.current?.click())} disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm disabled:opacity-60 disabled:pointer-events-none">
          {uploading ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name={onButtonClick ? "RefreshCw" : "Upload"} size={14} />}
          {uploading ? "Загрузка…" : buttonLabel}
        </button>
        {!onButtonClick && onUpdate && hasData && !uploading && (
          <>
            <input ref={refUpdate} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpdate(f); e.target.value = ""; }} />
            <button type="button" onClick={() => refUpdate.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-[hsl(215,70%,22%)] text-[hsl(215,70%,22%)] rounded text-sm font-semibold hover:bg-blue-50 transition-all">
              <Icon name="RefreshCw" size={14} />Добавить / обновить
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const StepBadge = ({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${done ? "bg-green-500 text-white" : active ? "bg-[hsl(215,70%,22%)] text-white" : "bg-gray-200 text-gray-500"}`}>
      {done ? <Icon name="Check" size={14} /> : n}
    </div>
    <span className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-green-700" : "text-muted-foreground"}`}>{label}</span>
  </div>
);