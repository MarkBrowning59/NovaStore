import React from 'react'
import Header from './Headers/MasterHeader'
import Footer from './Footers/MasterFooter'
import MainContent from './MainContent/MainContent'
import './Layout.css'

const Layout = ({NavigationBar, UtilitiesBar, children}) => {
  return (
    <>
    <main id='mainLayout'>
      <Header NavigationBar={NavigationBar} UtilitiesBar ={UtilitiesBar}/>
     <MainContent>
      {children}
      </MainContent>
       <Footer/>
    </main>
    </>
  )
}

export default Layout