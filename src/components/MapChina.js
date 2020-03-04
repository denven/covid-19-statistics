import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';

// import axios from 'axios';
import pinyin from 'chinese-to-pinyin';
import titleize from 'titleize';

export default function MapChina({chinaMap}) {
  // const [data, setData] = useState([]);
  // const [loaded, setReady] = useState(false);  // is map data ready? cannot change it in useEffect!!!

  useEffect(() => {
    // register as 'china-' rather than 'china' to hide Southern seas on map
    import(`echarts/map/json/china.json`).then(map => {
      echarts.registerMap('china-', map.default);
    });
  }, []);

  // useEffect(() => {
  //     axios.get('http://www.dzyong.top:3005/yiqing/province').then((provinces) => {
  //     const tempData = provinces.data.data.map(p => ( 
  //       { name: p.provinceName, value: p.confirmedNum })
  //     );    
  //     setData(tempData);
  //     setReady(true);
  //   }).catch(e => { console.log('Request province data in China', e) })

  // },[chinaMap]);

  const getLoadingOption = () => {
    return {
      text: 'Data Loading ...',
      // color: '#4413c2',
      // textColor: '#270240',
      // maskColor: 'rgba(194, 88, 86, 0.3)',
      // zlevel: 0
    };
  };

  const onChartReady = (chart) => {
    if(Array.isArray(chinaMap) && chinaMap.length > 0) {
      setTimeout(() => { chart.hideLoading(); }, 500);
      // chart.hideLoading();
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
          return (
            params.seriesName + '<br />' + 
            titleize(pinyin(params.name, {removeTone: true})) + ': ' + value
          );
        }
      },
      // geo: {  },
      series: [{
        left: 'center',
        top: '19%',
        type: 'map',
        name: 'Confirmed Cases',
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

  return (
    <ReactEcharts 
      style={{height: "85vh"}}
      echarts={echarts}
      option={getOption()}
      loadingOption={getLoadingOption()}
      onChartReady={onChartReady}
      showLoading={true}
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
      // onEvents={EventsDict}
      // opts={} 
    />
  )
}