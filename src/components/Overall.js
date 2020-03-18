import React, {useState, useEffect, useCallback} from 'react';
import '../styles/Overall.css';
// import moment from 'moment';
import axios from 'axios';
import moment from 'moment';
// The moment-timezone.js can be used to convert local time(the code runs on which device located at) 
// to another timezone, but it doesn't convert a time from one(not local) timezone to another wanted timezone
// As we need to convert a absolute America/Vancouver time string to another local time
// we will use `new Date().getTimezoneOffset()` and moment.diff() moment.add() to fullfil this time conversion
// import momentTz from 'moment-timezone'; 

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

  const getLocalTime = (time) => {
    // let localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;   
    // vancouver is 420 miniutes behind of GMT, getTimezoneOffset() returns +420, eg, for Shanghai, GMT+8 retunrs -480
    let minutesDiff = 420 - new Date().getTimezoneOffset();
    return moment(time).add(minutesDiff, 'minutes').format("YYYY-MM-DD HH:mm:ss");
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
            time: getLocalTime(data.date),
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
          time: getLocalTime(data.date),
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
        // let chinaIncreased = 0, globalIncreased = 0;

        let chinaIncreased = data.countries.find( c => c.name === 'China').increased;
        let chinaConfirmed = data.countries.find( c => c.name === 'China').total;
        // globalIncreased = data.countries.reduce((total, country) => {
        //   return total += parseInt(country.increased.replace(/,/, '')); 
        // }, 0);

        console.log(chinaConfirmed, chinaIncreased);

        let localTime = getLocalTime(data.time);
        if(place === 'Global') {
          setData({...overall, time: localTime, suspect: data.overall.increased, confirmed: data.overall.total});  
        } else if(place === 'China') {
          setData({...overall, time: localTime, suspect: chinaIncreased});  
        } else {
          setData({...overall, time: localTime, 
            suspect: parseInt(data.overall.increased.replace(/,/g, '')) - parseInt(chinaIncreased.replace(/,/g, '')), 
            confirmed: parseInt(data.overall.total.replace(/,/g, '')) -  parseInt(chinaConfirmed.replace(/,/g, ''))}); 
        }
        handleResize();
      });
    }
  }, [handleResize, overall, place]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  }, [handleResize]);

  const valueFormat = (value) => {
    return value.toString().replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
  }

  return (
    <>
      <div className="eachText">As of <span className="dataTime">&nbsp; {time}</span></div>
      <div className="eachText">{placeString}</div>     
      <div className="eachText">Confirmed <span className="confirmedNumber">&nbsp; &nbsp; {valueFormat(data.confirmed)}</span></div>
      <div className="eachText">Increased <span className="suspectedNumber">&nbsp; &nbsp; {valueFormat(data.suspect)}</span></div>
      <div className="eachText">Recovered <span className="curedNumber">&nbsp; &nbsp; {valueFormat(data.cured)}</span></div>
      <div className="eachText">Deaths <span className="deathNumber">&nbsp; {valueFormat(data.death)}</span></div>
      <div className="eachText">Lethality <span className="fatalityNumber">&nbsp; {data.fatality}</span></div>
    </>
  );
}