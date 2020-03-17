import React, {useState, useEffect, useCallback} from 'react';
import '../styles/Overall.css';
// import moment from 'moment';
import axios from 'axios';

export default function OverallData ({place, overall}) {  
  
  const [data, setData] = useState({time: '', confirmed: '', suspect: '', cured: '', death: '', fatality: '' });
  const [time, setTime] = useState(data.time);

  let placeString = 'Global Cases';

  if(place === 'Other') { 
    placeString = 'Outside China';
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
      axios.get(`./assets/UsaCasesHistory.json`).then( ({data}) => {
        if(data.cases) {
          let lastData = data.cases[data.cases.length - 1];

          setData ({
            time: data.date,
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
      axios.get(`./assets/CanadaCasesDb.json`).then( ({data}) => {
        setData ({
          time: data.date,
          confirmed: data.overall.confirmed, 
          suspect: data.overall.increased, 
          cured: data.overall.recovered, 
          death: data.overall.death, 
          fatality: (100 * data.overall.death / data.overall.confirmed).toFixed(2) + '%'
        });
        handleResize();
      });
    } else if(overall)  {
      axios.get(`./assets/GlobalCasesToday.json`).then( ({data}) => {
        let chinaIncreased = 0, globalIncreased = 0;

        chinaIncreased = data.countries.find( c => c.name === 'China').increased;
        globalIncreased = data.countries.reduce((total, country) => {
          return total = parseInt(total) + parseInt(country.increased || 0); 
        },[0]);

        if(place === 'Global') {
          setData({...overall, suspect: globalIncreased});  
        } else if(place === 'China') {
          setData({...overall, suspect: chinaIncreased});  
        } else {
          setData({...overall, suspect: globalIncreased - chinaIncreased}); 
        }
        handleResize();
      });
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
      <div className="eachText">Increased <span className="suspectedNumber">&nbsp; &nbsp; {data.suspect}</span></div>
      <div className="eachText">Recovered <span className="curedNumber">&nbsp; &nbsp; {data.cured}</span></div>
      <div className="eachText">Deaths <span className="deathNumber">&nbsp; {data.death}</span></div>
      <div className="eachText">Lethality <span className="fatalityNumber">&nbsp; {data.fatality}</span></div>
    </>
  );
}