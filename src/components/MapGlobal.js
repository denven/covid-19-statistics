import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import { height } from '@material-ui/system';

import axios from 'axios'
// import 'echarts/map/json/province/'

export default function MapChina({data}) {

  useEffect(() => {
    import(`echarts/map/json/world.json`).then(map => {
      echarts.registerMap('world', map.default)
    },[])    
  })

  useEffect(() => {
      axios.request('https://3g.dxy.cn/newh5/view/pneumonia').then(({ data: html }) => {

      }).catch(e => {
        
      })
  })

  const getOption = () => {
    return {
      // backgroundColor: '#C0C0C0',
      title:  {
          x: 'right',
          text: 'COVID-19 Statistics Global',
          subtext: 'Data from https://ncov.dxy.cn/',
          sublink: 'https://ncov.dxy.cn/ncovh5/view/pneumonia',
          // right: '10px',
          textStyle: {fontSize: 22},
      },
      visualMap: {
        show: true,
        type: 'piecewise',
        min: 0,
        max: 100000,
        align: 'right',
        top: '40%',
        left: 'right',
        right: '50px',
        inRange: { color: [ '#ffc0b1', '#ff8c71', '#ef1717', '#9c0505' ] },
        pieces: [ //cases 
          {min: 500},
          {min: 100, max: 499},
          {min: 20, max: 99},
          {min: 1, max: 19},
        ],
        padding: 5,
        orient: 'vertical',
        showLabel: true,
        text: ['Many', 'Few'],
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 15 }
        // "borderWidth": 0
      },
      series: [{
        left: 'center',
        // top: '15%',
        // bottom: '10%',
        type: 'map',
        name: 'Confirmed Cases',
        silent: false,
        label: {
          show: false,  // don't show country name
          position: 'inside',
          // margin: 8,
          fontSize: 6
        },        
        mapType: 'world',
        data,  // show data on province
        zoom: 1.2,
        roam: false,
        showLegendSymbol: false,
        emphasis: {},
        rippleEffect: { show: true, brushType: 'stroke', scale: 2.5, period: 4 }
      }]
    }
  }

  return (
    <ReactEcharts 
      style={{height: "670px"}}
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