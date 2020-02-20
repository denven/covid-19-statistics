import React, {useState, useEffect} from 'react';
import axios from 'axios';
import '../styles/Overall.css';

export default function OverallData ({showGlobal, overall}) {  
  const [data, setData] = useState(showGlobal ? overall: { });

  useEffect(() => {
    if(showGlobal) {setData(overall)}
    else {
    axios.get('http://www.dzyong.top:3005/yiqing/total')
      .then((total) => {
          const {date, diagnosed, suspect, cured, death} = total.data.data[0];
          setData({ 
            time: date,
            confirmed: diagnosed, 
            suspect: suspect,
            cured: cured, 
            death: death,
            fatality: (100 * death / (diagnosed + cured)).toFixed(2) + '%'
          });
      }).catch(e => { console.log('Request latest overall data in China', e) });
    }
  },[overall, showGlobal]);

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

