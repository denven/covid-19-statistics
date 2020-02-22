import React, {useState, useEffect} from 'react';
import '../styles/Overall.css';

export default function OverallData ({showGlobal, overall}) {  
  
  const [data, setData] = useState({time: '', confirmed: '', suspect: '', cured: '', death: '', fatality: '' });

  useEffect(() => {
    if(overall)  setData(overall);
  }, [overall]);
  
  console.log('overdata', overall);
  return (
    <>
      <div>As of <span className="dataTime">{data.time}</span></div>
      <div>{showGlobal ? 'Cases Worldwide (out of China)' : 'Cases found in China'}
        <span className="confirmedNumber"></span>
      </div>
      <div>Confirmed: <span className="confirmedNumber">{data.confirmed}</span></div>
      <div>Suspected: <span className="suspectedNumber">{data.suspect}</span></div>
      <div>Recovered: <span className="curedNumber">{data.cured}</span></div>
      <div>Deaths: <span className="deathNumber">{data.death}</span></div>
      <div>Lethality: <span className="fatalityNumber">{data.fatality}</span></div>
    </>

  );
}

