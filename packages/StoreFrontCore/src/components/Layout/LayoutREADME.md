# 🧱 Unified Layout Component (`Layout.jsx`)

This file contains a complete layout system for a React + Tailwind application. It combines the following components into a single module:

- `Header`
- `Sidebar`
- `NavBar`
- `Logo`
- `Footer`
- `Layout` (wrapper with routing support)

It provides a responsive interface with a mobile-friendly sidebar, a sticky header, and slot-based routing via `<Outlet />`.

---

## 📐 Component Roles

### `Layout`

Top-level wrapper component that organizes the UI layout:

- Renders `Header`, `Sidebar`, `Footer`, and `Outlet`.
- Manages `sidebarOpen` state for mobile toggle behavior.
- Closes the sidebar automatically when the main content is clicked (on mobile).

### `Header`

- Sticky at the top (`fixed`, `top-0`, `z-50`).
- Contains:
  - `Logo` component
  - `NavBar` for links on desktop (`md:flex`)
  - Hamburger menu toggle for mobile

**Props**:
- `sidebarOpen`: boolean flag indicating sidebar visibility
- `onToggleSidebar`: function to open/close the sidebar
- `headerLinks`: navigation links for `NavBar`

### `NavBar`

- Flex container that maps a list of `{ href, label }` links.
- Only shown on medium and larger screens (`md:flex`).

### `Logo`

- Displays a brand logo with an optional text label.
- Wrapped in a React Router `<Link to="/">`.

### `Sidebar`

- Renders a slide-in panel with navigation links.
- Only visible on mobile (`md:hidden`) using Tailwind transitions.
- Visibility toggled via `sidebarOpen` prop.

**Props**:
- `isVisible`: controls visibility (slide in/out)
- `links`: list of navigation items

### `Footer`

- Sticky footer for support links or messages.
- Takes in an array of links for dynamic rendering.

---

## 💡 Responsive Behavior

- **Mobile (< md)**:
  - Hamburger button toggles the sidebar.
  - Sidebar slides in from the left.
  - Clicking anywhere in `<main>` closes the sidebar.

- **Desktop (≥ md)**:
  - `NavBar` is always visible in the header.
  - Sidebar is **never shown** (`md:hidden`).

---

## 🧪 Example Usage

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import CatalogsPage from './pages/CatalogsPage';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="catalogs/:id" element={<CatalogsPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

---

## ⚙️ Configuration

You can customize the following in `Layout.jsx`:

- **Brand image**: Update the path in `logoImage`
- **Navigation links**:
  - `headerLinks` → for top nav bar and sidebar
  - `footerLinks` → for contact/support links

Example:

```js
const headerLinks = [{ href: '/catalogs', label: 'Catalogs' }];
const footerLinks = [
  { href: 'mailto:customersupport@example.com', label: 'Support' },
  { href: 'mailto:returns@example.com', label: 'Returns' }
];
```

---

## 🎨 Styling

Tailwind CSS is used for all layout and transition styling:

- `md:hidden`, `md:flex` for responsive logic
- `transition-transform`, `translate-x-0`, `-translate-x-full` for sidebar animation
- `fixed`, `z-40`, `z-50` for layering

---

## 📁 File Structure (if split)

For clarity, here’s how the components would map if you were to modularize them:

```
components/
│
├── Layout.jsx         # Combines all below or just wrapper
├── Header.jsx
├── Sidebar.jsx
├── Footer.jsx
├── NavBar.jsx
└── Logo.jsx
```

---

## ✅ Summary

This unified `Layout.jsx` file gives you:

- A fully responsive layout
- Mobile-friendly sidebar toggle
- Centralized header/footer controls
- Clean React Router integration

Use this for prototyping or build out into separate files for scale and maintenance.
