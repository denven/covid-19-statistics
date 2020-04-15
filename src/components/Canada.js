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
  { label: "Province", id: "Abbr", align: 'right', maxWidth: 60},
  { label: "Tested", id: "Tests", align: 'right', maxWidth: 65 },
  { label: "Conf.", id: "Conf.", align: 'right', maxWidth: 50 },
  { label: "New", id: "New", align: 'right', maxWidth: 35 },
  { label: "Cases/M", id: "Per m", align: 'right', maxWidth: 60 },
  { label: "Hosp(ICU)", id: "InWard", align: 'right', maxWidth: 65 },
  // { label: "InICU", id: "InICU", align: 'right', maxWidth: 30 },
  { label: "Cured", id: "Cured", align: 'right', maxWidth: 40 },
  { label: "Deaths", id: "Deaths", align: 'right', maxWidth: 40 },
  { label: "New", id: "NewDeaths", align: 'right', maxWidth: 25 },
  { label: "Active", id: "Active", align: 'right', maxWidth: 50 },
  { label: "Lethality", id: "Lethality", align: 'right', maxWidth: 55 },
];

const StyledTableCell = withStyles(theme => ({
  head: { fontWeight: 600 },
  body: { fontSize: 14 },
  sizeSmall: { padding: '4px 16px 4px 0px'}
}))(TableCell);

const StyledTableBodyCell = withStyles(theme => ({
  sizeSmall: { padding: '4px 16px 4px 0px'}
}))(TableCell);

const isPortraitMode = () => {
  let mediaQuery = window.matchMedia("(orientation: portrait)");
  return mediaQuery.matches;
}

const useStyles = makeStyles({
  root: { width: '100%', }, 
  container: { maxHeight: isPortraitMode() ? "65vh" : "42.5vh" },
  chart: {marginTop: '2.5%'},
});

function TableTitle () {
  return (
    <div className="canadaTableTitle" style={{top: 0}}>
      <div>Cases Detail by Province in Canada Today</div>
      <div className="subTitle" >Data from https://en.wikipedia.org/wiki/2020_coronavirus_outbreak_in_Canada</div>
    </div>
  )
}

const valueFormat = (value) => {
  return (value || '0').toString().replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
}

function ProvincesTable ({data, onRowClick}) {
  const classes = useStyles();

  //merge ICU number into InWard
  let rowsData = data.map( (row, index) => {
    let {InWard, InICU} = row;

    if(index === data.length - 1) {
      InWard = data.reduce((total, curProv) => {
        return total += parseInt(curProv.InWard || 0);
      }, 0);
      InICU = data.reduce((total, curProv) => {
        return total += parseInt(curProv.InICU || 0);
      }, 0);
    }

    if(InICU > 0) InWard = InWard + `(${InICU})`;
    let obj = Object.assign({...row}, {InWard: InWard});
    delete Object.assign(obj).InICU;
    return obj;
  });

  return (
    <Paper className={classes.root} elevation={0} >
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead >
            <TableRow>
              {columns.map(column => (
                <StyledTableCell key={column.id} align={column.align}
                  style={{ maxWidth: column.maxWidth}}>
                  {column.label}
                </StyledTableCell> )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsData.map( (row, index) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.Abbr}
                onClick={(event) => onRowClick(event, row)} >
                  {columns.map(column => {                                      
                    let value = valueFormat(row[column.id]);
                    return (
                      <StyledTableBodyCell key={column.id} align={column.align}                      
                      style={{ maxWidth: column.maxWidth,
                               color: value.includes('+') > 0 ? 'red' : 'inherits', 
                               fontWeight: row.Abbr === 'Canada' ? 600 : 400 }}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </StyledTableBodyCell>
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

// Line Chart
function CasesHisTrend ({prov, days, dayCases, dayNewCases}) {

  const [loaded, setReady] = useState(false);
  const getLoadingOption = () => {
    return { text: 'Data Loading ...' };
  };

  const onChartReady = (chart) => {
    if(days && Array.isArray(dayCases)) {
      setReady(true);
      setTimeout(() => { chart.hideLoading(); }, 1000); 
    }
  };

  //get single province history data: confirmed/death/cured
  const getProvData = (name, type) => {

    if(name === 'Canada') {
      if(type !== 'new') {
        return dayCases && dayCases.map( 
          dayProvCases => dayProvCases.reduce((total, curProv) => {
            return total = parseInt(total) + parseInt(curProv[type] || 0); 
        }, [0]));     
      } else {
        let dailyTotalCases = dayCases.map( 
          dayProvCases => dayProvCases.reduce((total, curProv) => {
            return total = parseInt(total) + parseInt(curProv.value || 0); 
        }, [0]));
        return dailyTotalCases.map((number, index) => {
          return (index === 0) ? number : number - dailyTotalCases[index - 1];
        });
      }
    } else {      
      let data = dayCases && dayCases.map(          
        dayProvCases => { 
          let p = dayProvCases.find( (prov) => prov.name === name);
          if(p) return p[type === 'new' ? 'value' : type];
          return 0;
        }
      );

      if(type !== 'new') return data;
      return data.map((number, index) => {
        return (index === 0) ? number : number - data[index - 1];
      });      
    }
  };

  const getOption = () => {
    return {
      title: {
          x: 'center',
          text: 'Cumulative Cases by day in ' + prov,
      },
      tooltip: { 
        trigger: 'axis',
      },
      legend: {
          // data: ['Confirmed', 'Suspected', 'Increased', 'Recovered', 'Deaths'], // four curves
          data: ['Confirmed', 'Recovered', 'Deaths', 'New Cases'], // 3 line curves, 1 bar chart
          top : '30px',
          textStyle: {fontSize: 12, fontWeight: 600},
      },
      grid: { left: 'center', right: 'center', bottom: '3%', containLabel: true, width: '92%' },
      toolbox: { feature: { saveAsImage: {} } },
      xAxis: {
          type: 'category',
          boundaryGap: false,
          data: days
      },
      yAxis: [
        { type: 'value' },  // line charts
        { type: 'value', splitLine: { show: false, }, },  // bar chart
      ],
      series: [
          {
              name: 'Confirmed',
              type: 'line',
              // stack: 'Toll',
              data: getProvData(prov, 'value')  //confirmed cases
          },
          {
            name: 'New Cases',
            type: 'bar',        
            yAxisIndex: 1,
            itemStyle: { color: '#ffc0b1', }, // change default bar color
            data: getProvData(prov, 'new')  //new cases
          },
          {
            name: 'Recovered',
            type: 'line',
            // stack: 'Toll',
            data: getProvData(prov, 'cured')
          },
          {
            name: 'Deaths',
            type: 'line',
            // stack: 'Toll',
            data: getProvData(prov, 'death')
          },
      ]
    };
  }

  return (
    (days && dayCases) ? (
      <ReactEcharts 
        style={{height: "35vh"}}
        echarts={echarts}
        option={getOption()}
        loadingOption={getLoadingOption()}
        onChartReady={onChartReady}
        showLoading={!loaded}  //official showloading always have bugs 
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
  const [screenMode, setScreen] = useState('PORTRAIT');

  let classes = useStyles();

  const handleSwitch = () => {
    if(viewMode === 'map') {
      setMode('table');
      setProv('Canada');
    } else 
      setMode('map');    
  }

  useEffect(() => {

    let isCanceled = false;
    try {
      axios.get(`./assets/CanadaCasesDb.json`).then( ({data}) => {

        if(!isCanceled) {

          let dayCases = data.cases.map(day => day.cases); // cases for all provinces by day          
          let hisDataObj = {
              dates: data.cases.map(day => day.date),  // xAxis: dates array
              cases: dayCases,  // YAxis 0 (confirmed/cured/deaths)
          };
          setCases(hisDataObj);  // for charts

          let canada = data.details.pop();
          let allProvData = _.sortBy(data.details, (o) => parseInt(o["Conf."])).reverse();
          allProvData.push(canada);
          setDetail(allProvData);  // for table's rows
        }
      });
    } catch (error) {
      console.log(`'Error in get today's case details:`, error)
    }
    return () => {isCanceled = true;}
  }, [viewMode]);

  useEffect(() => {
    window.addEventListener("orientationchange", () => {
      if (window.orientation === 90 || window.orientation === -90) {
        setScreen('LANDSCAPE');        
      } else if (window.orientation === 0 || window.orientation === 180) {
        setScreen('PORTRAIT');
      }
    });
  });

  let switchStyle = { };  
  let tableStyle = { display: 'flex', position: 'absolute', top: '6.6rem', left: '2rem', zIndex: 9999, };
  if(screenMode === 'LANDSCAPE') {
    if(document.body.clientWidth >= 1024) 
      switchStyle = { display: 'flex', position: 'absolute', top: '6.6rem', marginLeft: '44vw', zIndex: 9999, };
    else 
      switchStyle = { display: 'flex', position: 'absolute', top: '8.0rem', marginLeft: '4vw', zIndex: 9999, };
  } else {
    if(document.body.clientWidth >= 1024) 
      switchStyle = { display: 'flex', position: 'absolute', top: '6.6rem', marginLeft: '44vw', zIndex: 9999, };
    else
      switchStyle = { display: 'flex', position: 'absolute', top: '8.0rem', marginLeft: '4vw', zIndex: 9999, };
  }

  const [prov, setProv] = useState('Canada');
  
  // get province abbreviation when table row clicked
  const handleRowClick = (event, rowData) => {
    if (event.target) {
      // console.log(event.target, rowData);
      if(rowData.Abbr !== 'Repatriated') setProv(rowData.Province);
    }
  }

  switch(viewMode) {
    case 'map': 
      return (
        <>
          <Button variant="outlined" size="small" color="primary" className={classes.switch} 
                  style={switchStyle}
                  onClick={handleSwitch} > View Table
          </Button>
          <MapCanada hisCases={hisCases} />
        </>);

    case 'table':
      return (
        <div>        
          <Button variant="outlined" size="small" color="primary" className={classes.switch}
                  style={switchStyle}
                  onClick={handleSwitch} > View Map
          </Button>
          <div style={{margin:'0 1rem 1rem 1rem'}}> 
            <TableTitle style={{display: 'flex'}}/>
            <ProvincesTable style={{width: '90%'}} data={provDetails} onRowClick = {handleRowClick} />
          </div>
          {/* <div className={classes.chart} style={{display: 'flex'}}> */}
            <CasesHisTrend 
              prov={prov}
              days={hisCases.dates} 
              dayCases={hisCases.cases}  // confirmed/cured/deaths
            />
          {/* </div> */}
        </div>
      );
    default: return (<></>);
  }
}