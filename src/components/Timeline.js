import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import EventNoteIcon from '@material-ui/icons/EventNote';
import '../styles/App.css'
import axios from 'axios';


const useStyles = makeStyles(theme => ({
  margin: {
    margin: '0 0 1.5em 0'
  },
  padding:{
    paddingTop: 0,
    maxWidth: '2800px'
  },
}));

function Title () {
  return (
    <div className="timelineTitle">
      <div>Timeline of reported cases and gov anouncements in Canada</div>
      <div className="subTitle" >Data from https://en.wikipedia.org/wiki/2020_coronavirus_outbreak_in_Canada</div>
    </div>
  )
}

function Timeline ({cases}) {

  const classes = useStyles();

  return (
    <div className="timelineBox">
      <div className="scrollable">
        <VerticalTimeline layout={'1-column'} className={classes.padding} animate={true}>          
          { cases.map( (item,index) => (
              <VerticalTimelineElement
                key={index}  // add key to remove complains
                // className="vertical-timeline-element--work"
                className={classes.margin}
                contentStyle={{ background: 'white', color: 'black', paddingTop: '0', bottom: '0'}}
                contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
                // date={item.date}
                iconStyle={{ background: 'gray', color: '#fff' }}
                icon={<EventNoteIcon />}
              >
                <h4 className="vertical-timeline-element-subtitle">{item.date}</h4>
                <p> {item.content} </p>
              </VerticalTimelineElement>        
          ))}
        </VerticalTimeline>
      </div>
    </div>
  )
}
export default function MyTimeline() {

  const [cases, setCases] = useState([]);

  useEffect(() => {    
    axios.get(`./assets/CanadaTimeline.json`).then( ({data}) => {
        if(Array.isArray(data.cases)){
          setCases(data.cases);
        }
    });

  }, []);

  return (
    <div className="timelineContainer">
      <Title />
      <Timeline cases={cases}/>
    </div>
   )
}