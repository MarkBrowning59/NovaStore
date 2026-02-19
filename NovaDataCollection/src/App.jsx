import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Layout from './components/Layout/Layout.jsx';






export default function App() {

  return (

    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />                 
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>

  );
}
