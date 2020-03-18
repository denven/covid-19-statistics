const fs = require('fs');
const cheerio = require('cheerio');
// const wiki = require('wikijs').default;
const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');

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

// get cases timeline announced by the gov
async function updateHistoryCases () {

  // step 1: read current data
  // step 2: get last line of data
  // step 3: compare the last data and save new cases data
  // step 4: rewrite data to json file

  let oldData = fs.readFileSync(`../public/assets/CanadaCasesDb.json`);
  let allDaysCases = JSON.parse(oldData).cases;
  let oldOverall = JSON.parse(oldData).overall;
  
  // fetch data by scraping
  // let html = await wiki().page('2020_coronavirus_outbreak_in_Canada').then(page => page.html());

  let url = "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Canada";
  let res = await axios.get(url);

  if(res.status === 200) {

    const $ = cheerio.load(res.data);

    let date = new Date();
    let dateString = (date.getMonth() + 1) + '/' + date.getDate();

    // PART 1: GET provinces cases today
    let casesAsOfToday = [];
    let presumptiveCases = [];
    let elements = $('tr', '.wikitable');  //get table rows

    try {  
      let provAbbrs = [];
      elements.each( (index, item) => {
        // get the abbreviations of provinces
        if(index === 2) {  // wikipedia changed table format Mar 15, 2020
          provAbbrs = $(item).text().trim().replace(/\n{1,5}/g, ',').replace(/\[.*\]/g,'').replace(/,,/g,',0,').split(',');
        }

        if(index > 1) {
          // console.log($(item).text().trim().replace(/\n{1,5}/g, ',').replace(/\[.*\]/g,'').replace(/,,/g,',0,'))
          let tabRow = $(item).text().trim().replace(/\n{1,5}/g, ',').replace(/\[.*\]/g,'').replace(/,,/g,',0,');
          // Total confirmed row
          if(tabRow.includes('Total')) {

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

    // PART 2: GET/Calculate overall cases today
    let overallArray = [];
    let newOverall = {...oldOverall};
    elements = $('td', '.infobox');  //get table rows
    try {  
      elements.each( (index, item) => {
        let matches = $(item).text().match(/^[\d]{1,4}/g);  // if no matches, return null
        if(matches) {
          [].push.apply(overallArray, matches);
        }
      });

      if(overallArray.length >= 3) {
        newOverall = {
          confirmed: overallArray[0],
          recovered: overallArray[1],
          death: overallArray[2]
        }
      }
    } catch(error) {
      console.log('Failed to get Canada overall cases: ', error);
    }

    try {

      // save new cases data to array (provinces' cases)
      if(casesAsOfToday.length > 0) {
        if(dateString !== allDaysCases[allDaysCases.length - 1].date)
          allDaysCases.push({date: dateString, cases: casesAsOfToday});  // new day's data
        else {
          allDaysCases.pop();  // for updating the same day's cases
          allDaysCases.push({date: dateString, cases: casesAsOfToday});
        }
        // console.log(casesAsOfToday);
      }

      let yesterdayCases = allDaysCases[allDaysCases.length - 2];
      let yesterdayTotal = yesterdayCases.cases.reduce((total, curProv) => {
        return total = parseInt(total) + parseInt(curProv.value || 0) + parseInt(curProv.suspect || 0); 
      },[0]);
      let todayTotal = casesAsOfToday.reduce((total, curProv) => {
        return total = parseInt(total) + parseInt(curProv.value || 0) + parseInt(curProv.suspect || 0); 
      },[0]);

      // if(dateString.replace(/\//g, '') > allDaysCases[allDaysCases.length - 1].date.replace(/\//g, '')) {
      //   newOverall.increased = newOverall.confirmed - yesterdayTotal;
      // } else {
        newOverall.increased = todayTotal - yesterdayTotal;
      // }
      // console.log(todayTotal, yesterdayTotal, casesAsOfToday, yesterdayCases, newOverall);

      let jsonData = {
          date: moment(date).format('YYYY-MM-DD HH:mm:ss'), 
          cases: allDaysCases, 
          overall: newOverall
      };

      // save to json file 
      const casesString = JSON.stringify(jsonData, null, 4);
      fs.writeFile("../public/assets/CanadaCasesDb.json", casesString, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated Canada history cases data at ${jsonData.date}`);
      });

    } catch (error) {
      console.log(`Writing Canada's latest cases to file`, error)
    }
  } else {
    console.log('Failed to get Canada cases from wiki page:', res.status);
  }
}

// update the latest overall cases
async function updateOverallCases () {

  let oldData = fs.readFileSync(`../public/assets/CanadaCasesDb.json`);
  let oldOverall = JSON.parse(oldData).overall;

  // fetch data by scraping
  let html = await wiki().page('2020_coronavirus_outbreak_in_Canada').then(page => page.html());
  const $ = cheerio.load(html);

  let overallArray = [];
  let elements = $('td', '.infobox');  //get table rows
  try {  
    elements.each( (index, item) => {
      let matches = $(item).text().match(/^[\d]{1,4}/g);  // if no matches, return null
      if(matches) {
        [].push.apply(overallArray, matches);
      }
    });

    let newOverall = {...oldOverall};
    if(overallArray.length >= 3) {
      newOverall = {
        confirmed: overallArray[0],
        recovered: overallArray[1],
        death: overallArray[2]
      }

      let allDaysCases = JSON.parse(oldData).cases;
      let yesterdayCases = allDaysCases[allDaysCases.length - 2];
      let yesterdayTotal = yesterdayCases.cases.reduce((total, curProv) => {
        return total = parseInt(total) + parseInt(curProv.value); 
      },[0]);
      newOverall.increased = newOverall.confirmed - yesterdayTotal;
    }
  } catch(error) {
    console.log('Failed to get Canada overall cases: ', error);
  }

}
// get latest cases from cdc canada(the official's data is too slow to update)
async function getLatestCases () {

  // get latest cases data
  let url = "https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html";
  let res = await axios.get(url);

  let curCases = [];
  if(res.status === 200) {
    const $ = cheerio.load(res.data);
    $(".table").each( (index, ele) => {
      if(index === 0)              
        $('tr', 'tbody', ele).each( (index, ele) => {
          let province = $(ele).text().trim().split("\n")[0];
          let cases = $(ele).text().trim().split("\n")[1].replace(/ /g, '');
          curCases.push({name: province, value: cases});
        });
    });
  }

  if(curCases.length > 0) {
    let jsonData = {
      date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      cases: curCases
    }

    const casesString = JSON.stringify(jsonData, null, 4);
    fs.writeFile("../public/assets/CasesLatest.json", casesString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated latest cases data at ${jsonData.date}`);
    });
  }
}

// getLatestCases(); // no needed right now
getCasesTimeline();  // get all the cases reported
updateHistoryCases(); // update today's cases into history table
