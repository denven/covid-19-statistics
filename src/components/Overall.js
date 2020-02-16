import React, {useState, useEffect} from 'react';
import axios from 'axios';

import '../styles/Overall.css'

export default function OverallData (props) {  
  const [data, setData] = useState({});
  useEffect(() => {
    axios.get('http://www.dzyong.top:3005/yiqing/total')
    .then((total) => {
        const {date, diagnosed, suspect, cured, death} = total.data.data[0];
        // {dayjs(modifyTime).format('YYYY-MM-DD HH:mm');
        console.log(total);
        setData({ 
          time: date,
          confirmed: diagnosed, 
          suspect: suspect,
          cured: cured, 
          death: death,
          fatality: (100 * death / (diagnosed + cured)).toFixed(2) + '%'
        }) ;
    }).catch(e => { console.log('Request province data in China', e) })
  },[])

  return (
    <>
      <div>As of: <span className="dataTime">{data.time}</span></div>
      <div>Confirmed Cases: <span className="confirmedNumber">{data.confirmed}</span></div>
      <div>Suspected Cases: <span className="suspectedNumber">{data.suspect}</span></div>
      <div>Cured Cases: <span className="curedNumber">{data.cured}</span></div>
      <div>Death:<span className="deathNumber">{data.death}</span></div>
      <div>Fatality Rate: <span className="fatalityNumber">{data.fatality}</span></div>
    </>

  );
}

