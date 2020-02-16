
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import '../styles/AppBar.css'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));


export default function ButtonAppBar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <ul>
              <li className="area">China</li> 
              <li className="area">Canada</li>
              <li className="area">Global</li>            
              <li className="area">News</li>            
          </ul>
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
    </div>
  );
}