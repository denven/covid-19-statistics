import React, { useState, useEffect } from 'react';
import { Link, Route, Switch} from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import GitHubIcon from '@material-ui/icons/GitHub';

import '../styles/AppBar.css'
import AppLogo from './AppLogo';
import MapChina from './MapChina';
import MapGlobal from './MapGlobal';
import OverallData from './Overall';
import ChinaTrend from './LineChart';
import TableGlobal from './TableGlobal';
import { fontWeight } from '@material-ui/system';

const useStyles = makeStyles(theme => ({
  root: { flexGrow: 1, },
  menuButton: { marginRight: theme.spacing(2), },
  title: { flexGrow: 1, },
  link: { color: '#FFF', textDecoration: 'none' }
}));

function Home() {
  return (
    <div className="bodyContainer">
      <div className="bodyTop">     
        <OverallData showGlobal={false}/>
      </div>
      <div className="bodyBottom">
        <div className="bodyLeft"> <MapChina/> </div>
        <div className="bodyRight"> <ChinaTrend/> </div>
      </div>
    </div>
  )
}       

function Global() {

  return (
    <div className="bodyContainer">
      <div className="bodyTop">     
        <OverallData showGlobal={true}/>
      </div>
      <div className="bodyBottom">   
      <div className="bodyGlobalMap">
        <MapGlobal />
      </div>    
      <div className="bodyGlobalTable">
        <TableGlobal />
      </div>
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
          <li><Link to="/" className={classes.link}>China</Link></li> 
          <li><Link to="/canada" className={classes.link}>Canada</Link></li>
          <li><Link to="/global" className={classes.link}>Global</Link></li>            
          <li><Link to="/news" className={classes.link}>News</Link></li>            
        </ul>   
      </div>
    </>
  );
}

export default function TopAppBar() {
  const classes = useStyles();
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
          <Route exact path="/" component={Home}></Route>
          {/* <Route path="/canada" component={Canada}></Route> */}
          <Route path="/global" component={Global}></Route>
          {/* <Route path="/news" component={News}></Route> */}
      </Switch>
    </div>
  );
}