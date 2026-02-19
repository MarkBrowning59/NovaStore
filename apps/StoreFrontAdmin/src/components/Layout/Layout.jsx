import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

export default function Layout() {
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const headerLinks = [
    // { href: '/', label: 'Home' },
    { href: '/catalogs/', label: 'Catalogs' },
     { href: '/product-profiles', label: 'Product Profiles' }
  ];

  const sidebarLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/orders', label: 'Orders' },
    { href: '/settings', label: 'Settings' }
  ];

  const footerLinks = [
    {
      href: 'mailto:customersupport@novabrandprojection.com?subject=Return%2FExchange%20Authorization&body=Return%20or%20Exchange%3A%20%0AOrder%20Number%3A%20%0AItem%20SKU%3A%20%0AReason%20for%20Return%3A%20',
      label: 'Exchanges',
    },
    {
      href: 'mailto:customer.service@novabrandprojection.com',
      label: 'Customer',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        headerLinks={headerLinks}
      />

      <div className="flex flex-1 relative">
        <Sidebar
          links={headerLinks}
          isVisible={sidebarOpen}
          className="md:static"
        />

        <main
          className="flex-1 px-4 py-6 overflow-y-auto"
          onClick={() => sidebarOpen && setSidebarOpen(false)}
        >
          <Outlet />
        </main>
      </div>

      <Footer
        className="text-white bg-teal-800 px-4 pt-2 pb-4 space-y-2"
        links={footerLinks}
      />
    </div>
  );
}
