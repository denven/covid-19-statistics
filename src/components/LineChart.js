import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';

import axios from 'axios';
import { map } from 'lodash';

export default function ChinaTrend() {
  
  const [data, setData] = useState([]);
  const [loaded, setReady] = useState(false); 

  useEffect(() => {
    axios.get('http://www.dzyong.top:3005/yiqing/history').then((hisData) => {
        setData(hisData.data.data);
        setReady(true);
        console.log(hisData.data.data);
    }).catch(e => { console.log('Request history data in China', e) })
  }, []);

  const getLoadingOption = () => {
    return { text: 'Data Loading ...' };
  };

  const onChartReady = (chart, loaded) => {
    if(loaded) {
      setTimeout(() => {
        chart.hideLoading();
      }, 1000); 
    }
  };

  const getOption = () => {
    return {
      title: {
          x: 'center',
          text: 'Accumulated Cases by day in China'
      },
      tooltip: { trigger: 'axis' },
      legend: {
          data: ['Confirmed', 'Suspected', 'Recovered', 'Deaths'], // four curves
          top : '30px',
          textStyle: {fontSize: 12, fontWeight: 600},
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      toolbox: { feature: { saveAsImage: {} } },
      xAxis: {
          type: 'category',
          boundaryGap: false,
          data: map(data, 'date').reverse()
      },
      yAxis: {
          type: 'value'
      },
      series: [
          {
              name: 'Confirmed',
              type: 'line',
              // stack: 'Toll',
              data: map(data, 'confirmedNum').reverse()
          },
          {
              name: 'Suspected',
              type: 'line',
              // stack: 'Toll',
              data: map(data, 'suspectedNum').reverse()
          },          
          {
              name: 'Recovered',
              type: 'line',
              // stack: 'Toll',
              data: map(data, 'curesNum').reverse()
          },
          {
              name: 'Deaths',
              type: 'line',
              // stack: 'Toll',
              data: map(data, 'deathsNum').reverse()       
          }
      ]
    };
  }

  return (
    <ReactEcharts 
      style={{height: "83vh"}}
      echarts={echarts}
      option={getOption()}
      loadingOption={getLoadingOption()}
      onChartReady={onChartReady}
      showLoading={!loaded}  //official showloading always have bugs 
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
    />
  )
}