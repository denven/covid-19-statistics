import MapCanada from './MapCanada';
import Button from '@material-ui/core/Button';
import '../styles/App.css'

import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import _ from 'lodash';

import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';

const columns = [
  { label: "Province", id: "Province", align: 'left', maxWidth: 10},
  { label: "Tested", id: "Tests", align: 'right', maxWidth: 10 },
  { label: "Confirmed", id: "Conf.", align: 'right', maxWidth: 10 },
  { label: "Presumptive", id: "Pres.", align: 'right', maxWidth: 10 },
  { label: "Total", id: "Total", align: 'right', maxWidth: 10 },
  { label: "Cases/1M", id: "Per m", align: 'right', maxWidth: 10 },
  { label: "Recovered", id: "Recov.", align: 'right', maxWidth: 10 },
  { label: "Deaths", id: "Deaths", align: 'right', maxWidth: 10 },
  { label: "Active", id: "Active", align: 'right', maxWidth: 10 },
];

const StyledTableCell = withStyles(theme => ({
  head: { fontWeight: 600 },
  body: { fontSize: 14, },
}))(TableCell);

const isWideScreen = () => {
    
  let mediaQuery = window.matchMedia("(orientation: portrait)");
  // console.log('sss', mediaQuery);
  if(mediaQuery.matches) { return false };

  if(document.body.clientWidth < 1024) { return false; }

  return true;
}

const useStyles = makeStyles({
  root: { width: '100%', }, container: { maxHeight: "82vh" },
  chart: {marginTop: '2.5%'},
  switch: {
    display: isWideScreen() ? 'flex' : 'none',
    position: 'fixed',
    top: '11wh',
    marginLeft: '5vw', 
    height: '2.2rem',
    // backgroundSize: '100% auto',
    zIndex: 9999,
    // webkitTransition: 'opacity .3s ease',
  }
});

function TableTitle () {
  return (
    <div className="timelineTitle">
      <div>Cases Detail by Province in Canada Today</div>
      <div className="subTitle" >Data from https://en.wikipedia.org/wiki/2020_coronavirus_outbreak_in_Canada</div>
    </div>
  )
}

const valueFormat = (value) => {
  return value.toString().replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
}

function ProvincesTable ({data}) {
  const classes = useStyles();

  return (
    <Paper className={classes.root} elevation={0} >
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table" size="small">

          <TableHead >
            <TableRow>
              {columns.map(column => (
                <StyledTableCell 
                  key={column.id} align={column.align}
                  style={{ minWidth: column.minWidth }} >
                  {column.label}
                </StyledTableCell> )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map( (row, index) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.Province}>
                  {columns.map(column => {
                    let value = valueFormat(row[column.id]);
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>

        </Table>
      </TableContainer>

    </Paper>
  );
};

function CasesHisTrend ({days, dayCases}) {
  
  const getLoadingOption = () => {
    return { text: 'Data Loading ...' };
  };

  const onChartReady = (chart, loaded) => {
    if(days && Array.isArray(dayCases)) {
      setTimeout(() => {
        chart.hideLoading();
      }, 1000); 
    }
  };

  const getOption = () => {
    return {
      title: {
          x: 'center',
          text: 'Accumulated Cases by day in Canada',
      },
      tooltip: { 
        trigger: 'axis',
      },
      legend: {
          // data: ['Confirmed', 'Suspected', 'Increased', 'Recovered', 'Deaths'], // four curves
          data: ['Confirmed', 'Suspected'], // 2 curves
          top : '30px',
          textStyle: {fontSize: 12, fontWeight: 600},
      },
      grid: { left: 'center', right: 'center', bottom: '3%', containLabel: true, width: '85%' },
      toolbox: { feature: { saveAsImage: {} } },
      xAxis: {
          type: 'category',
          boundaryGap: false,
          data: days
      },
      yAxis: {
          type: 'value'
      },
      series: [
          {
              name: 'Confirmed',
              type: 'line',
              // stack: 'Toll',
              data: dayCases && dayCases.map( 
                  dayProvCases => dayProvCases.reduce((total, curProv) => {
                    return total = parseInt(total) + parseInt(curProv.value || 0); 
                }, [0]))
          },
          {
              name: 'Suspected',
              type: 'line',
              // stack: 'Toll',
              data: dayCases && dayCases.map( 
                dayProvCases => dayProvCases.reduce((total, curProv) => {
                  return total = parseInt(total) + parseInt(curProv.suspect || 0); 
              }, [0]))
          }
      ]
    };
  }

  return (
    (days && dayCases) ? (
      <ReactEcharts 
        style={{height: "25vh" }}
        echarts={echarts}
        option={getOption()}
        loadingOption={getLoadingOption()}
        onChartReady={onChartReady}
        showLoading={true}  //official showloading always have bugs 
        notMerge={true}
        lazyUpdate={true}
        theme={"theme_name"}
      />
    ) : <></>
  )
}

export default function Canada() {

  const [hisCases, setCases] = useState({dates: [], cases: []});
  const [provDetails, setDetail] = useState([]);
  const [viewMode, setMode] = useState('map');

  const classes = useStyles();

  const handleSwitch = () => {
    if(viewMode === 'map') setMode('table');
    else setMode('map');
  }

  useEffect(() => {
    let isCanceled = false;
    axios.get(`./assets/CanadaCasesDb.json`).then( ({data}) => {
      if(!isCanceled) {
        let hisDataObj =  {
            dates: data.cases.map(day => day.date),  // xAxis: dates array
            cases: data.cases.map(day => day.cases),  // YAxis: cases array
          };
        setCases(hisDataObj);

        let allData = data.details;
        let canada = allData.pop();
        let tmp = _.sortBy(allData, (o) => parseInt(o.Total)).reverse();
        tmp.push(canada);
        setDetail(tmp);
      }
    });
    return () => {isCanceled = true;}
  }, []);


  switch(viewMode) {
    case 'map': 
      return (
        <>
          <Button variant="outlined" className={classes.switch} 
                  onClick={handleSwitch} > Switch to Table
          </Button>
          <MapCanada hisCases={hisCases} />
        </>);

    case 'table':
      return (
        <>
          <Button variant="outlined" color="primary" className={classes.switch} 
                    onClick={handleSwitch} > Switch to Map
          </Button>
          <TableTitle />
          {/* </div> */}
          <ProvincesTable data={provDetails} />
          <div className={classes.chart} >
          <CasesHisTrend days={hisCases.dates} dayCases={hisCases.cases} />
          </div>
        </>
      );
    default: return (<></>);
  }
}