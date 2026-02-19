# 📘 Developer README: Catalog + Product Browser

## 🧩 Overview

This React-based UI presents a navigable tree of product catalogs, where users can drill into nested subcatalogs and view associated products. The system supports infinite scroll, breadcrumb navigation, and product prefetching on hover for performance.

---

## 🗂️ Components & Responsibilities

### 1. **`CatalogsPage.jsx`**
**Role:** Main container for browsing catalogs  
**Features:**
- Manages state for:
  - `page` (for pagination)
  - `currentParentId` (for navigating down the catalog tree)
  - `breadcrumbStack` (for navigating back up)
- Sets up:
  - Initial and paginated fetching using `fetchCatalogs`
  - `IntersectionObserver` to lazy load the next catalog page
- Renders:
  - Breadcrumb navigation UI
  - `CatalogList` component to show current level catalogs

### 2. **`CatalogList.jsx`**
**Role:** Renders a list of catalog tiles (one level of the hierarchy)  
**Props:**
- `catalogs`: array of catalog objects
- `loading`: boolean to show loading indicator
- `onNavigate`: callback for drilling into subcatalogs
- `setLastItem`: callback to pass the last DOM node to parent for infinite scroll

**Behavior:**
- Highlights last catalog item to attach an observer
- On hover: triggers `prefetchCatalogProducts()` to preload products
- On click: drills down to the selected catalog via `onNavigate`

### 3. **`ProductList.jsx`**
**Role:** Displays a list of product names associated with a catalog  
**Props:**
- `products`: array of product objects (with `ProductDefinition.Name`)

**Behavior:**
- Renders each product's name (or "Unnamed Product" fallback)
- Does not yet include click/view/edit functionality (extendable)

---

## 🧠 Hooks

### **`useCatalog()`**
Located in `hooks/useCatalog.js`, this custom hook:
- Provides global catalog state and a `dispatch()` method
- Offers utilities like:
  - `prefetchCatalogProducts(catalogId, productList)` → used to preload products in the background on hover

---

## 📡 API Integrations

### **GET `/catalogs`**
- Accepts `parentID`, `page`, and `pageSize` query parameters
- Returns a paginated list of subcatalogs

### **POST `/catalogs/products`**
- Accepts an array of product IDs (from the catalog object)
- Returns detailed product definitions (names, etc.)

---

## 🔁 How It All Works Together

1. `CatalogsPage` mounts and fetches page 1 of root-level catalogs.
2. It renders `CatalogList`, passing:
   - The current catalog array
   - `onNavigate` (for drill-down)
   - `setLastItem` (to attach infinite scroll logic)
3. `CatalogList`:
   - Shows each catalog
   - Prefetches products on hover
   - Triggers a deeper fetch on click via `onNavigate`
4. When the last item appears in the viewport, the next page is fetched.
5. On drill-down:
   - `currentParentId` is updated
   - Breadcrumb is pushed
   - New catalog level is fetched
6. `ProductList` can be used in the main pane to render products tied to a catalog (integration not shown, but implied for future use)

---

## 🚀 Potential Enhancements
- Render `ProductList` alongside or below catalogs
- Add subcatalog display in a sidebar
- Support search/filter inside catalogs or products
- Add loading/error UI states for products