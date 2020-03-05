import React, {useState, useEffect} from 'react';
// import { makeStyles } from '@material-ui/core/styles';

import cheerio from 'cheerio';
import wiki from 'wikijs';

import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import EventNoteIcon from '@material-ui/icons/EventNote';
import '../styles/App.css'

// const isNarrowScreen = () => {
//   let mediaQuery = window.matchMedia("(orientation: portrait)");
//   console.log(mediaQuery);
//   if(mediaQuery.matches) return true;  
//   if(document.body.clientWidth < 1024) return true;
//   return false;
// };

// const useStyles = makeStyles(theme => ({
//   timelineBox: {
//     backGround: '#3F51B5',
//     position: 'absolute',
//     top: isNarrowScreen() ? '62%' : '12%',
//     bottom: '5%',
//     left: isNarrowScreen() ? '0%' : '50%',
//     display: 'flex',
//     flexDirection: 'column'
//   },
//   scrollable: {
//     backGround: 'white',
//     flexGrow: 1,
//     overflow: 'auto',
//     minHeight: 0
//   }
// }));

export default function Timeline() {

  // const classes = useStyles();
  const [cases, setCases] = useState([]);

  useEffect(() => {

    let casesTimeline = [];
    async function getCasesTimeline () {
      let data = await wiki().page('2020_coronavirus_outbreak_in_Canada').then(page => page.html());
      const $ = cheerio.load(data);

      $('p', 'div').each( (index, ele) => {
        // console.log($(ele).text());
        if(index > 0) {
          let message = $(ele).text().replace(/\[\d{1,2}\]/g,'');
          let date = message.match(/^On [A-Z][a-z]{2,10} \d{1,2}/g);
          let content = message.replace(/^On [A-Z][a-z]{2,10} \d{1,2},/g, '').trim();
          if(date) {
            date = date[0].slice(3) + ', 2020';
            content = content.charAt(0).toUpperCase() + content.substring(1);
            if(content.search('Shopify') > -1) return '';
            if(content.search('TED') > -1) return '';
            casesTimeline.push({date, content});
          }
        }        
      });

      if(casesTimeline.length) {
        setCases(casesTimeline.reverse());
      }
    }

    getCasesTimeline();  // get all the cases reported

  }, []);

  return (

    <div className="timelineBox">
        <div className="scrollable">
        <VerticalTimeline layout={'1-column'}>          
          { cases.map( item => (
              <VerticalTimelineElement
                key={item.date}
                className="vertical-timeline-element--work"
                contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
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
   )
}