// src/components/Products/BaseToggleField.jsx

export default function BaseToggleField({ label, path, value, hint, onChange }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">
        {label} <span className="ml-2 text-[11px] opacity-50 font-mono">{path}</span>
      </div>
      {hint ? <div className="mt-0.5 text-xs opacity-70">{hint}</div> : null}

      <label className="mt-3 flex items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={!!value}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="text-sm">{value ? "Enabled" : "Disabled"}</span>
      </label>
    </div>
  );
}
