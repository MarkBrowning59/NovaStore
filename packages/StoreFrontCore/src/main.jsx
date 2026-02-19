import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CatalogProvider } from './context/CatalogContext';
import './index.css';
import { NavigationProvider } from './context/NavigationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CatalogProvider>
      <BrowserRouter>
        <NavigationProvider>
              <App />    
        </NavigationProvider>
      </BrowserRouter>
    </CatalogProvider>
  </React.StrictMode>,
);
