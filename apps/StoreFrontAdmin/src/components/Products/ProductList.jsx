// src/components/Products/ProductList.jsx

export default function ProductList({ products, catalogId }) {
  
  console.log(catalogId)
  
  const navigate = useNavigate();

  const handleClick = (product) => {
    const id = product._id || product.ProductID;

    if (!id) {
      console.warn("Product missing ID:", product);
      return;
    }

    const search = catalogId
      ? `?catalogId=${encodeURIComponent(catalogId)}`
      : '';

    navigate(`/products/${id}${search}`);
  };

  return (
    <div className="space-y-1">
      {products.map(product => (
        <div
          key={product._id || product.ProductID}
          onClick={() => handleClick(product)}
          className="cursor-pointer px-3 py-2 border rounded hover:bg-gray-100"
        >
          {product.ProductDefinition?.Name || 'Unnamed Product'}
        </div>
      ))}
    </div>
  );
}
