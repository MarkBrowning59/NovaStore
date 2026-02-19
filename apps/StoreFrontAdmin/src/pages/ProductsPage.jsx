import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';

import { fetchProductsByIds } from '../services/productApi';

import ProductList from '../components/Products/ProductList';

export default function ProductsPage() {
  const { catalogId } = useParams();
  const { state, dispatch } = useCatalog();

  useEffect(() => {
    if (!state.catalogProducts[catalogId]) {
      dispatch({ type: 'LOADING' });
      fetchProductsByIds([catalogId])
        .then(res => {
          dispatch({ type: 'FETCH_PRODUCTS_SUCCESS', catalogId, payload: res });
        })
        .catch(err => dispatch({ type: 'ERROR', payload: err.message }));
    }
  }, [catalogId, dispatch, state.catalogProducts]);

  if (state.loading) return <div>Loading products...</div>;
  if (state.error) return <div>Error: {state.error}</div>;

  return (
  <ProductList
    products={state.catalogProducts[catalogId] || []}
    catalogId={catalogId}
  />
);

}
