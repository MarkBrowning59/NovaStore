import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { lazyWithPreload } from './utils/lazyWithPreload';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Layout from './components/Layout/Layout.jsx';
// import ProductProfilesPage from './pages/ProductProfilesPage';
import ProductPage from './pages/ProductPage';
// import ProductBaseEditPage from "./pages/ProductBaseEditPage";
// import ProductBaseCreatePage from "./pages/ProductBaseCreatePage";
// import ProductCreatePage from "./pages/ProductCreatePage";

const CatalogsPage = lazyWithPreload(() => import('./pages/CatalogsPage.jsx'));
const CatalogProductsPage = lazyWithPreload(() => import('./pages/ProductsPage.jsx'));



export default function App() {


  useEffect(() => {
    CatalogsPage.preload();
    CatalogProductsPage.preload(); 
  }, []);

  return (

    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />   
        <Route path="catalogs" element={<CatalogsPage />} />    
        <Route path="catalogs/:id" element={<CatalogsPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>

  );
}
