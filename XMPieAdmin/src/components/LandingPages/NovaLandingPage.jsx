/**
 * This is the Homepage
 * URL : http://<store-domain>/{language-code}/home/
 *
 * @param {object} state - the state of the store
 */
import React, { Component } from 'react'
import { throttle } from 'throttle-debounce'

import { UStoreProvider } from '@ustore/core'
import { Router } from '$routes'
import { t } from '$themelocalization'

import Layout from '../../Layout'
import CategoryItem from '../../CategoryItem'
import ProductItem from '../../ProductItem'
import PromotionItem from '../../PromotionItem'
import Slider from '$core-components/Slider'
import Gallery from '$core-components/Gallery'

import { getIsNGProduct } from '../../../services/utils'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import { getVariableValue } from '$ustoreinternal/services/cssVariables'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import './NovaLandingPage.scss'
import theme from '$styles/_theme.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

class Home extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isMobile: false,
      promotionItemButtonUrl: ''
    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize.bind(this))
    throttle(250, this.onResize) // Call this function once in 250ms only

    this.onResize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)

    this.clearCustomState()
  }

  clearCustomState () {
    UStoreProvider.state.customState.delete('homeFeaturedProducts')
    UStoreProvider.state.customState.delete('homeFeaturedCategory')
    UStoreProvider.state.customState.delete('currentProduct')
    UStoreProvider.state.customState.delete('currentOrderItem')
    UStoreProvider.state.customState.delete('currentOrderItemId')
    UStoreProvider.state.customState.delete('currentOrderItemPriceModel')
    UStoreProvider.state.customState.delete('lastOrder')
    UStoreProvider.state.customState.delete('currentProductThumbnails')
  }

  onResize () {
    this.setState({ isMobile: document.body.clientWidth < parseInt(theme.md.replace('px', '')) })
  }

  static getDerivedStateFromProps (props, state) {
    if (!(props.state && props.customState)) {
      return null
    }

    const { categories } = props.customState
    // NOTE: this is not supported in SSR
    if (categories && categories.length && !state.promotionItemButtonUrl.length) {
      const { FriendlyID, Name } = categories[0]
      const defaultURL = urlGenerator.get({ page: 'category', id: FriendlyID, name: decodeStringForURL(Name) })
      return { promotionItemButtonUrl: getVariableValue('--homepage-carousel-slide-1-button-url', defaultURL, false, true) }
    }
    return null
  }

  render () {
    if (!this.props.state) {
      return null
    }

    const { customState: { categories, homeFeaturedProducts, homeFeaturedCategory }, state: { currentStore } } = this.props

    const promotionItemImageUrl = getVariableValue('--homepage-carousel-slide-1-image', require(`$assets/images/banner_image.png`), true)
    const promotionItemTitle = getVariableValue('--homepage-carousel-slide-1-main-text', t('PromotionItem.Title'))
    const promotionItemSubtitle = getVariableValue('--homepage-carousel-slide-1-sub-text', t('PromotionItem.Subtitle'))
    const promotionItemButtonText = getVariableValue('--homepage-carousel-slide-1-button-text', t('PromotionItem.Button_Text'))

    return (
      <Layout {...this.props} className="home">
        
          <h1>Landing Page</h1>
        {/* <div className="promotion-wrapper">
          <Slider>
            <PromotionItem
              imageUrl={promotionItemImageUrl}
              title={promotionItemTitle}
              subTitle={promotionItemSubtitle}
              buttonText={promotionItemButtonText}
              url={this.state.promotionItemButtonUrl}
            />
          </Slider>
        </div> */}

        {/* <div className="middle-section">
          {categories && categories.length > 0 &&
            <div className="categories-wrapper">
              <Slider multi>
                {
                  categories.map((model) => {
                    return <CategoryItem key={model.ID} model={model}
                      url={urlGenerator.get({ page: 'category', id: model.FriendlyID, name: decodeStringForURL(model.Name) })} />
                  }
                  )
                }
              </Slider>
            </div>
          }

          <div className="divider" />
          {homeFeaturedCategory && homeFeaturedProducts &&
            <div className="featured-products-wrapper">
              <Gallery title={homeFeaturedCategory.Name}
                seeAllUrl={urlGenerator.get({ page: 'category', id: homeFeaturedCategory.FriendlyID, name: decodeStringForURL(homeFeaturedCategory.Name) })}
                gridRows="2">
                {
                  homeFeaturedProducts.map((model) => {
                    const hideProduct =
                      this.state.isMobile &&
                      model.Attributes &&
                      model.Attributes.find(attr => attr.Name === 'UEditEnabled' && attr.Value === 'true') !== undefined

                    return !hideProduct &&
                      <ProductItem
                        key={model.ID}
                        model={model}
                        productNameLines="2"
                        descriptionLines="4"
                        url={getIsNGProduct(model)
                          ? urlGenerator.get({ page: 'products', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
                          : urlGenerator.get({ page: 'product', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
                        }
                      />
                  })
                }
              </Gallery>
            </div>
          }
        </div> */}
      </Layout>
    )
  }
}

Home.getInitialProps = async function (ctx) {
  const maxInPage = 200
  const { Count } = await UStoreProvider.api.categories.getTopCategories(1, maxInPage)
  if (Count === 0) {
    return { homeFeaturedProducts: null, homeFeaturedCategory: null }
  }

  const page = Math.ceil(Count / maxInPage)
  const { Categories } = await UStoreProvider.api.categories.getTopCategories(page, maxInPage)

  if (Categories.length === 0) {
    return { homeFeaturedProducts: null, homeFeaturedCategory: null }
  }

  const homeFeaturedCategory = Categories[Categories.length - 1]
  const { Products: homeFeaturedProducts } = await UStoreProvider.api.products.getProducts(homeFeaturedCategory.ID, 1)
  return { homeFeaturedProducts, homeFeaturedCategory }
}

export default Home
