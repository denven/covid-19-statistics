import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
// import 'echarts/lib/chart/line';

export default function MapCanada() {
  // const [data, setData] = useState([]);
  const [loaded, setReady] = useState(false);
  const [cases, setCases] = useState({dates:[], data:[]});

  useEffect(() => {
    import(`../assets/CanadaGEO.json`).then(map => {
      echarts.registerMap('Canada', map.default);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    import(`../assets/CanadaCasesDb.json`).then( ({cases}) => {
      setCases(
        {
          dates: cases.map(day => day.date),     // for timeline component
          data: cases.map(day => day.cases),  // for map component
          // barData: cases.map(day => day.cases.map(prov => prov.value))  // for bar Chart component
        }
      );
    });
  }, []);

  const getLoadingOption = () => {
    return {
      text: 'Data Loading ...',
    };
  };

  const onChartReady = (chart) => {
    if(Array.isArray(cases) && cases.length > 0) {
      setTimeout(() => { chart.hideLoading(); }, 1500);
    }
  };

  const setVisualMap = () => {
    return {
      show: true,
      type: 'piecewise',
      min: 0,
      max: 100000,
      align: 'right',
      bottom: '7%',
      left: 'center',
      orient: 'horizontal',
      inRange: { color: [ '#ffc0b1', '#ff8c71', '#ef1717', '#9c0505' ] },
      pieces: [ 
        {min: 100},
        {min: 50, max: 99},
        {min: 20, max: 49},
        {min: 10, max: 19},
        {min: 6, max: 9},
        {min: 0, max: 5},
      ],
      padding: 30,
      showLabel: true,
      text: ['Outbreak', 'Minor Break'],
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 12, fontWeight: 'bold' }
    }
  }

  const getOptionConfig = () => {
    return {
      //global settings
      baseOption: {
        timeline: {  // by day
          //loop: false,      
          axisType: 'category',
          show: true,
          autoPlay: true,
          playInterval: 1500,
          data: cases.dates,        // Days since the 1st cases
          currentIndex: cases.dates.length - 1,
        },  
        title:  {
          x: 'center',
          text: 'Cases by Province in Canada',
          subtext: 'Data from https://www.canada.ca/en/public-health',
          textStyle: {fontSize: 18},
        },
        tooltip: {
          show: true,
          trigger: 'item',
        },
        visualMap: setVisualMap(),   
        xAxis: [{
          type: 'value',
          max: 100,  // max cases number
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },],
        yAxis: [{
          type: 'category',
          inverse: true,
          data: ['ON', 'BC', 'QC', 'AB', 'MB', 'SK', 'NL', 'PE', 'NS', 'NB', 'YT', 'NT', 'NU']
        }],
        series: [
          {
            // left: '0%', // not working, cannot be adjusted
            type: 'bar', 
            label: {
              position: 'inside',
              show: true,
              color: 'blue'
            },
          },
          {
            left: '15%',
            top: '19%',
            type: 'map',
            name: '',
            geoIndex: 0,
            // data: data, // area(provinces) data, put this into OPTIONS' series
            map: 'Canada',
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
            mapType: 'map',        
            zoom: 1.0,
            roam: false,
            showLegendSymbol: false,
            rippleEffect: { show: true, brushType: 'stroke', scale: 2.5, period: 4 },
          }
        ]
      },          
    
      // played data changes here, one timespot(day) one data
      options: cases.data.map( (dayCases, index) => {
        return {
          title: { text: 'Cases by Province in Canada on ' + cases.dates[index] + ', 2020', }, //by day          
          series: 
          [
            {
              data: dayCases.map(prov => prov.value) // for barchart(province data)
            },
            {
              data: dayCases, // for map
              tooltip: {
                formatter: (params) => {
                  let value = ((params.value || "No Case") + '').split('.');
                  value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
                  return `<b>${params.name}</b><br />Confirmed: ${value}<br />`;
                }
              },
            },
          ]
        }
      }),            
    }
  }
  
  const getModerateHeight = () => {
    let mediaQuery = window.matchMedia("(orientation: portrait)");
    // console.log('sss', mediaQuery);
    if(mediaQuery.matches) {
      if(document.body.clientWidth < 1024) {
        return "65vh";
      }        
    }
    return "85vh";
  }

  return (
    <ReactEcharts 
      style={{height: getModerateHeight()}}
      echarts={echarts}
      option={getOptionConfig()}
      loadingOption={getLoadingOption()}
      onChartReady={onChartReady}
      showLoading={!loaded}
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
      // onEvents={EventsDict}
      // opts={} 
    />
  )
}




