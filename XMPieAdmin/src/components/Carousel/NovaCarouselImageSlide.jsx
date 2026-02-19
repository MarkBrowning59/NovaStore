import React from 'react'
import './NovaCarouselSlide.css'

const NovaCarouselSlide = ({slideData, style}) => {

  const carouselSlideStyle ={
    maxWidth: '100%',
    height: 'auto'
  }

  return (
    <div  style={style}>
      <img src={require(`/src/img/${slideData}`)} alt={`${slideData}`} style={carouselSlideStyle}/>
      </div>
  )
}

export default NovaCarouselSlide