# Catalog Layout Components Overview

This document provides guidance on the five implemented layout components used for catalog/product display, as well as key support components and layout strategies seen in modern UIs.

---

## ✅ Implemented Layouts

### 1. `LayoutSidebarWithGrid.jsx`

**Intended Use:**  
Classic sidebar + main panel layout. Ideal for desktop-focused workflows and structured navigation.

**Functionality:**
- Sidebar uses `CatalogList` for hierarchical navigation
- Main content displays products via `ProductList`
- Breadcrumbs allow drill-down and upward navigation
- Fully integrated with `CatalogsPageBase`

---

### 2. `LayoutAccordionNavigation.jsx`

**Intended Use:**  
Mobile-first or compact layout where vertical accordion-style catalog interaction is preferred.

**Functionality:**
- Uses `AccordionCatalogs` (see below) for collapsible catalogs
- Breadcrumbs maintain hierarchy context
- Single-pane design simplifies small-screen usability

---

### 3. `LayoutResponsiveGrid.jsx`

**Intended Use:**  
Multi-device support. Ideal when you want the UI to adapt from mobile to large screens.

**Functionality:**
- Responsive grid layout (e.g., 1 to 4 columns)
- Sidebar (`CatalogList`) collapses on smaller screens
- `ProductList` in the main pane
- Breadcrumbs and scroll-aware lazy loading supported

---

### 4. `LayoutResizableSidebar.jsx`

**Intended Use:**  
Power users needing customization. Good for catalog managers or internal tools.

**Functionality:**
- Sidebar is resizable using `re-resizable`
- Main area shows `ProductList`
- Navigation via breadcrumbs and click-to-drill
- Great for dynamic UIs or admin views

---

### 5. `LayoutTabbedNavigation.jsx`

**Intended Use:**  
When top-level catalogs are mutually exclusive or few in number.

**Functionality:**
- Tabs represent major catalog groups
- Each tab loads a specific catalog
- Breadcrumb trail shows deeper levels
- Products loaded per tab via `ProductList`

---

## 🧩 Support Components

### `AccordionCatalogs.jsx`

**Purpose:**  
Used in accordion-style layouts to display product groups and subcatalogs in collapsible panels.

**Behavior:**
- Accepts `products` prop
- Maps over them using `<li>` tags or expandable panels
- Used in `LayoutAccordionNavigation`

---

### `TabbedCatalogs.jsx`

**Purpose:**  
Provides a horizontal tab bar for switching between catalog groups.

**Behavior:**
- Stateless UI — add logic to load different catalog sets per tab
- Used in `LayoutTabbedNavigation`

---

## 📌 Additional Layout Patterns (Suggested)

### 🔶 Masonry Grid / Pinterest-Style  
For irregular product sizes or image-dominant catalogs (e.g., apparel, print samples).  
*React tool: `react-masonry-css`*

---

### 🔷 Tree-Based Sidebar  
Expandable folders in the sidebar. Great for deep hierarchies like CMS or DAM systems.  
*React tool: `react-treebeard`, `rc-tree`*

---

### 🔶 Split View with Preview  
Left list, right live preview. Used in email clients and content managers.  
Ideal for quick inspection/editing UIs.

---

### 🔷 Carousel/Slider-Based Navigation  
Visual-first, swipe-friendly layouts. Good for kiosks, TV apps, or marketing catalogs.  
*React tool: `swiper.js`, `keen-slider`*

---

### 🔶 Mega Menu Layout  
Best for complex storefronts like Amazon. Large hoverable or clickable menu with many sections.

---

### 🔷 Faceted/Tag Filtering Layout  
Used by Amazon, Etsy, etc. Filters drive the catalog content instead of hierarchy.  
Typically built with checkboxes or multi-selects.

---

## 🔧 Integration

Each layout is designed for use with `CatalogsPageBase`, receiving:

- `catalogs`, `products`
- `onNavigate`, `onNavigateUp`
- `setLastItem`, `breadcrumbs`, `loading` states

---

