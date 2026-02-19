// src/components/Products/SelectOverrideField.jsx
import InheritedField from "./InheritedField";

export default function SelectOverrideField({
  label,
  path,
  options,
  baseDefaults,
  overrides,
  resolved,
  hint,
  onOverride,
  onRevert,
  onChange,
}) {
  return (
    <InheritedField
      label={label}
      path={path}
      baseDefaults={baseDefaults}
      overrides={overrides}
      resolved={resolved}
      hint={hint}
      onOverride={onOverride}
      onRevert={onRevert}
      onChange={(v) => onChange?.(v)}
      renderInput={({ value, disabled, onChange: _onChange }) => (
        <select
          className="w-full rounded-xl border px-3 py-2 text-sm bg-white disabled:bg-slate-50"
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => _onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    />
  );
}
