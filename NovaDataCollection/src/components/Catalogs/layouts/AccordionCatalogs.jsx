export default function AccordionCatalogs({ products }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Accordion Content</h2>
      <ul>
        {products.map(p => (
          <li key={p._id}>{p.ProductDefinition?.Name || 'Unnamed Product'}</li>
        ))}
      </ul>
    </div>
  );
}
