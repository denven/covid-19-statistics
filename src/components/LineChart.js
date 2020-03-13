import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import axios from 'axios';
import moment from 'moment';

export default function CasesTrend({country}) {
  
  const [data, setData] = useState([]);
  const [loaded, setReady] = useState(false);  // flag for loading map
  const [error, setError] = useState(false);  // dependency flag for re-send request
  
  useEffect(() => {
    if(country === 'China') {
      // { date, confirmedNum, suspectedNum, curesNum, deathsNum } 
      import(`../assets/LatestNews.json`).then( hisData => {
        setData(hisData);
        setReady(true);
      }).catch(e => { 
        setError(true);  // this will activate another request
        console.log('Request history data in China', e) 
      });
    }

    if(country === 'USA') {
      import(`../assets/UsaCasesHistory.json`).then( ({cases}) => {
        setData({
          date: cases.map(day => day.date),
          confirmedNum: cases.map(day => day.confirmedNum),
          increasedNum: cases.map(day => day.increasedNum),
          curesNum: cases.map(day => day.curesNum),
          deathsNum: cases.map(day => day.deathsNum)
        });
        setReady(true);
      });
    }
    // return (console.log('Cleanup'));
  },[country, error]);

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
          text: 'Accumulated Cases by day in ' + country
      },
      tooltip: { 
        trigger: 'axis',
      },
      legend: {
          data: ['Confirmed', (country === 'China') ? 'Suspected' : 'Increased', 'Recovered', 'Deaths'], // four curves
          top : '30px',
          textStyle: {fontSize: 12, fontWeight: 600},
      },
      grid: { left: 'center', right: 'center', bottom: '3%', containLabel: true, width: '85%' },
      toolbox: { feature: { saveAsImage: {} } },
      xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.date
      },
      yAxis: {
          type: 'value'
      },
      series: [
          {
              name: 'Confirmed',
              type: 'line',
              // stack: 'Toll',
              data: data.confirmedNum
          },
          {
              name: (country === 'China') ? 'Suspected' : 'Increased',
              type: 'line',
              // stack: 'Toll',
              data: (country === 'China') ? data.suspectedNum : data.increasedNum
          },          
          {
              name: 'Recovered',
              type: 'line',
              // stack: 'Toll',
              data: data.curesNum
          },
          {
              name: 'Deaths',
              type: 'line',
              // stack: 'Toll',
              data: data.deathsNum      
          }
      ]
    };
  }

  return (
    // (!loaded && error) ?
    // (<div className={classes.root}>
    //   <Alert severity="warning">Sorry, failed to get history data, please Refresh page!</Alert>
    //  </div>) :
    (
      <ReactEcharts 
        style={{height: country === 'China' ? "83vh" : "25vh" }}
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
  )
}