import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import {
  CatalogProvider,
  NavigationProvider,
  setApiBaseUrl
} from '@storefront/storefront-core'

setApiBaseUrl(import.meta.env.VITE_NOVA_API_BASE_URL)

createRoot(document.getElementById('root')).render(
  <StrictMode>
        <NavigationProvider>
      <CatalogProvider>
        <App />
      </CatalogProvider>
    </NavigationProvider>
  </StrictMode>,
)
