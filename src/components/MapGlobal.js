import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import { height } from '@material-ui/system';

import axios from 'axios'
import { map, filter, pick } from 'lodash';

// export default function MapGlobal({data}) {

//   useEffect(() => {
//     import(`echarts/map/json/world.json`).then(map => {
//       echarts.registerMap('world', map.default)
//     },[])    
//   })

//   // useEffect(() => {
//   //     axios.request('https://3g.dxy.cn/newh5/view/pneumonia').then(({ data: html }) => {

//   //     }).catch(e => {
        
//   //     })
//   // })

//   const getOption = () => {
//     return {
//       // backgroundColor: '#C0C0C0',
//       title:  {
//           x: 'right',
//           text: 'COVID-19 Statistics Global',
//           subtext: 'Data from https://ncov.dxy.cn/',
//           sublink: 'https://ncov.dxy.cn/ncovh5/view/pneumonia',
//           // right: '10px',
//           textStyle: {fontSize: 22},
//       },
//       visualMap: {
//         show: true,
//         type: 'piecewise',
//         min: 0,
//         max: 100000,
//         align: 'right',
//         top: '40%',
//         left: 'right',
//         right: '50px',
//         inRange: { color: [ '#ffc0b1', '#ff8c71', '#ef1717', '#9c0505' ] },
//         pieces: [ //cases 
//           {min: 500},
//           {min: 100, max: 499},
//           {min: 20, max: 99},
//           {min: 1, max: 19},
//         ],
//         padding: 5,
//         orient: 'vertical',
//         showLabel: true,
//         text: ['Many', 'Few'],
//         itemWidth: 10,
//         itemHeight: 10,
//         textStyle: { fontSize: 15 }
//         // "borderWidth": 0
//       },
//       series: [{
//         left: 'center',
//         // top: '15%',
//         // bottom: '10%',
//         type: 'map',
//         name: 'Confirmed Cases',
//         silent: false,
//         label: {
//           show: false,  // don't show country name
//           position: 'inside',
//           // margin: 8,
//           fontSize: 6
//         },        
//         mapType: 'world',
//         data,  // show data on province
//         zoom: 1.2,
//         roam: false,
//         showLegendSymbol: false,
//         emphasis: {},
//         rippleEffect: { show: true, brushType: 'stroke', scale: 2.5, period: 4 }
//       }]
//     }
//   }

//   return (
//     <ReactEcharts 
//       style={{height: "600px"}}
//       echarts={echarts}
//       option={getOption()}
//       notMerge={true}
//       lazyUpdate={true}
//       theme={"theme_name"}
//       // onChartReady={this.onChartReadyCallback}
//       // onEvents={EventsDict}
//       // opts={} 
//     />
//   )
// }

export default function MapGlobal() {
  const [curData, setCurData] = useState([]);  // countries current data to display on map
  const [allData, setAllData] = useState([]);  // countries all data to display in table
  const [toll, setToll] = useState({}); // overall data without china's

  useEffect(() => {
    import(`echarts/map/json/world.json`).then(map => {
      echarts.registerMap('world', map.default)  
    });
  }, []);

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
        "currentConfirmedCount", "suspectedCount", "curedCount", "deadCount")} );
        
      let countriesAllDataWithChina = countriesAllData.map((country) => {
          
        // "provinceName": "钻石公主号邮轮",
        if(country.countryEnglishName === "United States of America") {
          country.countryEnglishName = "United States";
        }

        if(country.countryEnglishName) {
            return {name: country.countryEnglishName, value: country.confirmedCount};
        }
      });
      console.log(countriesAllData);
      countriesAllDataWithChina.push({name: 'China', value: chinaCases.confirmedCount});
      setCurData(countriesAllDataWithChina);

// "updateTime": 1581930312974
    });
  },[])

  const onChartReady = (chart) => {
    setTimeout(() => { chart.hideLoading(); }, 1500);
  };

  const getOption = () => {
    return {
      // backgroundColor: '#C0C0C0',
      title:  {
          x: 'center',
          text: 'Cases by country Worldwide',
          subtext: 'Data from https://lab.isaaclin.cn/',
          margin: '10px',
          textStyle: {fontSize: 22},
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
        // formatter: (params) => {
        //   return (
        //     params.seriesName + '<br />' + 
        //     titleize(pinyin(params.name, {removeTone: true})) + ': ' + params.value
        //   );
        // }
      },
      // geo: {  },
      series: [{
        left: 'center',
        type: 'map',
        name: 'Confirmed Cases',
        geoIndex: 0,
        data: curData, // area(countries) data
        map: 'world',
        // the following attributes can be put in geo, but the map will smaller
        // and cannot be zoomed out
        silent: false, // province area is clickable
        label: { normal: { 
          show: false,  // do not show country name
          fontSize:'8', 
          color: 'rgba(0,0,0,0.7)' 
        }}, 
        itemStyle: {
          normal:{ borderColor: 'rgba(0, 0, 0, 0.2)' },
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
        zoom: 1.2,
        
        roam: false,
        showLegendSymbol: false,
        rippleEffect: { show: true, brushType: 'stroke', scale: 2.5, period: 4 },
      }]
    }
  }

  return (
    <ReactEcharts 
      style={{height: "600px"}}
      echarts={echarts}
      option={getOption()}
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