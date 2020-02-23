import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import axios from 'axios';
import moment from 'moment';

// import Alert from '@material-ui/lab/Alert';
// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles(theme => ({
//   root: {
//     width: '100%',
//     '& > * + *': { marginTop: theme.spacing(2),},
//     textAlign: 'center',
//   },
// }));

export default function ChinaTrend() {
  
  const [data, setData] = useState([]);
  const [loaded, setReady] = useState(false);  // flag for loading map
  const [error, setError] = useState(false);  // dependency flag for re-send request
  
  // const classes = useStyles();

  useEffect(() => {
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
        setReady(true);
      } else {
        console.log('Requst for history data in China, errCode:', hisData.data.errCode);
        setError(true);  // this will activate another request
      }
    }).catch(e => { console.log('Request history data in China', e) });

    // return (console.log('Cleanup'));
  },[error]);

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
              name: 'Suspected',
              type: 'line',
              // stack: 'Toll',
              data: data.suspectedNum
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
  )
}