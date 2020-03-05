import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';

import axios from 'axios'
import cheerio from 'cheerio';

export default function MapCanada() {
  const [data, setData] = useState([]);
  const [loaded, setReady] = useState(false);

  useEffect(() => {
    import(`../assets/Canada.json`).then(map => {
      echarts.registerMap('Canada', map.default);
    });
  }, []);

  useEffect(() => {
      axios.get("https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html")
      .then( response => {
          if(response.status === 200) {
            let curCases = [];
            const $ = cheerio.load(response.data);
            $(".table").each( (index, ele) => {
              if(index === 0)              
                $('tr', 'tbody', ele).each( (index, ele) => {
                  let province = $(ele).text().trim().split("\n")[0];
                  let cases = $(ele).text().trim().split("\n")[1].replace(/ /g, '');
                  curCases.push({name: province, value: cases});
                });
            });
            setData(curCases);
            setReady(true);
          }
      });
  }, []);

  const getLoadingOption = () => {
    return {
      text: 'Data Loading ...',
    };
  };

  const onChartReady = (chart) => {
    if(Array.isArray(data) && data.length > 0) {
      setTimeout(() => { chart.hideLoading(); }, 1500);
    }
  };

  const getOption = () => {
    return {
      // backgroundColor: '#C0C0C0',
      title:  {
          x: 'center',
          text: 'Cases by Province in Canada',
          subtext: 'Data from https://www.canada.ca/en/public-health',
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
          {min: 100},
          {min: 50, max: 99},
          {min: 20, max: 49},
          {min: 6, max: 19},
          {min: 1, max: 5},
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
          let value = ((params.value || "No Case") + '').split('.');
          value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
          return `<b>${params.name}</b><br />Confirmed: ${value}<br />`;
        }
      },
      // geo: {  },
      series: [{
        left: 'center',
        top: '19%',
        type: 'map',
        name: '',
        geoIndex: 0,
        data: data, // area(provinces) data
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
        zoom: 1.1,
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
      showLoading={!loaded}
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
      // onEvents={EventsDict}
      // opts={} 
    />
  )
}

