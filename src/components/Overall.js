import React, {useState, useEffect} from 'react';
import '../styles/Overall.css';

export default function OverallData ({place, overall}) {  
  
  const [data, setData] = useState({time: '', confirmed: '', suspect: '', cured: '', death: '', fatality: '' });

  useEffect(() => {
    if(overall)  setData(overall);    
  }, [overall]);

  let placeString = 'Cases Found Worldwide'
  if(place === 'China') {
    placeString = 'Cases Found in China'
  } else if(place === 'Other') {
    placeString = 'Cases Found out of China'
  }

  return (
    <>
      <div className="eachText">As of <span className="dataTime">&nbsp; {data.time}</span></div>
      <div className="eachText">{placeString}</div>     
      <div className="eachText">Confirmed <span className="confirmedNumber">&nbsp; {data.confirmed}</span></div>
      <div className="eachText">Suspected <span className="suspectedNumber">&nbsp; {data.suspect}</span></div>
      <div className="eachText">Recovered <span className="curedNumber">&nbsp; {data.cured}</span></div>
      <div className="eachText">Deaths <span className="deathNumber">&nbsp; {data.death}</span></div>
      <div className="eachText">Lethality <span className="fatalityNumber">&nbsp; {data.fatality}</span></div>
    </>

  );
}