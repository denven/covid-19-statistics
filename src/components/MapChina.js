import React, { useState, useEffect } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';

// import axios from 'axios';
import pinyin from 'chinese-to-pinyin';
import titleize from 'titleize';

export default function MapChina({chinaMap}) {
  // const [data, setData] = useState([]);
  const [loaded, setReady] = useState(false);  // is map data ready? cannot change it in useEffect!!!
  useEffect(() => {
    let isCancelled = false;
    // register as 'china-' rather than 'china' to hide Southern seas on map
    import(`echarts/map/json/china.json`).then(map => {
      echarts.registerMap('china-', map.default);
      if(!isCancelled) setReady(true);
    });
    return () => {isCancelled = true;};
  }, []);

  // Number value formatter
  const valueFormat = (value) => {
    return (value || '0').toString().replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
  }

  const getLoadingOption = () => {
    return {
      text: 'Data Loading ...',
    };
  };

  const onChartReady = (chart) => {
    if(Array.isArray(chinaMap) && chinaMap.length > 0) {
      setTimeout(() => { chart.hideLoading(); }, 1000);
    }
  };

  const getOption = () => {
    return {
      // backgroundColor: '#C0C0C0',
      title:  {
          x: 'center',
          text: 'Cases by Province in China',
          subtext: 'Data from https://ncov.dxy.cn/',
          // sublink: 'https://ncov.dxy.cn/ncovh5/view/pneumonia',
          // right: '10px',
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
        text: ['Outbreak', 'Minor'],
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 12, fontWeight: 'bold' }
      },
      toolbox: { feature: { saveAsImage: {} } },
      tooltip: {
        formatter: (params) => {
          let { name, confirmed, death, cured } = params.data;
          let value = ((params.value || "No Case") + '').split('.');
          value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
          name = titleize(pinyin(name, {removeTone: true}));
          const tipString = `<b>${name}</b><br />
                                Active: \t${valueFormat(value)}<br />
                                Confirmed: ${valueFormat(confirmed)}<br />
                                Cured:\t${valueFormat(cured)}<br />
                                Death:\t${valueFormat(death)}`;
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
        data: chinaMap, // area(provinces) data
        map: 'china-',
        // the following attributes can be put in geo, but the map will smaller
        // and cannot be zoomed out
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
        mapType: 'china-',        
        zoom: 1.0,
        roam: false,
        showLegendSymbol: false,
        rippleEffect: { show: true, brushType: 'stroke', scale: 2.5, period: 4 },
      }]
    }
  }

  const getModerateHeight = () => {
    let mediaQuery = window.matchMedia("(orientation: portrait)");
    // console.log('sss', mediaQuery);
    if(mediaQuery.matches) {
      if(document.body.clientWidth < 1024) {
        return "48vh";
      }        
    }
    return "85vh";
  }

  return (
    <ReactEcharts 
      style={{height: getModerateHeight()}}
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