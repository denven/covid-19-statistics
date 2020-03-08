import React, { useState, useEffect } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';

import pinyin from 'chinese-to-pinyin';
import titleize from 'titleize';

export default function MapUSA() {
  const [loaded, setReady] = useState(false);
  const [cases, setCases] = useState({dates:[], data:[]});

  useEffect(() => {
    import(`../assets/UsaGEO.json`).then(map => {
      echarts.registerMap('USA', map.default, {
        // Move Alaska to the bottom left of United States
        Alaska: {      
            left: -131,   // Upper left longitude            
            top: 25,      // Upper left latitude            
            width: 15     // Range of longitude
        },
        // Hawaii
        Hawaii: { left: -110, top: 28, width: 5 },
        // Puerto Rico
        'Puerto Rico': { left: -76, top: 26, width: 2 }
      });
    });
  }, []);

  useEffect(() => {
    import(`../assets/UsaStatesCases.json`).then( ({cases}) => {
      console.log(cases);
      setCases(cases.map( ({name, confirmed, death, recovered}) => {
        return {
          name: name,
          value: confirmed,
          cured: recovered,
          death: death
        }
      }));
      setReady(loaded);
    });
  }, [loaded]);

  const getLoadingOption = () => {
    return {
      text: 'Data Loading ...',
    };
  };

  const onChartReady = (chart) => {
    if(Array.isArray(cases) && cases.length > 0) {
      setTimeout(() => { chart.hideLoading(); }, 1000);
    }
  };

  const getOption = () => {
    return {
      // backgroundColor: '#C0C0C0',
      title:  {
          x: 'center',
          text: 'Cases by State in USA',
          subtext: 'Data from https://ncov.dxy.cn/',
          textStyle: {fontSize: 18},
      },
      visualMap: {
        show: true,
        type: 'piecewise',
        min: 0,
        max: 100000,
        align: 'left',
        top: '5%',
        left: 'center',
        inRange: { color: [ '#ffc0b1', '#ff8c71', '#ef1717', '#9c0505' ] },
        // cases number ranges: greater number indicates more severe epidemic area
        pieces: [ 
          {min: 10000},
          {min: 1000, max: 9999},
          {min: 500, max: 999},
          {min: 100, max: 499},
          {min: 10, max: 99},
          {min: 1, max: 9},
        ],
        padding: 30,
        orient: 'horizontal',
        showLabel: true,
        text: ['Outbreak', 'Minor Break'],
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 12, fontWeight: 'bold' }
      },
      toolbox: { feature: { saveAsImage: {} } },
      tooltip: {
        formatter: (params) => {
          console.log(params)
          let name = params.name;
          let death = 0, cured = 0;
          if(params.data) {
            death = params.data.death;
            cured = params.data.death;
          }
          let tipString = '';
          let value = ((params.value || "No Case") + '').split('.');
          if(!params.value) {
            tipString = `<b>${name}</b><br />Confirmed: ${value}`;
          } else {
            value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
            name = titleize(pinyin(name, {removeTone: true}));
            tipString = `<b>${name}</b><br />Confirmed: ${value}<br />Existing: \t${value - cured - death}<br />Cured：\t${cured}<br />Death：\t${death}`;
          }
          return tipString
        }
      },
      // geo: {  },
      series: [{
        left: 'center',
        top: '19%',
        type: 'map',
        name: '',
        geoIndex: 0,
        data: cases, // area(provinces) data
        map: 'USA',
        silent: false, // province area is clickable
        label: { normal: { show: true, fontSize:'8', color: 'rgba(0,0,0,0.7)' }}, 
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
        mapType: 'USA',        
        zoom: 1.2,
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
      loadingOption={getLoadingOption()}
      onChartReady={onChartReady}
      showLoading={false}
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
      // onEvents={EventsDict}
      // opts={} 
    />
  )
}