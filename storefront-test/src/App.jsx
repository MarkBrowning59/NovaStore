import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { CatalogLayouts, CatalogList } from "@storefront/storefront-core";

const { LayoutSidebarWithGrid } = CatalogLayouts;

function App() {
  return (
    <LayoutSidebarWithGrid>
      <CatalogList />
    </LayoutSidebarWithGrid>
  )
}

export default App
