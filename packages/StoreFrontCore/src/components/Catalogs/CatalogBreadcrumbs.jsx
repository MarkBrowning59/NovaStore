export default function CatalogBreadcrumbs({ breadcrumbs, onBreadcrumbClick }) {
  if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) return null;

  return (
    <nav className="text-sm text-gray-700">
      <ol className="flex flex-wrap items-center gap-1">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const label = index === 0 ? 'Home' : (crumb.name || 'Untitled');

          if (isLast) {
            return (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && <span className="text-gray-400">/</span>}
                <span className="font-semibold text-gray-900">{label}</span>
              </li>
            );
          }

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                type="button"
                className="text-indigo-600 hover:underline"
                onClick={() => {
                  if (!onBreadcrumbClick) return;
                  onBreadcrumbClick(index);
                }}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
