import React from 'react';
import { Link, Route, Switch} from 'react-router-dom';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
// import Typography from '@material-ui/core/Typography';
// import Button from '@material-ui/core/Button';
// import GitHubIcon from '@material-ui/icons/GitHub';

import '../styles/AppBar.css'
import AppLogo from './AppLogo';
import OverallData from './Overall';

import MapGlobal from './MapGlobal';
import Table from './Table';

import MapChina from './MapChina';
import CasesTrend from './LineChart';

import CanadaView from './Canada';
// import MapCanada from './MapCanada';
import Timeline from './Timeline';

import MapUSA from './MapUsa';

import LatestNews from './News';

import useAppData from '../hooks/useAppData';

const useStyles = makeStyles(theme => ({
  root: { flexGrow: 1, },
  menuButton: { marginRight: theme.spacing(2), },
  title: { flexGrow: 1, justifyContent: 'flex-end'},
  link: { color: '#FFF', textDecoration: 'none' },
}));


const isWideScreen = () => {
  // console.log('screen change')
let mediaQuery = window.matchMedia("(orientation: portrait)");
if(mediaQuery.matches) { return false };
if(document.body.clientWidth < 1024) { return false; }
return true;
}


function Kofi() {
  const classes = useStyles();
  return (
    <div className={classes.title}>
      <a href='https://ko-fi.com/T6T01JT0I' target='_blank' rel="noopener noreferrer" >
        { isWideScreen() ? 
          <img align="right" style={{border: '0px', height:'36px', width: '140px' }} 
          src='https://az743702.vo.msecnd.net/cdn/kofi1.png?v=2' 
          border='0' alt='Buy Me a Coffee at ko-fi.com' />
        :
        <img align="right" style={{border: '0px', height:'36px', width: '36px'}} title='By me a coffee'
          src='https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/5ca5bf1dff3c03fbf7cc9b3c_Kofi_logo_RGB_rounded-p-500.png' 
          border='0' alt='Buy Me a Coffee at ko-fi.com' />
        }
        </a>
    </div>
  );
}

function China({loaded, overall, chinaMap}) {
  return (
    <div className="bodyContainer">
      <div className="bodyTop">     
        <OverallData showGlobal={false} place={'China'} overall={overall}/>
      </div>
      <div className="bodyBottom">
        <div className="bodyLeft"> <MapChina chinaMap={chinaMap} loaded={loaded}/> </div>
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
        <div className="bodyLeft"> <CanadaView/> </div>
        <div className="bodyRight"> <Timeline/> </div>
      </div>
    </div>
  );
}


function USA({loaded}) {

  return (
    <div className="bodyContainer">
      <div className="bodyTop">     
        <OverallData showGlobal={false} place={'USA'} overall={{}}/>
      </div>
      <div className="bodyBottom">
        <div className="bodyGlobalMap"> 
          <MapUSA loaded={loaded}/> 
          <CasesTrend country={'USA'}/> 
        </div>
        <div className="bodyGlobalTable"> <Table place={'USA'} rows={ [] } /> </div>
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
              <Table rows={tableData} />
              <div className="dataLoading"> 
                <Loader type="TailSpin" color="#C23531" height={25} width={25} /> 
                <span style={{fontSize: 12, fontWeight: 600}}>&nbsp; Data Loading ...</span>
              </div>
            </>
          ) : ( <Table rows={tableData} /> )
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
          <li><Link to="/canada" className={classes.link}>Canada</Link></li>
          <li><Link to="/usa" className={classes.link}>USA</Link></li>
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
        <Toolbar variant="dense" >   
          <Navigator />        
          {/* <Button className={classes.title} color="inherit" align="right" target="_blank" href="https://github.com/denven/covid-19-statistics">
            <GitHubIcon />            
          </Button> */}
          <Kofi />
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
          <Route path="/usa" component={() => <USA loaded={loaded} />} />
          <Route 
            path="/news" 
            component={() => <News loaded={loaded} overall={otherOverall} />}
          />
      </Switch>
    </div>
  );
}