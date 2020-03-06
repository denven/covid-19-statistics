import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import EventNoteIcon from '@material-ui/icons/EventNote';
import '../styles/App.css'

const useStyles = makeStyles(theme => ({
  margin: {
    margin: '0 0 1.5em 0'
  },
  padding:{
    paddingTop: 0
  },
}));

function Title () {
  return (
    <div className="timelineTitle">
      <div>Timeline of reported covid-19 cases in Canada</div>
      <div className="subTitle" >Data from https://en.wikipedia.org/wiki/2020_coronavirus_outbreak_in_Canada</div>
    </div>
  )
}
export default function Timeline() {

  const classes = useStyles();
  const [cases, setCases] = useState([]);

  useEffect(() => {    
    import('../assets/Timeline.json').then( ({cases}) => {
        if(Array.isArray(cases)){
          setCases(cases);
        }
    });

  }, []);

  return (
    <>
      <Title />
      <div className="timelineBox">
        <div className="scrollable">
        <VerticalTimeline layout={'1-column'} className={classes.padding}>          
          { cases.map( item => (
              <VerticalTimelineElement
                key={item.date}  // add key to remove complains
                // className="vertical-timeline-element--work"
                className={classes.margin}
                contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff'}}
                contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
                // date={item.date}
                iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                icon={<EventNoteIcon />}
              >
                <h4 className="vertical-timeline-element-subtitle">{item.date}</h4>
                <p> {item.content} </p>
              </VerticalTimelineElement>        
          ))}
        </VerticalTimeline>
        </div>
      </div>
    </>
   )
}