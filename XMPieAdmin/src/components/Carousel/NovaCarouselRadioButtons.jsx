import React, {useContext}  from 'react'
import { NovaCarouselContext } from './NovaCarousel';
import './NovaCarouselRadioButtons.scss';

  const NovaCarouselRadioButtons = (  ) => {

    const {buttons, setCurrentButton, numberOfSlidesShown,numberOfSlides} = useContext(NovaCarouselContext);
    
    const NumberOfButtons = Math.ceil(numberOfSlides / numberOfSlidesShown);

    
    while (buttons.length > 0) {buttons.pop();}

  for (let i = 1; i <= numberOfSlides; i++) {
    
    buttons.push(<button key={i} id={`NovaCarouselRadioButton${i}`} className={i === 1 ? 'NovaCarouselRadioButton CurrentNovaCarouselRadioButton' : 'NovaCarouselRadioButton'} onClick={()=>{setCurrentButton(i)}} > {`${i}`}</button>);
  }



  return (
    <div className='NovaCarouselRadioButtons' >
      {buttons.map((button)=> button)}
    </div>
  )
}

export default NovaCarouselRadioButtons