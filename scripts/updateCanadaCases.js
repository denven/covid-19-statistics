const fs = require('fs');
const cheerio = require('cheerio');
const wiki = require('wikijs').default;
const axios = require('axios');
const _ = require('lodash');

// get cases timeline announced by the gov
async function getCasesTimeline () {

  let casesTimeline = [];
  let data = await wiki().page('2020_coronavirus_outbreak_in_Canada').then(page => page.html());
  const $ = cheerio.load(data);
        
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
      time: (new Date()),
      cases: tmpCases.reverse()
    }
    const timelineString = JSON.stringify(jsonData, null, 4);
    // console.log(timelineString);
    fs.writeFile("../src/assets/CanadaTimeline.json", timelineString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated Canada timeline data at ${jsonData.time}`);
    });
  }
}

// get cases timeline announced by the gov
async function updateHistoryCases () {

  // step 1: read current data
  // step 2: get last line of data
  // step 3: compare the last data and save new cases data
  // step 4: rewrite data to json file

  let oldData = fs.readFileSync(`../src/assets/CanadaCasesDb.json`);
  let allDaysCases = JSON.parse(oldData).cases;
  let oldOverall = JSON.parse(oldData).overall;
  
  // fetch data by scraping
  let html = await wiki().page('2020_coronavirus_outbreak_in_Canada').then(page => page.html());
  const $ = cheerio.load(html);

  let date = new Date();
  let dateString = (date.getMonth() + 1) + '/' + date.getDate();

  // PART 1: GET provinces cases today
  let casesAsOfToday = [];
  let elements = $('tr', '.wikitable');  //get table rows

  try {  
    elements.each( (index, item) => {

      if(index > 0) {
        // console.log($(item).text().trim().replace(/\n{1,5}/g, ',').replace(/\[.*\]/g,'').replace(/,,/g,',0,'))
        let tabRow = $(item).text().trim().replace(/\n{1,5}/g, ',').replace(/\[.*\]/g,'').replace(/,,/g,',0,');

        if(tabRow.includes('Total')) {
          //Order: BC:0,	AB:1,	ON:2,	QC:3,  NB:4  total provinces: 5  :as of 2020-03-11
          let provCases = tabRow.replace(/[,]{0,1}[a-zA-Z][,]{0,1}/g,'').split(','); 

          let lastDay = allDaysCases[allDaysCases.length - 1];
          let totalHisCases = lastDay.cases.reduce((total, curProv) => {
            return total = parseInt(total) + parseInt(curProv.value); 
          },[0]);

          //there are new increased cases(5 provinces as of 2020-03-20), provCases[5] is total number
          let tollNumberIdx = 5; // confirm this value by checking the html table row
          if(totalHisCases <= provCases[tollNumberIdx]) { 
            let provinces = [
              "Ontario", "British Columbia", "Quebec", 
              "Alberta", "Manitoba", "Saskatchewan", 
              "Newfoundland and Labrador", "Prince Edward Island", "Nova Scotia", "New Brunswick", 
              "Yukon", "Northwest Territories", "Nunavut"
              ];
            // ['ON', 'BC', 'QC', 'AB', 'MB', 'SK', 'NL', 'PE', 'NS', 'NB', 'YT', 'NT', 'NU'] order on yAxis
            // The provIdx value is the index of collected province array from wikipedia, the order is:
            // BC, AB, ON, QC, NB ... 
            casesAsOfToday = provinces.map( (prov, index) => {
              let provIdx = -1; 
              if(index === 0) provIdx = 2;  // ON
              if(index === 1) provIdx = 0;  // BC
              if(index === 2) provIdx = 3;  // ON
              if(index === 3) provIdx = 1;  // QC
              if(index === 9) provIdx = 4;  // NB

              return {
                "name": prov,
                "value": provIdx >= 0 ? provCases[provIdx] : ''
              }
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
      return total = parseInt(total) + parseInt(curProv.value); 
    },[0]);

    // if(dateString.replace(/\//g, '') > allDaysCases[allDaysCases.length - 1].date.replace(/\//g, '')) {
    //   newOverall.increased = newOverall.confirmed - yesterdayTotal;
    // } else {
      newOverall.increased = newOverall.confirmed - yesterdayTotal;
    // }

    // save to json file
    const casesString = JSON.stringify({
        date: date, 
        cases: allDaysCases, 
        overall: newOverall
      }, null, 4);

    fs.writeFile("../src/assets/CanadaCasesDb.json", casesString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated Canada history cases data at ${date}`);
    });
  } catch (error) {
    console.log(`Writing Canada's latest cases to file`, error)
  }
}

// update the latest overall cases
async function updateOverallCases () {

  let oldData = fs.readFileSync(`../src/assets/CanadaCasesDb.json`);
  let oldOverall = JSON.parse(oldData).overall;
  console.log(oldOverall);

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
          console.log(cases);

          curCases.push({name: province, value: cases});
        });
    });
  }

  if(curCases.length > 0) {
    let jsonData = {
      date: (new Date()),
      cases: curCases
    }

    const casesString = JSON.stringify(jsonData, null, 4);
    fs.writeFile("../src/assets/CasesLatest.json", casesString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated latest cases data at ${jsonData.date}`);
    });
  }
}

getCasesTimeline();  // get all the cases reported
// getLatestCases(); // no needed right now
updateHistoryCases(); // update today's cases into history table
