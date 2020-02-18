import React, {useState, useEffect} from 'react';
import axios from 'axios';
import moment from 'moment';
import { filter, pick } from 'lodash';

import '../styles/Overall.css'

export default function OverallData ({showGlobal}) {  
  const [data, setData] = useState({});

  useEffect(() => {
    if(showGlobal) {
      axios.get('https://lab.isaaclin.cn/nCoV/api/area').then((data)=> {
        let otherCountries = filter(data.data.results, ({cities})=>{ return (!Array.isArray(cities)) });
      
        let globalCases = { 
          currentConfirmedCount: 0, 
          confirmedCount: 0, 
          suspectedCount: 0, 
          curedCount: 0, 
          deadCount: 0
        };
      
        for(const country of otherCountries) {
          if(country.countryName === "钻石公主号邮轮") {
            country.countryEnglishName = 'Diamond Princess Cruise'
          }        
          if(country.countryName === "阿联酋") {
            country.countryEnglishName = "United Arab Emirates";
          }
          if(country.countryEnglishName === "United States of America") {
            country.countryEnglishName = "United States";
          }
          if(country.countryEnglishName) {
            globalCases.confirmedCount += country.confirmedCount;
            globalCases.currentConfirmedCount += country.currentConfirmedCount;
            globalCases.curedCount += country.curedCount;
            globalCases.deadCount += country.deadCount;
            globalCases.suspectedCount += country.suspectedCount;
          }
        }        
  
        let time = moment.unix(data.data.results[0].updateTime/1000).toString();
        let tollData = { 
          time: moment(time).format("YYYY-MM-DD HH:mm:ss"),
          confirmed: globalCases.confirmedCount, 
          suspect: globalCases.suspectedCount,
          cured: globalCases.curedCount, 
          death: globalCases.deadCount,
          fatality: (100 * globalCases.deadCount / (globalCases.confirmedCount + globalCases.curedCount)).toFixed(2) + '%'
        };
        setData(tollData);
      }).catch(e => console.log('Request global data:', e));
    } else {
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
  },[]);

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

