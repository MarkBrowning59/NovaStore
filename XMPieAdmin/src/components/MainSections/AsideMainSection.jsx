import React from 'react'
import './AsideMainSection.css'

const AsideMainSection = () => {
  return (
    <section id='mainSection'>
    <article id="mainSectionArticle">
    <h1>Main article area</h1>
    <p>
      In this layout, we display the areas in source order for any screen less
      that 500 pixels wide. We go to a two column layout, and then to a three
      column layout by redefining the grid, and the placement of items on the
      grid.
    </p>
  </article>
  <aside id="mainSectionAside">Sidebar</aside>
    </section>
  )
}

export default AsideMainSection