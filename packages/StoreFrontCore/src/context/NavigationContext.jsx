import { createContext, useContext, useReducer } from 'react';

const NavigationContext = createContext();

const initialState = {
  currentCatalogId: null,
  currentProductId: null,
};

function navigationReducer(state, action) {
  switch (action.type) {
    case 'SET_CATALOG':
      return {
        ...state,
        currentCatalogId: action.payload,
        currentProductId: null, // reset product when catalog changes
      };

    case 'SET_PRODUCT':
      return {
        ...state,
        currentProductId: action.payload,
      };

    case 'RESET_NAV':
      return initialState;

    default:
      return state;
  }
}

export function NavigationProvider({ children }) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);

  return (
    <NavigationContext.Provider value={{ state, dispatch }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
