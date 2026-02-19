NovaStore Sovereign No-Code UI Plan (Year 1)
Goal

Create a designer-led UI/UX authoring environment for all storefront pages (including product pages) that:

avoids SaaS page-builder licensing lock-in

avoids requiring deep React/framework knowledge for designers

keeps commerce logic stable and code-owned (pricing/cart/tax/BC handoff)

supports long-term maintainability so Nova is not dependent on outside dev companies

This system is storefront-only (not fulfillment). Fulfillment/shipping execution remains in Business Central. Taxes are handled via Avalara.

Monorepo Layout

Current structure is correct:

apps/StoreFrontAdmin — Admin UI (designer/editor studio + product/catalog management)

apps/StoreFrontBackEnd — API + business logic (pricing, templates/pages storage, BC handoff)

packages/StoreFrontCore — Rendering engine + block library + design system

Year 1 Decision
Designer Surface Policy

Year 1 = A: allow HTML + CSS only in controlled areas.

No JavaScript in designer-authored content in Year 1.

Consider Year 2 = B: add limited JS only if proven necessary.

Reason: safety + maintainability + prevents “designer content” from breaking commerce flows.

System Concept
Block Pages + Guardrails

Storefront UI is composed of blocks (approved components) stored as JSON.

Designers can:

choose a template

add/reorder blocks

edit block settings (props)

edit rich content

optionally author HTML/CSS in a safe block

Designers cannot:

change pricing/cart/tax logic

run scripts

access secrets or arbitrary API calls

break the order handoff to Business Central

Data Model (MongoDB)
pages (marketing + non-product pages)

Stores page definitions by slug with draft/publish support.

Example:

{
  _id,
  slug: "/",
  title: "Home",
  status: "draft" | "published",
  blocks: [ /* block instances */ ],
  publishedVersionId: ObjectId | null,
  createdAt, updatedAt, updatedBy
}

productTemplates (product page layouts)

Defines layouts for product pages.

Example:

{
  _id,
  key: "standard-product",
  name: "Standard Product",
  blocks: [ /* block instances */ ],
  isDefault: true,
  createdAt, updatedAt
}

products (assign a template)

Products reference a template (or default template if null).

Example:

{
  ...,
  templateKey: "standard-product" // or null => default
}

Block Instance Schema (stored in Pages/Templates)

Each block is stored as:

{
  id: "blk_123",
  type: "Hero" | "RichText" | "ProductGallery" | "PricePanel" | "AddToCart" | "HtmlCssSection",
  props: { /* validated per block */ }
}

Designer Surface Block: HtmlCssSection (Year 1)

A safe block that renders designer-authored HTML and CSS.

{
  id: "blk_999",
  type: "HtmlCssSection",
  props: {
    html: "<div class='promo'>...</div>",
    css: ".promo { ... }"
  }
}


Constraints (Year 1):

sanitize HTML (allowlist tags/attributes)

forbid scripts/events (<script>, onClick, javascript: URLs)

scope CSS to the block container

Rendering Architecture (StoreFrontCore)
Block Registry

StoreFrontCore defines a registry mapping:

type -> React component

type -> prop schema/validation

type -> default props

Conceptual shape:

export const registry = {
  Hero: { component: Hero, schema: heroSchema, defaults: {...} },
  HtmlCssSection: { component: HtmlCssSection, schema: htmlCssSchema, defaults: {...} },
  PricePanel: { component: PricePanel, schema: pricePanelSchema, defaults: {...} },
  AddToCart: { component: AddToCart, schema: addToCartSchema, defaults: {...} },
};

Renderer

A renderBlocks(blocks, context) function:

looks up each block’s component in the registry

validates/sanitizes props

renders components in order

Context

Renderer context includes trusted data/functions (not editable by designers), e.g.:

product

pricing (computed by backend)

cart actions

Backend Responsibilities (StoreFrontBackEnd)
Templates API

GET /api/product-templates

GET /api/product-templates/:key

POST /api/product-templates

PATCH /api/product-templates/:key

Pages API

GET /api/pages?slug=/...

POST /api/pages

PATCH /api/pages/:id

POST /api/pages/:id/publish

Pricing API (authoritative pricing)

Pricing is computed server-side (never client-authored).

POST /api/pricing/quote

input: { productId, qty, selectedOptions }

output: { unitPrice, lineTotal, breakdown }

Notes:

Taxes via Avalara (external)

Shipping is handled/synchronized via Business Central (external)

NovaStore’s focus is storefront & order handoff, not fulfillment

Admin UI Responsibilities (StoreFrontAdmin)
Template Studio / Page Studio (non-drag-drop)

A block editor designed for designers:

Add block

Move block up/down

Duplicate block

Delete block

Edit block props in a settings panel

Live preview

Save draft / Publish

Key point: designers learn Nova’s Studio, not React.

Guardrails (Non-Negotiable)

Year 1 must include:

HTML sanitization + allowlist

CSS scoping to block container

no script execution

version history + rollback (at least basic)

“commerce blocks” remain trusted and code-owned:

PricePanel, AddToCart, KitContents, etc.

Initial Block Set (MVP)

Start with:

Section

RichText

Image

ProductTitle

PricePanel

AddToCart

HtmlCssSection (Year 1 designer surface)

Phased Build Order (First Slice)

Backend CRUD for productTemplates

Admin “Template Studio” (list + reorder + props editor + preview)

Core block registry + renderBlocks()

Wire pricing quote endpoint into PricePanel

Assign templateKey to products

Success Criteria

By the end of Year 1 MVP:

A designer can create and publish product page layouts without a developer

Pricing is stable and authoritative from backend

Templates are versionable and rollbackable

Storefront pages can evolve without Java/framework expertise