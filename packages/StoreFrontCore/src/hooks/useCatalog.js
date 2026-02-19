// src/hooks/useCatalog.js
import { useContext } from 'react';
import CatalogContext from '../context/CatalogContext';
import { fetchProductsByIds } from '../services/productApi';
import { debounce } from 'lodash';

export function useCatalog() {
  const { state, dispatch } = useContext(CatalogContext);

  if (!state || !dispatch) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }

  const rawPrefetch = async (catalogId, productList = []) => {
    // Already have products for this catalog? Skip.
    if (state.catalogProducts && state.catalogProducts[catalogId]) return;

    try {
      const productIDs = (productList || [])
        .map((p) => p.ProductID)
        .filter(Boolean);

      if (!productIDs.length) return;

      const res = await fetchProductsByIds(productIDs);

      dispatch({
        type: 'FETCH_PRODUCTS_SUCCESS',
        catalogId,
        payload: res.data, // IMPORTANT: the data array, not the whole response
      });
    } catch (error) {
      console.error('Error prefetching catalog products', error);
      dispatch({ type: 'ERROR', payload: error.message });
    }
  };

  // Debounced version used by CatalogList hover
  const prefetchCatalogProducts = debounce(rawPrefetch, 600);

  return { state, dispatch, prefetchCatalogProducts };
}
