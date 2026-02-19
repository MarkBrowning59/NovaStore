
// Breadcrumbs.jsx
export default function Breadcrumbs({ stack, onNavigateUp }) {
  return (
    <div className="text-sm text-gray-700">
      <span onClick={() => onNavigateUp?.(-1)} className="cursor-pointer underline font-semibold">Root</span>
      {stack.map((item, i) => (
        <span key={`${item.id || 'root'}-${i}`}>
          {' / '}
          <span
            className="cursor-pointer underline"
            onClick={() => onNavigateUp?.(i)}
          >
            {item.name || 'Untitled'}
          </span>
        </span>
      ))}
    </div>
  );
}
