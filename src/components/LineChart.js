import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';

import axios from 'axios';
import { map } from 'lodash';

export default function ChinaTrend() {
  
  const [data, setData] = useState([]);
  useEffect(() => {
    axios.get('http://www.dzyong.top:3005/yiqing/history')
    .then((hisData) => {
        setData(hisData.data.data)
    }).catch(e => { console.log('Request history data in China', e) })
  }, [])

  const getOption = () => {
    return {
      title: {
          x: 'center',
          text: 'Accumulated Cases by day in China'
      },
      tooltip: { trigger: 'axis' },
      legend: {
          data: ['Presumptive', 'Suspected', 'Recovered', 'Deaths'], // four curves
          top : '30px'
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
              name: 'Presumptive',
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
      style={{height: "600px"}}
      echarts={echarts}
      option={getOption()}
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
      // onChartReady={this.onChartReadyCallback}
      // onEvents={EventsDict}
      // opts={} 
    />
  )
}

