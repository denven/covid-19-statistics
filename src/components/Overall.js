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
      <div>As of <span className="dataTime">{data.time}</span></div>
      <div>{placeString}</div>     
      <div>Confirmed: <span className="confirmedNumber">{data.confirmed}</span></div>
      <div>Suspected: <span className="suspectedNumber">{data.suspect}</span></div>
      <div>Recovered: <span className="curedNumber">{data.cured}</span></div>
      <div>Deaths: <span className="deathNumber">{data.death}</span></div>
      <div>Lethality: <span className="fatalityNumber">{data.fatality}</span></div>
    </>

  );
}