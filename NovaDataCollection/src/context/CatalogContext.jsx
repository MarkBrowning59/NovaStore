
import React, { createContext, useReducer } from 'react';

const CatalogContext = createContext();

const initialState = {
  //List of catalog entries (can contain children and/or product IDs).
  catalogs: [],
  
  //Maps catalog IDs to their product list.
  catalogProducts: {},
  
  //Maps product IDs to product details.
  products: {},
  
  //Tracks loading state during async operations.
  loading: false,
   
  //Holds any error messages.
  error: null,
};

function catalogReducer(state, action) {
  switch (action.type) {
    case 'FETCH_CATALOGS_SUCCESS':
      return { ...state, catalogs: action.payload, loading: false };
    case 'FETCH_PRODUCTS_SUCCESS':
      return { 
        ...state, 
        catalogProducts: {
          ...state.catalogProducts,
          [action.catalogId]: action.payload,
        },
        loading: false
      };
    case 'FETCH_PRODUCT_SUCCESS':
      return { 
        ...state, 
        products: {
          ...state.products,
          [action.payload._id]: action.payload,
        },
        loading: false,
      };
    case 'LOADING':
      return { ...state, loading: true };
    case 'ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function CatalogProvider({ children }) {
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  return (
    <CatalogContext.Provider value={{ state, dispatch }}>
      {children}
    </CatalogContext.Provider>
  );
}

export default CatalogContext;
