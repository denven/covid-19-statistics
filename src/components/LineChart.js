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
      const hisDataUrl = 'https://www.windquant.com/qntcloud/data/edb?userid=2a5db344-6b19-4828-9673-d0d81bd265bc';
      const indicators = '&indicators=S6274770,S6274773,S6274772,S6274771&startdate=2020-01-20&enddate=';
      const endDate = moment().format('YYYY-MM-DD');

      axios.get(hisDataUrl + indicators + endDate).then( hisData => {
        if(hisData.data.errCode === 0) {
          setData({ 
            date: hisData.data.times.map( s => { return moment.unix(s / 1000).format('YYYY-MM-DD') }),
            confirmedNum: hisData.data.data[0],
            suspectedNum: hisData.data.data[1], 
            curesNum: hisData.data.data[2],
            deathsNum: hisData.data.data[3]
          });
          console.log(hisData.data)
          setReady(true);
        } else {
          console.log('Requst for history data in China, errCode:', hisData.data.errCode);
          setError(true);  // this will activate another request
        }        
      }).catch(e => { console.log('Request history data in China', e) });
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
      tooltip: { trigger: 'axis' },
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