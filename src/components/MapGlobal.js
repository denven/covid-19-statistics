import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

import axios from 'axios'
import { filter, pick } from 'lodash';

export default function MapGlobal() {

  useEffect(() => {
    import(`echarts/map/json/world.json`).then(map => {
      echarts.registerMap('world', map.default)  
    });
  }, []);
 
  const [mapData, setMapData] = useState([]);  // countries current data to display on map
  // const [allData, setAllData] = useState([]);  // countries all data to display in table
  // const [toll, setToll] = useState({}); // overall data without china's

  useEffect(() => {
    axios.get('https://lab.isaaclin.cn/nCoV/api/area').then((data)=> {
      let chinaData = filter(data.data.results, ({cities})=>{ return (Array.isArray(cities)) });
      let otherCountries = filter(data.data.results, ({cities})=>{ return (!Array.isArray(cities)) });

      let chinaCases = { 
        countryEnglishName: 'China', 
        currentConfirmedCount: 0, 
        confirmedCount: 0, 
        suspectedCount: 0, 
        curedCount: 0, 
        deadCount: 0
      };

      for(const prov of chinaData) {
        chinaCases.confirmedCount += prov.confirmedCount;
        chinaCases.currentConfirmedCount += prov.currentConfirmedCount;
        chinaCases.curedCount += prov.curedCount;
        chinaCases.deadCount += prov.deadCount;
        chinaCases.suspectedCount += prov.suspectedCount;
      }

      let countriesAllData = otherCountries.map((country) => { 
        if(country.countryName === "阿联酋") {
          country.countryEnglishName = "United Arab Emirates";
        }
        return pick(country, "countryEnglishName", "confirmedCount", 
        "currentConfirmedCount", "suspectedCount", "curedCount", "deadCount")} 
      );
      
      let countriesAllDataWithChina = countriesAllData.map((country) => {          
        if(country.countryEnglishName === "United States of America") {
          country.countryEnglishName = "United States";
        }

        if(country.countryEnglishName) {
            return {name: country.countryEnglishName, value: country.confirmedCount};
        }
      });
      countriesAllDataWithChina.push({name: 'China', value: chinaCases.confirmedCount});
      setMapData(countriesAllDataWithChina);  // rendering the map coz map loading again all the time
    }).catch(e => console.log('Request global data:', e));
  },[]);

  const getLoadingOption = () => {
    return {
      text: 'Loading data...',
      color: '#4413c2',
      textColor: '#270240',
      maskColor: 'rgba(194, 88, 86, 0.3)',
      zlevel: 0
    };
  };

  const onChartReady = (chart) => {
    setTimeout(() => { chart.hideLoading(); }, 3000);
  };

  const getOption = () => {
    return {
      // backgroundColor: '#C0C0C0',
      title:  {
          x: 'center',
          text: 'Cases by country Worldwide',
          subtext: 'Data from https://lab.isaaclin.cn/',
          margin: '10px',
          textStyle: {fontSize: 18},
      },
      visualMap: {
        show: true,
        type: 'piecewise',
        min: 0,
        max: 100000,
        align: 'left',
        top: '50%',
        left: 'left',
        inRange: { color: [ '#ffc0b1', '#ff8c71', '#ef1717', '#9c0505' ] },
        // cases number ranges: greater number indicates more severe epidemic area
        pieces: [ 
          {min: 500},
          {min: 100, max: 499},
          {min: 50, max: 99},
          {min: 10, max: 49},
          {min: 1, max: 9},
        ],        
        padding: 30,
        orient: 'vertical',
        showLabel: true,
        text: ['Outbreak', 'Minor Break'],
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 12, fontWeight: 'bold' }
      },
      tooltip: {
        formatter: (params) => {
          let value = ((params.value || 'No Case') + '').split('.');
          value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
          return (params.seriesName + '<br />' + params.name + ': ' + value );
        }
      },
      // geo: {  },
      series: [{
        top: '20%',
        left: 'center',
        type: 'map',
        name: 'Confirmed Cases',
        geoIndex: 0,
        data: mapData, // area(countries) data
        map: 'world',
        // the following attributes can be put in geo, but the map will smaller
        // and cannot be zoomed out
        silent: false, // country area is clickable
        label: { normal: { 
          show: false,  // do not show country name
          fontSize:'8', 
          color: 'rgba(0,0,0,0.7)'  // default area color
        }}, 
        itemStyle: {
          normal:{ 
            borderColor: 'rgba(0, 0, 0, 0.2)',
            areaColor: '#B2E5BC'  // default area color 
          },
          emphasis:{
              areaColor: '#53adf3', // change color when click
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 20,           
              borderWidth: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        mapType: 'world',        
        zoom: 1.15,        
        roam: false,
        showLegendSymbol: false,
        rippleEffect: { show: true, brushType: 'stroke', scale: 2.5, period: 4 },
      }]
    }
  }

  return (
    <ReactEcharts 
      style={{height: "85vh"}}
      echarts={echarts}
      option={getOption()}
      // loadingOption={getLoadingOption()}
      // onChartReady={onChartReady}
      // showLoading={true}
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
      // onEvents={EventsDict}
      // opts={} 
    />
  )
}