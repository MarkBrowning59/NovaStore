import React, {useEffect, useRef, createContext} from 'react'
import NovaCarouselSlideShow from './NovaCarouselSlideShow.js'
import './NovaCarousel.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faChevronRight, faChevronLeft, faPauseCircle } from '@fortawesome/free-solid-svg-icons'
import NovaCarouselRadioButtons from './NovaCarouselRadioButtons.js'

export const NovaCarouselContext = createContext();

const NovaCarousel = ({slides}) => {

  const nextBTNRef = useRef(null);
  const prevBTNRef = useRef(null);
  const pauseBTNRef = useRef(null);
  const playBTNRef = useRef(null);
  const slideShowRef = useRef(null);

  //Initial Slide State
  //This State is about defining parameters for carousel functionality including positon of slides.
  //THIS IS NOT about managing the Application State.

const CarouselState = {
  slides: slides,
  numberOfSlides: slides.length,

  //Number of slides shown at one time
  numberOfSlidesShown : 1,
  
  //Looping through the slides 
  infiniteSliding : true,
  
  //Used with infinite sliding to determine when the slideshow needs to loop to either the first slide (the case of moving to next slide) or last slide (the case of moving to previous slide).
  resetCarousel: false,
  
  //Current and Desired Slide(s) Shown 
  desired: 0,
  active: 1,
  
  //Offset needed for transition of slide show
  offset: 0,
  
  
  //Determines if slide show is in middle of transitioning
  //If true a new transition will not take place. 
  transitioning: false,
  
  //Parameters for bill board type of functionality where the slide show automatically transitions from on to the next
  autoNext: false,
  autoNextDuration: 3000,
  autoNextTimeoutID : null,
  autoNextPaused : false,
  
  //Used for state managment of radio buttons 
  buttons : [],
  currentButton: 1
};


//SETUP Inline Styles for both the carousel and slide show
const carouselStyle ={
  position: 'relative',
}

const CarouselSlideShowContainerStyle =
{
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden'
}


// In order to create infinite sliding: The last slides are prefixed to the slide show array and the first slides are suffixed to the slide show array.
const carouselSlideShowData = !CarouselState.infiniteSliding ? [...slides] :
[...slides.slice(-CarouselState.numberOfSlidesShown) , ...slides, ...slides.slice(0 ,CarouselState.numberOfSlidesShown)]


//Function to show next slide

const btnNext = ()=>{

 prevBTNRef.current.style.display = 'block';

 if( CarouselState.infiniteSliding === false )
 {
    if(CarouselState.active + CarouselState.numberOfSlidesShown === CarouselState.numberOfSlides + 1)
    {
      CarouselState.transitioning = false;
      return;
    }
    const numberOfRemainingSlides = CarouselState.numberOfSlides + 1 - (CarouselState.
      active + CarouselState.numberOfSlidesShown);
                 
      if(numberOfRemainingSlides <  CarouselState.numberOfSlidesShown )
      { 
        CarouselState.desired = CarouselState.active + numberOfRemainingSlides;
        nextBTNRef.current.style.display = 'none';
      }
      else
      { CarouselState.desired = CarouselState.active + CarouselState.numberOfSlidesShown; }

      nextBTNRef.current.style.display = ( CarouselState.desired + CarouselState.numberOfSlidesShown - 1  === CarouselState.numberOfSlides ) ? 'none' : 'block';
  
  }

  else if((CarouselState.active + CarouselState.numberOfSlidesShown) > CarouselState.numberOfSlides)
  { 
    CarouselState.desired = CarouselState.numberOfSlides + 1
  }
  else 
  { CarouselState.desired = (CarouselState.active + CarouselState.numberOfSlidesShown) %  carouselSlideShowData.length ; }

  
 transitionSlideShow();  

}


//Function to show previous slide
const btnPrev = ()=>{
  
 nextBTNRef.current.style.display = 'block';

 if( CarouselState.infiniteSliding === false )
 {
    const numberOfRemainingSlides = (CarouselState.active - 1 + CarouselState.numberOfSlidesShown) - CarouselState.numberOfSlidesShown ;    


    if(CarouselState.active === 1 || numberOfRemainingSlides === 0)
    {
      prevBTNRef.current.style.display = 'none';
        CarouselState.transitioning = false;
        return;
    }

   
    else if(numberOfRemainingSlides <  CarouselState.numberOfSlidesShown )
    {    
      CarouselState.desired = CarouselState.active - numberOfRemainingSlides;
    }
    else
    {            
        CarouselState.desired = CarouselState.active - CarouselState.numberOfSlidesShown;
      
    }

    prevBTNRef.current.style.display = ( CarouselState.desired === 1 ) ? 'none' : 'block';
  
  }


  else if(CarouselState.active - CarouselState.numberOfSlidesShown <  1 - CarouselState.numberOfSlidesShown)
  {
    CarouselState.desired = 1 - CarouselState.numberOfSlidesShown;
  }
  else{
    CarouselState.desired = (CarouselState.active - CarouselState.numberOfSlidesShown) %  carouselSlideShowData.length ;     
  }

  transitionSlideShow();  

}


//Reposition Side
//Once to transistion is completed the sider's event listener 
//transitionend is called to reposition first and las slides if need be.
const transitionSlideShow = () =>{

  if(! CarouselState.transitioning)
  {
  


   CarouselState.transitioning = true; 
   calculateOffSet(); 

   slideShowRef.current.style.transform = `translateX(${CarouselState.offset}%)`;
  }
}


const transitionend = () =>{
  
  let rButtons = document.querySelectorAll('.NovaCarouselRadioButton')
  rButtons.forEach( (b) => { b.classList.remove('CurrentNovaCarouselRadioButton')});

  if(CarouselState.autoNext && CarouselState.infiniteSliding && !CarouselState.autoNextPaused)
  {
    clearTimeout(CarouselState.autoNextTimeoutID);
    autoNext();
   }
       
     CarouselState.active =  CarouselState.desired;
 
  if(CarouselState.infiniteSliding === false)
  {
    document.getElementById(`NovaCarouselRadioButton${CarouselState.active}`).classList.add('CurrentNovaCarouselRadioButton'); 

    CarouselState.transitioning = false; 
    return;
  }


  CarouselState.resetCarousel = CarouselState.active === ( 1 - CarouselState.numberOfSlidesShown) || CarouselState.active === ( CarouselState.numberOfSlides + 1 );
  
  if (CarouselState.active === ( 1 - CarouselState.numberOfSlidesShown)) 
  {  CarouselState.desired = (carouselSlideShowData.length  - (CarouselState.numberOfSlidesShown * 3) + 1 )}
  
  else if (CarouselState.active === (CarouselState.numberOfSlides + 1)) 
  { CarouselState.desired =  1; }
  
  
  if(!CarouselState.resetCarousel)
  {
    
    let btn;
    if(CarouselState.desired < 1)
    btn = 1;
    else if(CarouselState.desired > CarouselState.slides.length)
    btn = CarouselState.buttons.length;
    else
    btn = CarouselState.desired;

    document.getElementById(`NovaCarouselRadioButton${btn}`).classList.add('CurrentNovaCarouselRadioButton'); 

  }
  else
  {  

       calculateOffSet();          
    
       const transition = slideShowRef.current.style.transition;
       slideShowRef.current.style.transition = 'none';
       slideShowRef.current.style.transform = `translateX(${CarouselState.offset}%)`; 
      
       setTimeout(()=>{
        slideShowRef.current.style.transition = transition;
        })

         CarouselState.active =  CarouselState.desired;    
        
  document.getElementById(`NovaCarouselRadioButton${CarouselState.active}`).classList.add('CurrentNovaCarouselRadioButton'); 
  
  }


    CarouselState.transitioning = false; 
}

//Calculate Offset
const calculateOffSet = ()=>
{     
      const activeOffset = ((CarouselState.active ) / carouselSlideShowData.length) * 100
      const desiredOffset = ((CarouselState.desired ) / carouselSlideShowData.length) * 100
      CarouselState.offset += (activeOffset - desiredOffset);
     
}

const autoNext = ()=>{

  if(CarouselState.numberOfSlides === CarouselState.numberOfSlidesShown)
  return;

  if(CarouselState.autoNext && CarouselState.infiniteSliding && !CarouselState.autoNextPaused)
  {
      CarouselState.autoNextTimeoutID = setTimeout(()=>{
       btnNext();
      } , CarouselState.autoNextDuration )
  }

}

const pauseAutoNext  = () => {


  if(!CarouselState.autoNext || !CarouselState.infiniteSliding)
  return;

  clearTimeout(CarouselState.autoNextTimeoutID);

  CarouselState.autoNextPaused = !CarouselState.autoNextPaused;

  if(CarouselState.autoNextPaused)
  {
    playBTNRef.current.style.display = 'block';
    pauseBTNRef.current.style.display = 'none';
    
  }
  if(!CarouselState.autoNextPaused)
  {
    playBTNRef.current.style.display = 'none';
    pauseBTNRef.current.style.display = 'block';
    btnNext();
  }


  autoNext();
  
}

CarouselState.setCurrentButton = (desiredButton) =>
{
  

  if(jumpTo(desiredButton))
  {
     CarouselState.currentButton = desiredButton

    let rButtons = document.querySelectorAll('.NovaCarouselRadioButton')
    rButtons.forEach( (b) => { b.classList.remove('CurrentNovaCarouselRadioButton')});

    document.getElementById(`NovaCarouselRadioButton${CarouselState.currentButton}`).classList.add('CurrentNovaCarouselRadioButton');


  }
  
}

const jumpTo = (desired)=>{


if(!CarouselState.infiniteSliding)
{

  if(desired === 1)
  {
    prevBTNRef.current.style.display = 'none';
    nextBTNRef.current.style.display = 'block';
  }
  else if(desired === CarouselState.buttons.length)
  {
    nextBTNRef.current.style.display = 'none';
    prevBTNRef.current.style.display = 'block';
  }
  else if (desired > 1 && desired < CarouselState.buttons.length)
  {
    prevBTNRef.current.style.display = 'block';
    nextBTNRef.current.style.display = 'block';
  }

}


if(!CarouselState.transitioning)
  { 
    if(!CarouselState.autoNextPaused)      
      pauseAutoNext();

      CarouselState.desired = desired;
      transitionSlideShow();

      return true;
  }

  return false;

}




//MOUSE Slider Functions
let isMouseButtonPressed = false;
let startCursorX;


const onMouseDown = (e) =>{
  if(CarouselState.autoNext) return;
  isMouseButtonPressed = true;
  startCursorX = e.clientX;
  slideShowRef.current.style.cursor = 'grabbing'
}

const onMouseMove = (e) => {
  e.preventDefault();
}

const onMouseUp = (e) =>{
  if(CarouselState.autoNext) return; 
  isMouseButtonPressed = false;
  startCursorX > e.clientX ? btnNext() : btnPrev();
  slideShowRef.current.style.cursor = 'grab'
}

const onMouseHover = (e) =>{
  if(CarouselState.autoNext) return; 
  slideShowRef.current.style.cursor = 'grab'
}

useEffect(() => {
 autoNext();
}, [])

  return (
    
  <NovaCarouselContext.Provider value={CarouselState}>
  
    <div className='NovaCarousel' style ={carouselStyle} >

{CarouselState.numberOfSlides !== CarouselState.numberOfSlidesShown  &&
 CarouselState.numberOfSlides >= CarouselState.numberOfSlidesShown  &&
<>


    <div className='NovaCarouselNavigationButtons'>

      { CarouselState.infiniteSliding && <button className="btn previous-btn"  ref = {prevBTNRef }  onClick={()=>{btnPrev()}}><FontAwesomeIcon className="arrow-icon " icon={faChevronLeft} size="2x"/></button>
      }

      { CarouselState.infiniteSliding || <button className="btn previous-btn"  ref = {prevBTNRef } hidden onClick={()=>{btnPrev()}}><FontAwesomeIcon className="arrow-icon " icon={faChevronLeft} size="2x"/></button>
      }

      <button className="carouselBtn next-btn" ref={nextBTNRef} onClick={()=>{btnNext()}} ><FontAwesomeIcon className="arrow-icon" icon={faChevronRight}  size="2x"/></button>

        {  CarouselState.infiniteSliding && CarouselState.autoNext 
        && 
         <>
          <button className="carouselBtn pause-btn" onClick={()=>{pauseAutoNext()}}  ref ={pauseBTNRef}><FontAwesomeIcon className="arrow-icon" icon={faPauseCircle}  size="2x"/></button>
         
          <button className="carouselBtn play-btn" hidden ref = {playBTNRef} onClick={()=>{pauseAutoNext()}} ><FontAwesomeIcon className="arrow-icon" icon={faCirclePlay}  size="2x"/></button>
        </>
        }
    
      </div>
   
      <NovaCarouselRadioButtons/>
</>
} 

      <div className='CarouselSlideShowContainer' onMouseMove ={(e) => {onMouseMove(e)}} onMouseDown={(e)=>{onMouseDown(e)}} onMouseUp={(e)=>{onMouseUp(e)}} onMouseHover ={(e) => {onMouseHover(e)}} style={CarouselSlideShowContainerStyle} >
        <NovaCarouselSlideShow  slides = {slides} CarouselState = {CarouselState} carouselSlideShowData = {carouselSlideShowData} slideShowRef = {slideShowRef} onTransitionEnd={()=>{transitionend()}}  />               
      </div>
    
    </div>

  </NovaCarouselContext.Provider>
     
  )
}

export default NovaCarousel