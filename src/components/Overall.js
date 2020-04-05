import React, {useState, useEffect, useCallback} from 'react';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import '../styles/Overall.css';
// import moment from 'moment';
import axios from 'axios';
import moment from 'moment';

// The moment-timezone.js can be used to convert local time(the code runs on which device located at) 
// to another timezone, but it doesn't convert a time from one(not local) timezone to another wanted timezone
// As we need to convert a absolute America/Vancouver time string to another local time
// we will use `new Date().getTimezoneOffset()` and moment.diff() moment.add() to fullfil this time conversion
// import momentTz from 'moment-timezone'; 

import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography style={{fontWeight: '600'}}>{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

function ModaldDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <InfoIcon variant="outlined" color="primary" fontSize='small' onClick={handleClickOpen}/>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Description for Increased/New Cases
        </DialogTitle>
        <DialogContent dividers>
          <ul>
            <li>Number of Global and USA cases will be reset at GMT+0. </li>
            <li>Number of Canada cases will be reset at GMT-7(Vancouver time 0:00). </li>
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function OverallData ({place, overall}) {  
  
  const [data, setData] = useState({time: '', confirmed: '', increased: '', cured: '', death: '', fatality: '' });
  const [time, setTime] = useState(data.time);

  let placeString = 'Global Cases';

  if(place === 'Other') { 
    placeString = 'Outside China';
  } else {
    placeString = place + ' Cases';
  }
   
  const isWideScreen = () => {
    
    let mediaQuery = window.matchMedia("(orientation: portrait)");
    // console.log('sss', mediaQuery);
    if(mediaQuery.matches) { return false };

    if(document.body.clientWidth < 1024) { return false; }

    return true;
  }

  const getLocalTime = (time) => {
    // let localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;   
    // vancouver is 420 miniutes behind of GMT, getTimezoneOffset() returns +420, eg, for Shanghai, GMT+8 retunrs -480
    let minutesDiff = 420 - new Date().getTimezoneOffset();
    return moment(time).add(minutesDiff, 'minutes').format("YYYY-MM-DD HH:mm:ss");
  }
  
  const handleResize = useCallback(() => {        

    if(isWideScreen()) {
      if (time.length < 15) {          
        setTime(data.time);
      }
      return;
    } 

    setTime(data.time.slice(11, 16));

  },[data.time, time.length]);

  const valueFormat = (value) => {
    return (value || '0').toString().replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
  }

  useEffect(() => {
    const source = axios.CancelToken.source();
    let isCancelled = false;
    if(place === 'USA') {
      axios.get(`./assets/UsaStatesCases.json`).then( ({data}) => {
        if(data.overall && !isCancelled) {
            setData ({...data.overall, time: getLocalTime(data.date), increased: data.overall.increased.replace(/\+/g, '')});
            handleResize();
        }   
      });
    } else if(place === 'Canada') {
      axios.get(`./assets/CanadaCasesDb.json`).then( ({data}) => {
        if(!isCancelled) {
          setData ({
            time: getLocalTime(data.date),
            confirmed: data.overall.confirmed, 
            increased: data.overall.increased, 
            cured: data.overall.recovered, 
            death: data.overall.death, 
            fatality: (100 * data.overall.death.replace(/,/,'') / data.overall.confirmed).toFixed(2) + '%'
          });
          handleResize();
        }
        
      });
    } else if(overall)  {
      axios.get(`./assets/GlobalCasesToday.json`).then( ({data}) => {
        let chinaIncreased = data.countries.find( c => c.name === 'China').increased;
        let chinaConfirmed = data.countries.find( c => c.name === 'China').total;
        let localTime = getLocalTime(data.time);
        if(place === 'Global') {
          if(!isCancelled) {
            setData({...overall, time: localTime, increased: data.overall.increased.replace(/\+/g, ''), confirmed: data.overall.total});  
          }
        } else if(place === 'China') {
          if(!isCancelled) {
            setData({...overall, time: localTime, increased: chinaIncreased.replace(/\+/g, '')});  
          }
        } else {
          if(!isCancelled) {
            setData({...overall, time: localTime, 
              increased: parseInt(data.overall.increased.replace(/,/g, '')) - parseInt(chinaIncreased.replace(/[,+]/g, '')), 
              confirmed: parseInt(data.overall.total.replace(/,/g, '')) -  parseInt(chinaConfirmed.replace(/,/g, ''))}); 
          }
        }
        if(!isCancelled) handleResize();
      });
    }
  
    return () => { source.cancel(); isCancelled = true; };

  }, [handleResize, overall, place]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  }, [handleResize]);

  const newCaseStyle={
    display: 'flex', 
    flexDirection: 'row', 
    width: '4.5rem', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  }

  return (
    <>
      <div className="eachText">As of <span className="dataTime">&nbsp; {time}</span></div>
      <div className="eachText">{placeString}</div>     
      <div className="eachText">Confirmed <span className="confirmedNumber">&nbsp; &nbsp; {valueFormat(data.confirmed)}</span></div>
      <div className="eachText" style={{display: 'flex', flexWrap: 'wrap', alignContent: 'center'}}>Increased&nbsp; &nbsp;
        <span className="increasedNumber" style={newCaseStyle}>
          {valueFormat(data.increased)} <ModaldDialog />
        </span>         
      </div>
      <div className="eachText">Recovered <span className="curedNumber">&nbsp; &nbsp; {valueFormat(data.cured)}</span></div>
      <div className="eachText">Deaths <span className="deathNumber">&nbsp; {valueFormat(data.death)}</span></div>
      <div className="eachText">Lethality <span className="fatalityNumber">&nbsp; {data.fatality}</span></div>
    </>
  );
}