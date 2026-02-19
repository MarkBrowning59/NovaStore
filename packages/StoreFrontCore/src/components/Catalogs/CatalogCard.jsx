export default function CatalogCard({ catalog, onNavigate, onPrefetch, isLast, setLastItem }) {
  return (
    <div
      key={catalog._id}
      ref={isLast ? setLastItem : null}
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <span
        className="text-blue-700 underline hover:text-blue-900 cursor-pointer"
        onClick={() => onNavigate(catalog._id, catalog.name)}
        onMouseEnter={() => {
          if (!catalog.products || catalog.products.length === 0) return;
          onPrefetch(catalog._id, catalog.products);
        }}
      >
        {catalog.name}
      </span>
    </div>
  );
}
