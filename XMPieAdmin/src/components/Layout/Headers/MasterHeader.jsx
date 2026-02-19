import React from 'react'
import LogoContainer from './Logos/MasterLogoContainer'
import NovaLogo from './Logos/NovaLogo'
import './MasterHeader.css'

import CategoriesNavBar from './NavigationBars/CategoriesNavBar'
// import UtilitiesNavBar from './NavigationBars/UtilitiesNavBar'

const Header = ({NavigationBar, UtilitiesBar}) => {
  return (
    <header id='mainHeader'>
     <LogoContainer><NovaLogo/></LogoContainer>
     {NavigationBar || <CategoriesNavBar/>}
     {UtilitiesBar && <>{UtilitiesBar}</>}
    </header>
  )
}

export default Header