import React from 'react';
import { Link, Route, Switch} from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import '../styles/AppBar.css'

import MapChina from './MapChina';
// import MapGlobal from './MapGlobal';

import OverallData from './Overall';
import ChinaTrend  from './LineChart';

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
        <OverallData />
      </div>
      <div className="bodyBottom">
        <div className="bodyLeft"> <MapChina/> </div>
        <div className="bodyRight"> <ChinaTrend/> </div>
      </div>
    </div>
  )
}       

function Navigator() {
  const classes = useStyles();
  return (
    <ul>
      <li><Link to="/" className={classes.link}>China</Link></li> 
      <li><Link to="/canada" className={classes.link}>Canada</Link></li>
      <li><Link to="/global" className={classes.link}>Global</Link></li>            
      <li><Link to="/news" className={classes.link}>News</Link></li>            
    </ul>   
  );
}

export default function TopAppBar() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Navigator />
          <Typography variant="h6" className={classes.title}>
            {/* News */}
          </Typography>
          <Button color="inherit">
            <a href="https://github.com/denven/Smart-Retailer">
              <img src="https://echarts.apache.org/en/images/github.png" alt="github" width="26"/>
            </a>         
          </Button>

        </Toolbar>
      </AppBar>
      {/* Router Configuration */}
      <Switch>
          <Route exact path="/" component={Home}></Route>
          {/* <Route path="/canada" component={Classes}></Route>
          <Route path="/global" component={Mine}></Route>
          <Route path="/news" component={Notfound}></Route> */}
      </Switch>
    </div>
  );
}