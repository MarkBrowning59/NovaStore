// src/blocks/blockRegistry.js
import Section from './blocks/Section.jsx';
import RichText from './blocks/RichText.jsx';
import ImageBlock from './blocks/ImageBlock.jsx';
import HtmlCssSection from './blocks/HtmlCssSection.jsx';
import ProductTitle from './blocks/ProductTitle.jsx';
import ProductGallery from './blocks/ProductGallery.jsx';
import PricePanel from './blocks/PricePanel.jsx';
import AddToCart from './blocks/AddToCart.jsx';

/**
 * Registry of allowed blocks.
 * Designers can only use these block types.
 */
export const blockRegistry = {
  Section: { component: Section, defaults: { padding: 'md', background: 'transparent' } },
  RichText: { component: RichText, defaults: { html: '' } },
  Image: { component: ImageBlock, defaults: { src: '', alt: '', fit: 'cover' } },
  HtmlCssSection: { component: HtmlCssSection, defaults: { html: '', css: '' } },

  // Commerce/Product blocks
  ProductTitle: { component: ProductTitle, defaults: { tag: 'h1' } },
  ProductGallery: { component: ProductGallery, defaults: { maxThumbs: 8 } },
  PricePanel: { component: PricePanel, defaults: { showFrom: true } },
  AddToCart: { component: AddToCart, defaults: { label: 'Add to cart' } },
};
