// src/components/Products/InheritedField.jsx
import { useMemo } from "react";
import { getByPath, hasByPath } from "../../utils/inheritance";

/**
 * Inheritance-aware field.
 *
 * Props:
 * - label
 * - path: dot path under the inheritance object (e.g. "ProductDefinition.Name")
 * - baseDefaults: object (Product.BaseProduct?.Defaults) OR null
 * - overrides: object (Product.Overrides) OR {}
 * - resolved: object (deepMerge(baseDefaults, overrides, extensions)) OR {}
 * - hint: optional
 * - renderInput: ({ value, disabled, onChange }) => JSX
 * - onOverride: () => void
 * - onRevert: () => void
 * - onChange: (newValue) => void  // called when user edits (only when overridden)
 */
export default function InheritedField({
  label,
  path,
  baseDefaults,
  overrides,
  resolved,
  hint,
  renderInput,
  onOverride,
  onRevert,
  onChange,
}) {
  const isOverridden = useMemo(() => hasByPath(overrides, path), [overrides, path]);

  const inheritedValue = useMemo(
    () => getByPath(baseDefaults, path, ""),
    [baseDefaults, path]
  );

  const resolvedValue = useMemo(
    () => getByPath(resolved, path, ""),
    [resolved, path]
  );

  const inputValue = useMemo(() => {
    if (isOverridden) return getByPath(overrides, path, "");
    return resolvedValue;
  }, [isOverridden, overrides, path, resolvedValue]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{label} <span className="ml-2 text-[11px] opacity-50 font-mono">{path}</span></div>
          {hint ? <div className="mt-0.5 text-xs opacity-70">{hint}</div> : null}

          <div className="mt-2 flex items-center gap-2">
            {isOverridden ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium">
                Overridden
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium">
                Inherited
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex gap-2">
          {!isOverridden ? (
            <button
              type="button"
              className="rounded-xl border px-3 py-1.5 text-xs shadow-sm hover:bg-slate-50"
              onClick={onOverride}
              title="Create an override for this field"
            >
              Override
            </button>
          ) : (
            <button
              type="button"
              className="rounded-xl border px-3 py-1.5 text-xs shadow-sm hover:bg-slate-50"
              onClick={onRevert}
              title="Remove override and fall back to base"
            >
              Revert
            </button>
          )}
        </div>
      </div>

      <div className="mt-3">
        {renderInput({
          value: inputValue ?? "",
          disabled: !isOverridden,
          onChange: (v) => {
            if (!isOverridden) return;
            onChange?.(v);
          },
        })}
      </div>

      {!isOverridden ? (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
          <div className="opacity-70">Resolved value:</div>
          <div className="mt-1 whitespace-pre-wrap break-words">
            {String(resolvedValue ?? "")}
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
          <div className="opacity-70">Inherited (base) value:</div>
          <div className="mt-1 whitespace-pre-wrap break-words">
            {String(inheritedValue ?? "")}
          </div>
        </div>
      )}
    </div>
  );
}
