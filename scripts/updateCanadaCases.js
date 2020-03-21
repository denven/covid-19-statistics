const fs = require('fs');
const cheerio = require('cheerio');
// const wiki = require('wikijs').default;
const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const DEBUG_MODE_ON = false;
// const DEBUG_MODE_ON = true;


const provinces = [
  { fullname: "Ontario", abbr: 'ON'},
  { fullname: "British Columbia", abbr: 'BC'},
  { fullname: "Quebec", abbr: 'QC'},
  { fullname: "Alberta", abbr: 'AB'},
  { fullname: "Manitoba", abbr: 'MB'},
  { fullname: "Saskatchewan", abbr: 'SK'},
  { fullname: "Newfoundland and Labrador", abbr: 'NL'},
  { fullname: "Prince Edward Island", abbr: 'PE'},
  { fullname: "Nova Scotia", abbr: 'NS'},
  { fullname: "New Brunswick", abbr: 'NB'},
  { fullname: "Yukon", abbr: 'YK'},
  { fullname: "Northwest Territories", abbr: 'NT'},
  { fullname: "Nunavut", abbr: 'NU'}
];

// get cases timeline announced by the gov
async function getCasesTimeline () {

  let casesTimeline = [];

  // let data = await wiki().page('2020_coronavirus_outbreak_in_Canada').then(page => page.html());
  let url = "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Canada";
  let res = await axios.get(url);

  if(res.status === 200) {
    const $ = cheerio.load(res.data);
          
    $('p', 'div').each( (index, ele) => {
      if(index > 0) {
        let message = $(ele).text().replace(/\[\d{1,3}\]/g,''); //remove [no] refereneces
        let date = message.match(/^On [A-Z][a-z]{2,10} \d{1,2}/g);
        let content = message.replace(/^On [A-Z][a-z]{2,10} \d{1,2},/g, '').trim();
        if(date) {
          date = (date[0].slice(3) + ', 2020').replace(/ ([\d],)/g, ' 0$1');
          content = content.charAt(0).toUpperCase() + content.substring(1);
          if(content.search('Shopify') > -1) return '';
          if(content.search('TED') > -1) return '';
          if(content.search('Collision') > -1) return '';
          casesTimeline.push({date, content});
        }
      }        
    });

    let tmp = _.orderBy(casesTimeline, ['date', 'desc']);
    let tmpCases = [];

    const getOneMonthReports = (reports, month) => {   
      let tmp = []; 
      reports.forEach(item => {
        if(item.date.includes(month))
          tmp.push(item);
      });
      return tmp;
    }

    tmpCases = [ 
      ...getOneMonthReports(tmp, 'January'), 
      ...getOneMonthReports(tmp, 'February'),
      ...getOneMonthReports(tmp, 'March'),
      ...getOneMonthReports(tmp, 'April'),
      ...getOneMonthReports(tmp, 'May')
    ];

    $('p', 'div').each( (index, ele) => {

      if(index < 5 && $(ele).text()) {   
        let message = $(ele).text().replace(/\[[a-z]{0,10}\d{0,2}\]/g,'');
        let date = message.match(/As of [A-Z][a-z]{2,10}.*, 2020/g);
        let content = message.replace(/(.*)As of [A-Z][a-z]{2,10}.*, 2020, /g, '').trim();
        if(date) {
          date = date[0];
          content = content.charAt(0).toUpperCase() + content.substring(1);
          tmpCases.push({date, content});
        }
      }
    });

    if(tmpCases.length > 0) {
      let jsonData = {
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        cases: tmpCases.reverse()
      }
      const timelineString = JSON.stringify(jsonData, null, 4);
      // console.log(timelineString);
      fs.writeFile("../public/assets/CanadaTimeline.json", timelineString, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated Canada timeline data at ${jsonData.time}`);
      });
    }
  } else {
    console.log('Failed to get Canada cases from wiki page:', res.status);
  }
}

//From wikipedia history table
const getTodaysCases = (elements, $, allDaysCases) => {

  let casesAsOfToday = [];
  let presumptiveCases = [];

  try {  
    let provAbbrs = [];
    elements.each( (index, item) => {
      // get the abbreviations of provinces
      if(index === 1) {  // wikipedia changed table format Mar 19, 2020
        provAbbrs = $(item).text().trim().replace(/\n{1,5}/g, ',').replace(/\[.*\]/g,'').replace(/,,/g,',0,').split(',');
        // console.log(provAbbrs);
      }

      if(index > 1) {
        // console.log($(item).text().trim().replace(/\n{1,5}/g, ',').replace(/\[.*\]/g,'').replace(/,,/g,',0,'))
        let tabRow = $(item).text().trim().replace(/\n{1,5}/g, ',').replace(/\[.*\]/g,'').replace(/,,/g,',0,');
        // Total confirmed row
        if(tabRow.includes('Confirmed')) {

          //Order: BC:0,	AB:1,	ON:2, NB,3	QC:4, SK:5, MB:6  total provinces: 5 :as of 2020-03-12
          let provCases = tabRow.replace(/[,]{0,1}[a-zA-Z][,]{0,1}/g,'').split(','); 
          let lastDay = allDaysCases[allDaysCases.length - 1];
          let totalHisCases = lastDay.cases.reduce((total, curProv) => {
            return total = parseInt(total) + parseInt(curProv.value || 0); 
          },[0]);

          //there are new increased cases(5 provinces as of 2020-03-20), provCases[5] is total number
          let tollNumberIdx = provCases.length - 1; // confirm this value by checking the html table row
          // console.log(totalHisCases, provCases[tollNumberIdx], provCases.length);
          if(totalHisCases !== provCases[tollNumberIdx]) { 
            casesAsOfToday = provinces.map( (prov, index) => {
              let provIdx = provAbbrs.indexOf(prov.abbr);
              let value = provIdx >= 0 ? provCases[provIdx].trim() : '';
              return {
                "name": prov.fullname, // the map need the full name
                "value": value > 0 ? value : ''
              }
            });
          }
        } 
        // Presumptive Cases row Mar 15, 2020 Added
        else if (tabRow.includes('Presumptive')) {
          let temp = $(item).text().trim().replace(/\n[^\d]/g, ',0').replace(/0([\d]{1,3})/g,'$1');
          presumptiveCases = temp.replace(/[,]{0,1}[a-zA-Z][,]{0,1}/g, '').trim().split(',');

          if(presumptiveCases.length > 0) {
            provinces.forEach( (prov, index) => {
              let provIdx = provAbbrs.indexOf(prov.abbr);
              casesAsOfToday[index].suspect = (presumptiveCases[provIdx] > 0) ? presumptiveCases[provIdx] : '';
            });
          }
        }
      }
    });
  } catch (error) {
    console.log('Error when fetching Canada Latest Cases:', error);
  }
  return casesAsOfToday;
}

const getProvDetails = (elements, $) => {
  let allProvDetails = [];
  try {
    let tabKeys = [];
    elements.each( (index, item) => {
      // get the abbreviations of provinces
      if(index === 1) {
        tabKeys = $(item).text().trim().split('\n');
      }

      if(index > 1) {
        let provDetail = {};
        $(item).text().trim().split('\n').forEach( (value, idx) => { 
          // console.log('\n', tabKeys[idx], value);
          provDetail[tabKeys[idx]] = value.replace(/,/, '') || 0;
        });
        // console.log('prov', provDetail);  
        allProvDetails.push(provDetail);
      }
    });
  } catch(error) { 
    console.log(error);
  };

  return allProvDetails;
}

const getCanadaOverall = (canada, oldOverall, casesAsOfToday, allDaysCases) => {

  // PART 3: GET/Calculate overall cases today
  let newOverall = {...oldOverall};

  try {  
    let yesterdayCases = allDaysCases[allDaysCases.length - 2];
    let yesterdayTotal = yesterdayCases.cases.reduce((total, curProv) => {
      return total = parseInt(total) + parseInt(curProv.value || 0) + parseInt(curProv.suspect || 0); 
    },[0]);

    let todayTotal = casesAsOfToday.reduce((total, curProv) => {
      return total = parseInt(total) + parseInt(curProv.value || 0) + parseInt(curProv.suspect || 0); 
    },[0]);

    newOverall = {
      confirmed: canada["Conf."],
      recovered: canada["Recov."],
      death: canada["Deaths"],
      increased: todayTotal - yesterdayTotal
    }
  } catch(error) {
    console.log('Failed to get Canada overall cases: ', error);
  }
     
  return newOverall;
}
// get cases timeline announced by the gov
async function updateHistoryCases () {

  let oldData = fs.readFileSync(`../public/assets/CanadaCasesDb.json`);
  let allDaysCases = JSON.parse(oldData).cases;
  let oldOverall = JSON.parse(oldData).overall;
  
  let url = "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Canada";
  let res = await axios.get(url);

  if(res.status === 200) {
    const $ = cheerio.load(res.data);

    // PART 1: GET provinces cases today
    // let elements = $('tr', '.wikitable');  //get table rows
    let $tables  = $('.wikitable');  //get wiki tables
    let elements = $($tables[1]).find('tr'); 
    let casesAsOfToday = getTodaysCases(elements, $, allDaysCases);
    // console.log(casesAsOfToday);

    // PART 2: GET all provinces situation details until today
    elements = $($tables[2]).find('tr');
    let provDetails = getProvDetails(elements, $);
    // console.log(provDetails);

    let date = new Date();
    let dateString = (date.getMonth() + 1) + '/' + date.getDate();

    // Update todays cases into history cases
    if(casesAsOfToday.length > 0) {
      if(dateString !== allDaysCases[allDaysCases.length - 1].date)
        allDaysCases.push({date: dateString, cases: casesAsOfToday});  // new day's data
      else {
        allDaysCases.pop();  // for updating the same day's cases
        allDaysCases.push({date: dateString, cases: casesAsOfToday});
      }
    }

    // PART 3: GET/Calculate overall cases today
    elements = $('td', '.infobox');  //get table rows
    let canadaCases = provDetails[provDetails.length -1];
    let newOverall = getCanadaOverall(canadaCases, oldOverall, casesAsOfToday, allDaysCases);
    // console.log(canadaCases, newOverall);

    // PART 4: Write to file
    let jsonData = {
        date: moment(date).format('YYYY-MM-DD HH:mm:ss'), 
        cases: allDaysCases, 
        details: provDetails,
        overall: newOverall
    };

    // save to json file 
    if(!DEBUG_MODE_ON) {
      const casesString = JSON.stringify(jsonData, null, 4);
      fs.writeFile("../public/assets/CanadaCasesDb.json", casesString, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated Canada history cases data at ${jsonData.date}`);
      });
    }

  } else {
    console.log('Failed to get Canada cases from wiki page:', res.status);
  }
}

// getLatestCases(); // no needed right now
getCasesTimeline();  // get all the cases reported
updateHistoryCases(); // update today's cases into history table
