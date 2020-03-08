import React from 'react';
import { Link, Route, Switch} from 'react-router-dom';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import GitHubIcon from '@material-ui/icons/GitHub';

import '../styles/AppBar.css'
import AppLogo from './AppLogo';
import OverallData from './Overall';

import MapGlobal from './MapGlobal';
import TableGlobal from './TableGlobal';

import MapChina from './MapChina';
import CasesTrend from './LineChart';

import MapCanada from './MapCanada';
import Timeline from './Timeline';

import MapUSA from './MapUsa';

import LatestNews from './News';

import useAppData from '../hooks/useAppData';

const useStyles = makeStyles(theme => ({
  root: { flexGrow: 1, },
  menuButton: { marginRight: theme.spacing(2), },
  title: { flexGrow: 1, },
  link: { color: '#FFF', textDecoration: 'none' }
}));

function China({overall, chinaMap}) {
  return (
    <div className="bodyContainer">
      <div className="bodyTop">     
        <OverallData showGlobal={false} place={'China'} overall={overall}/>
      </div>
      <div className="bodyBottom">
        <div className="bodyLeft"> <MapChina chinaMap={chinaMap}/> </div>
        <div className="bodyRight"> <CasesTrend country={'China'}/> </div>
      </div>
    </div>
  );
}       

function Canada({overall}) {
  return (
    <div className="bodyContainer">
      <div className="bodyTop">     
        <OverallData showGlobal={false} place={'Canada'} overall={overall}/>
      </div>
      <div className="bodyBottom">
        <div className="bodyLeft"> <MapCanada/> </div>
        <div className="bodyRight"> <Timeline/> </div>
      </div>
    </div>
  );
}


function USA() {

  return (
    <div className="bodyContainer">
      <div className="bodyTop">     
        <OverallData showGlobal={false} place={'USA'} overall={{}}/>
      </div>
      <div className="bodyBottom">
        <div className="bodyGlobalMap"> 
          <MapUSA/> 
          <CasesTrend country={'USA'}/> 
        </div>
        <div className="bodyGlobalTable"> <TableGlobal place={'USA'} rows={ [] } /></div>
      </div>
    </div>
  );
}

// global data is also for homepage
function Global({loaded, overall, globalMap, tableData}) {

  return (  
    <div className="bodyContainer">
      <div className="bodyTop">     
        <OverallData showGlobal={true} place={'Global'} overall={overall}/>
      </div>
      <div className="bodyBottom">   
      <div className="bodyGlobalMap">
        <MapGlobal mapData={globalMap} loaded={loaded}/>
      </div>    
      <div className="bodyGlobalTable">
        { 
          !loaded ? (
            <>
              <TableGlobal rows={tableData} />
              <div className="dataLoading"> 
                <Loader type="TailSpin" color="#C23531" height={25} width={25} /> 
                <span style={{fontSize: 12, fontWeight: 600}}>&nbsp; Data Loading ...</span>
              </div>
            </>
          ) : ( <TableGlobal rows={tableData} /> )
        }
      </div>
      </div>
    </div>
  )
}  

function News({overall}) {
  return (
    <div className="bodyContainer">
      <div className="bodyTop">     
        <OverallData showGlobal={false} place={'Other'} overall={overall}/>
      </div>
      <div className="bodyBottom">
        <LatestNews />
      </div>
    </div>
  )
}       

function Navigator() {
  const classes = useStyles();
  return (
    <>
      <Link to="/"  className={classes.link}><AppLogo/> </Link>
      <div className="menu">
        <ul>
          <li><Link to="/" className={classes.link}>Global</Link></li> 
          <li><Link to="/usa" className={classes.link}>USA</Link></li>
          <li><Link to="/canada" className={classes.link}>Canada</Link></li>
          <li><Link to="/china" className={classes.link}>China</Link></li>            
          <li><Link to="/news" className={classes.link}>News</Link></li>            
        </ul>   
      </div>
    </>
  );
}

export default function TopAppBar() {

  const classes = useStyles();
  const { 
    loaded, 
    globalOverall, 
    chinaOverall, 
    canadaOverall, 
    otherOverall, 
    chinaMap, 
    globalMap, 
    tableData
  } = useAppData();

  return (
    <div className={classes.root}>
      <AppBar position="static" >
        <Toolbar variant="dense">          
          <Navigator />
          <Typography variant="h6" className={classes.title}>
            {/* News */}
          </Typography>
          <Button color="inherit" align="center"
            target="_blank" href="https://github.com/denven/covid-19-statistics">
            <GitHubIcon />
          </Button>
        </Toolbar>
      </AppBar>
      {/* Router Configuration */}
      <Switch>
          <Route 
            exact path="/"
            component={() => <Global loaded={loaded} globalMap={globalMap} tableData={tableData} overall={globalOverall}/>}
          />
          <Route 
            path="/china" 
            component={() => <China loaded={loaded} overall={chinaOverall} chinaMap={chinaMap} />}
          />
          <Route 
            path="/canada" 
            component={() => <Canada loaded={loaded} overall={canadaOverall} />}
          />
          <Route path="/usa" component={() => <USA />} />
          <Route 
            path="/news" 
            component={() => <News loaded={loaded} overall={otherOverall} />}
          />
      </Switch>
    </div>
  );
}