import React, {useState, useEffect, useCallback} from 'react';
import '../styles/Overall.css';
import moment from 'moment';
export default function OverallData ({place, overall}) {  
  
  const [data, setData] = useState({time: '', confirmed: '', suspect: '', cured: '', death: '', fatality: '' });
  const [time, setTime] = useState(data.time);

  let placeString = 'Global Cases';

  if(place === 'Other') { 
    placeString = 'Non-China Cases';
  } else {
    placeString = place + ' Cases';
  }
   
  const isWideScreen = () => {
    
    let mediaQuery = window.matchMedia("(orientation: portrait)");
    // console.log('sss', mediaQuery);
    if(mediaQuery.matches) { return false };

    if(document.body.clientWidth < 1024) { return false; }

    return true;
  }
  
  const handleResize = useCallback(() => {        

    if(isWideScreen()) {
      if (time.length < 15) {          
        setTime(data.time);
      }
      return;
    } 

    setTime(data.time.slice(11, 16));

  },[data.time, time.length]);

  useEffect(() => {

    if(place === 'USA') {
      import(`../assets/UsaCasesHistory.json`).then( ({date, cases}) => {
        if(cases) {
          let lastData = cases[cases.length - 1];
          let srcDate = new Date(date);
          let timeStr = moment(srcDate).format('YYYY-MM-DD HH:MM:SS');

          setData ({
            time: timeStr,
            confirmed: lastData.confirmedNum, 
            suspect: lastData.increasedNum, 
            cured: lastData.curesNum, 
            death: lastData.deathsNum, 
            fatality: (100 * lastData.deathsNum / lastData.confirmedNum).toFixed(2) + '%'
          });
          handleResize();
        }
      });
    } else if(place === 'Canada') {
      import(`../assets/CanadaCasesDb.json`).then( ({date, overall}) => {
        console.log(overall);
        let srcDate = new Date(date);
        let timeStr = moment(srcDate).format('YYYY-MM-DD HH:MM:SS');
        setData ({
          time: timeStr,
          confirmed: overall.confirmed, 
          suspect: overall.increased, 
          cured: overall.recovered, 
          death: overall.death, 
          fatality: (100 * overall.death / overall.confirmed).toFixed(2) + '%'
        });
        handleResize();
      });
    } else if(overall)  {
      setData(overall);   
      handleResize();
    }
  }, [handleResize, overall, place]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <>
      <div className="eachText">As of <span className="dataTime">&nbsp; {time}</span></div>
      <div className="eachText">{placeString}</div>     
      <div className="eachText">Confirmed <span className="confirmedNumber">&nbsp; &nbsp; {data.confirmed}</span></div>
      <div className="eachText"> {(place !== 'USA' && place !== 'Canada') ? 'Suspected' : 'Increased'} <span className="suspectedNumber">&nbsp; &nbsp; {data.suspect}</span></div>
      <div className="eachText">Recovered <span className="curedNumber">&nbsp; &nbsp; {data.cured}</span></div>
      <div className="eachText">Deaths <span className="deathNumber">&nbsp; {data.death}</span></div>
      <div className="eachText">Lethality <span className="fatalityNumber">&nbsp; {data.fatality}</span></div>
    </>
  );
}