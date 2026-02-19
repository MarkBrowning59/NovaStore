// src/components/Products/ToggleOverrideField.jsx
import InheritedField from "./InheritedField";

export default function ToggleOverrideField({
  label,
  path,
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
      onChange={(v) => onChange?.(!!v)}
      renderInput={({ value, disabled, onChange: _onChange }) => {
        const checked = !!value;
        return (
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={checked}
              disabled={disabled}
              onChange={(e) => _onChange(e.target.checked)}
            />
            <span className="text-sm">{checked ? "Enabled" : "Disabled"}</span>
          </label>
        );
      }}
    />
  );
}
