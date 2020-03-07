import React, {useState, useEffect, useCallback} from 'react';
import '../styles/Overall.css';

export default function OverallData ({place, overall}) {  
  
  const [data, setData] = useState({time: '', confirmed: '', suspect: '', cured: '', death: '', fatality: '' });
  const [time, setTime] = useState(data.time);
  const [placeString, setPlace] = useState(place +' Cases');

  const isWideScreen = () => {
    
    let mediaQuery = window.matchMedia("(orientation: portrait)");
    // console.log('sss', mediaQuery);
    if(mediaQuery.matches) { return false };

    if(document.body.clientWidth < 1024) { return false; }

    return true;
  }
  
  const handleResize = useCallback(() => {        
    console.log('triggered')
    let placeString = '';

    if(isWideScreen()) {
      if (time.length < 15) {          
        setTime(data.time);
      }
      if(place === 'China') {    
        placeString = 'Cases Found in China';  
      } else if(place === 'Canada') {
          placeString = 'Cases Found in Canada';
      } else if(place === 'Other') {
        placeString = 'Cases Found out of China';
      } else {
        placeString = 'Cases Found Worldwide';
      }
      setPlace(placeString);
      return;
    } 

    // if (time.length > 15) {
      setTime(data.time.slice(11, 16));
    // }
    if(place === 'China') {    
      placeString = 'China Cases';  
    } else if(place === 'Canada') {
        placeString = 'Canada Cases';
    } else if(place === 'Other') {
      placeString = 'NonChina Cases';
    } else {
      placeString = 'Global Cases';
    }
    setPlace(placeString);

  },[data.time, place, time.length]);

  useEffect(() => {
    if(overall)  {
      setData(overall);   
      handleResize();
    }
  }, [handleResize, overall]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <>
      <div className="eachText">As of <span className="dataTime">&nbsp; {time}</span></div>
      <div className="eachText">{placeString}</div>     
      <div className="eachText">Confirmed <span className="confirmedNumber">&nbsp; &nbsp; {data.confirmed}</span></div>
      <div className="eachText">Suspected <span className="suspectedNumber">&nbsp; &nbsp; {data.suspect}</span></div>
      <div className="eachText">Recovered <span className="curedNumber">&nbsp; &nbsp; {data.cured}</span></div>
      <div className="eachText">Deaths <span className="deathNumber">&nbsp; {data.death}</span></div>
      <div className="eachText">Lethality <span className="fatalityNumber">&nbsp; {data.fatality}</span></div>
    </>
  );
}