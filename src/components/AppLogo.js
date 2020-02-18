import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: { flexGrow: 1, },
  menuButton: { marginRight: theme.spacing(2), },
  title: { flexGrow: 1, },
  link: { color: '#FFF', textDecoration: 'none' }
}));

export default function AppLogo() {
  const classes = useStyles();

  return (
    <>
      <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
        <img src="https://github.com/denven/covid-19-statistics/blob/master/public/logo.jpg?raw=true"
        style={{borderRadius: "50%", width: "26px"}}
        />
        <span style={{fontWeight: '600', fontSize: "1.2rem", marginLeft: 10}}>COVID-19 Stat</span>
      </IconButton>
      
    </>
  )
}
