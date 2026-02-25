// src/blocks/blockRegistry.js
import Section from './Section.jsx';
import RichText from './RichText.jsx';
import ImageBlock from './ImageBlock.jsx';
import HtmlCssSection from './HtmlCssSection.jsx';
import ProductTitle from './ProductTitle.jsx';
import ProductGallery from './ProductGallery.jsx';
import PricePanel from './PricePanel.jsx';
import AddToCart from './AddToCart.jsx';

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
