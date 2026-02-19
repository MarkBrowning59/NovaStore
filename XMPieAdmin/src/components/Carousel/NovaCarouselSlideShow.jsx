import React, {useRef} from 'react'
import NovaCarouselSlide from './NovaCarouselImageSlide.jsx';
import './NovaCarouselSlideShow.scss';


const NovaCarouselSlideShow = ({CarouselState, carouselSlideShowData, slideShowRef, onTransitionEnd}) => {

  const transitionwidth = ((carouselSlideShowData.length * 100)/ carouselSlideShowData.length) ;

  const slideShowStyle = {    
    width: ((carouselSlideShowData.length * 100) / CarouselState.numberOfSlidesShown) + '%',
    height: '100%',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0, 
    left: `-${!CarouselState.infiniteSliding ? 0 : transitionwidth }%` ,
 
  }
  
  const slideStyle = {
    flexBasis: (((carouselSlideShowData.length * 100)/ CarouselState.numberOfSlidesShown)/ carouselSlideShowData.length) + '%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height:'100%',        
  }
  
  return (
  <>

    <div className='NovaCarouselSlideShow'ref = {slideShowRef} style={slideShowStyle} onTransitionEnd={onTransitionEnd}>
        {carouselSlideShowData.map(function (item,indx){      
          return <NovaCarouselSlide key = {indx + 1} className='NovaCarouselSlide' style={slideStyle} slideData = {item}/>      
        })}
    </div>
 
  </>
  )
}

export default NovaCarouselSlideShow