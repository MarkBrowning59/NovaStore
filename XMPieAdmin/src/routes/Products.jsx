import React from 'react'
import Layout from '../components/Layout'
import ProductsSection from '../components/Products/ProductsSection'
import ProductsNavBar from '../components/Products/ProductsNavBar'



const Products = () => {
  return (
    <Layout NavigationBar={<ProductsNavBar/>}>
    {/* <Layout NavigationBar={<ProductsNavBar/>} UtilitiesBar={<StoresNavBar/>}> */}

      <ProductsSection/>
    </Layout>
  )
}

export default Products