// hooks/useCatalog.js
import { useContext } from 'react';
import CatalogContext from '../context/CatalogContext';
import { fetchProductsByIds } from '../services/productApi';
import { debounce } from 'lodash';

export function useCatalog() {
  const { state, dispatch } = useContext(CatalogContext);

  if (!state || !dispatch) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }

  const rawPrefetch = async (catalogId, productList) => {
    if (state.catalogProducts[catalogId]) return;

    try {
      const productIDs = productList.map(p => p.ProductID);
      const res = await fetchProductsByIds(productIDs);

      dispatch({
        type: 'FETCH_PRODUCTS_SUCCESS',
        catalogId,
        payload: res,
      });
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message });
    }
  };

  const prefetchCatalogProducts = debounce(rawPrefetch, 600);

  return { state, dispatch, prefetchCatalogProducts };
}