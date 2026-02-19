// src/components/Products/JsonOverrideEditor.jsx
import { useEffect, useMemo, useState } from "react";
import InheritedField from "./InheritedField";
import { getByPath } from "../../utils/inheritance";

/**
 * JSON editor that participates in inheritance (Override/Revert).
 * - Validates JSON and shows an inline error
 * - Only writes to overrides when JSON parses successfully
 */
export default function JsonOverrideEditor({
  label,
  path,
  baseDefaults,
  overrides,
  resolved,
  hint,
  onOverride,
  onRevert,
  onChangeObject,
}) {
  const currentObj = useMemo(() => getByPath(resolved, path, {}), [resolved, path]);

  const [text, setText] = useState(() => JSON.stringify(currentObj ?? {}, null, 2));
  const [err, setErr] = useState("");

  useEffect(() => {
    if (err) return;
    setText(JSON.stringify(currentObj ?? {}, null, 2));
  }, [currentObj, err]);

  function onTextChange(v) {
    setText(v);
    try {
      const parsed = JSON.parse(v || "{}");
      setErr("");
      onChangeObject?.(parsed);
    } catch {
      setErr("Invalid JSON (fix syntax to save changes).");
    }
  }

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
      onChange={() => {}}
      renderInput={({ disabled }) => (
        <div>
          <textarea
            className="w-full rounded-xl border px-3 py-2 text-sm font-mono disabled:bg-slate-50"
            rows={8}
            value={text}
            disabled={disabled}
            onChange={(e) => onTextChange(e.target.value)}
          />
          {err ? <div className="mt-2 text-xs text-red-600">{err}</div> : null}
        </div>
      )}
    />
  );
}
