// src/components/Products/BaseSelectField.jsx

export default function BaseSelectField({ label, path, value, options, hint, onChange }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">
        {label} <span className="ml-2 text-[11px] opacity-50 font-mono">{path}</span>
      </div>
      {hint ? <div className="mt-0.5 text-xs opacity-70">{hint}</div> : null}

      <div className="mt-3">
        <select
          className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
