// The ProductList component is a simple, functional React component that displays a list of product names.


// products: an array of product objects, each expected to have a ProductID and a nested ProductDefinition field.
export default function ProductList({ products }) {

  return (
    <div>
      {/* Iterates over the products array. */}
      {products.map(product => (
        // Each product is rendered inside a <div> using ProductID as a unique key.
        <div key={product.ProductID}>
          {product.ProductDefinition?.Name || 'Unnamed Product'}
        </div>
      ))}
    </div>
  );
}
