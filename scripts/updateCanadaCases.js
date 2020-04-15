const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const DEBUG_MODE_ON = false;
// const DEBUG_MODE_ON = true;

const provinces = [
  { fullname: "Quebec", abbr: 'QC', apiKey: 'quebec'},
  { fullname: "Ontario", abbr: 'ON', apiKey: 'ontario'},
  { fullname: "Alberta", abbr: 'AB', apiKey: 'alberta'},
  { fullname: "British Columbia", abbr: 'BC', apiKey: 'british-columbia'},
  { fullname: "Nova Scotia", abbr: 'NS', apiKey: 'nova-scotia'},
  { fullname: "Saskatchewan", abbr: 'SK', apiKey: 'saskatchewan'},
  { fullname: "Manitoba", abbr: 'MB', apiKey: 'manitoba'},
  { fullname: "Newfoundland and Labrador", abbr: 'NL', apiKey: 'newfoundland-and-labrador'},
  { fullname: "New Brunswick", abbr: 'NB', apiKey: 'new-brunswick'},
  { fullname: "Prince Edward Island", abbr: 'PE', apiKey: 'prince-edward-island'},
  { fullname: "Yukon", abbr: 'YT', apiKey: 'yukon'},
  { fullname: "Northwest Territories", abbr: 'NT', apiKey: 'northwest-territories'},
  { fullname: "Nunavut", abbr: 'NU', apiKey: 'nunavut'},
  { fullname: "Repatriated Canadians", abbr: 'Repatriated', apiKey: 'repatriated'},
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
      ...getOneMonthReports(tmp, 'May'),
      ...getOneMonthReports(tmp, 'June'),
      ...getOneMonthReports(tmp, 'July'),
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
        if(provAbbrs.length > 13) provAbbrs[13] = 'RT'; //Special process for Repatriated travellers
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
            // console.log(casesAsOfToday)
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
        tabKeys = $(item).text().trim().replace(/\n\n/,'\n').split('\n');
      }

      if(index > 1) {
        let provDetail = {};
        // console.log($(item).text().trim().replace(/\n\n/,'\n'));
        $(item).text().trim().replace(/\n\n/,'\n').split('\n').forEach( (value, idx) => { 

          provDetail[tabKeys[idx]] = value.replace(/,/, '') || 0;
        });
        console.log('prov', provDetail);  
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

    // as the tables may not be updated syncly, so pick the largest number as latest
    let latestConfirmed  = Math.max(todayTotal, parseInt(canada["Total"]));

    newOverall = {
      confirmed: latestConfirmed,
      recovered: canada["Recov."],
      death: canada["Deaths"],
      increased: todayTotal - yesterdayTotal  // new cases today
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

// // getLatestCases(); // no needed right now
// getCasesTimeline();  // get all the cases reported
// updateHistoryCases(); // update today's cases into history table

async function getCanadaCases() {

  const ApiUrl = 'https://kustom.radio-canada.ca/coronavirus/canada'
  const provincesApiUrls = provinces.map( ({apiKey}) => ApiUrl + '_' + apiKey);
  provincesApiUrls.push(ApiUrl); 

  try {
    let resArray = await axios.all(provincesApiUrls.map(url => axios.get(url)));   
    let provCases = resArray.map( ({data}, index) => {
      let {State, Confirmed, Deaths, Recovered, Tests, Hospitalizations, IntensiveCares, Population} = data[0];
      let casesPer1M = Population > 0 ? Math.ceil(Confirmed * 1000000 / Population) : 0;

      return {
        Province: State || 'Canada',
        Tests: Tests,
        Abbr: (index < provinces.length) ? provinces[index].abbr : 'Canada',
        "Conf.": Confirmed,
        "Per m": casesPer1M,
        Cured: Recovered,
        InWard: Hospitalizations,
        InICU: IntensiveCares,
        Deaths: Deaths,
        Active: Confirmed - Recovered - Deaths,
        Lethality: Deaths > 0 ? (100 * Deaths / Confirmed).toFixed(2) + '%' : '0%'
      }
    });  
    return provCases;
  } catch (error) {
    console.log('Error when fetching Canada Latest Cases by Api requests:', error);
    return;
  }
};

async function updateHistoryCasesV2 () {

  let oldData = fs.readFileSync(`../public/assets/CanadaCasesDb.json`);
  let allDaysCases = JSON.parse(oldData).cases;
  
  // Enable this once when adjusting the order of provinces
  // allDaysCases = allDaysCases.map( day => {
  //   let dayCases = [];
  //   provinces.forEach(({fullname, abbr}) => {
  //     let prov = day.cases.find( prov => prov.name === fullname );
  //     if(prov) dayCases.push(prov);
  //   });
  //   return {...day, cases: dayCases};
  // });

  let provDetails = await getCanadaCases();
  let casesAsOfToday = [];
  provDetails.forEach( item => {
    if(item.Province !== 'Canada') {
      casesAsOfToday.push({ 
        name: item.Province, 
        abbr: provinces.find( p => p.fullname === item.Province).abbr,
        value: item["Conf."] === '0' ? '' : item["Conf."],
        cured: item.Cured,
        death: item.Deaths,
        lethality: item.Lethality
      });
    }
  });
  // console.log(casesAsOfToday);

  let date = new Date();
  let dateString = (date.getMonth() + 1) + '/' + date.getDate();

  if(casesAsOfToday.length > 0) {
    if(dateString !== allDaysCases[allDaysCases.length - 1].date)
      allDaysCases.push({date: dateString, cases: casesAsOfToday});  // new day's data
    else {
      allDaysCases.pop();  // for updating the same day's cases
      allDaysCases.push({date: dateString, cases: casesAsOfToday});
    }
  }

  let todayTotal = casesAsOfToday.reduce((total, curProv) => {
    return total = parseInt(total) + parseInt(curProv.value || 0) + parseInt(curProv.suspect || 0); 
  },[0]);

  let yesterday = allDaysCases[allDaysCases.length - 2];
  let yesterdayTotal = yesterday.cases.reduce((total, curProv) => {
    return total = parseInt(total) + parseInt(curProv.value || 0) + parseInt(curProv.suspect || 0); 
  },[0]);

  let overall = {
    confirmed: provDetails[provDetails.length - 1]["Conf."],
    increased: todayTotal - yesterdayTotal,  // new cases today
    recovered: provDetails[provDetails.length - 1]["Cured"],
    death: provDetails[provDetails.length - 1]["Deaths"],
    lethality: provDetails[provDetails.length - 1]["Lethality"]
  }

  for(let i = 0; i < provDetails.length - 1; i++) {
    let newCase = casesAsOfToday[i].value - yesterday.cases[i].value;
    let newDeaths = casesAsOfToday[i].death - yesterday.cases[i].death;
    Object.assign(provDetails[i], {
      New: (newCase > 0) ? ("+" + newCase) : 0,
      NewDeaths: (newDeaths > 0) ? ("+" + newDeaths) : 0,
    });
  }

  let totalNewDeaths = overall.death - yesterday.cases.reduce((total, {death}) => {
    return total = parseInt(total) + parseInt(death);
  },[0]);
  Object.assign(provDetails[provDetails.length - 1], {    
    New: (overall.increased > 0) ? ("+" + overall.increased) : 0,
    NewDeaths: (totalNewDeaths > 0) ? ("+" + totalNewDeaths) : 0,
  });

  let jsonData = {
    date: moment(date).format('YYYY-MM-DD HH:mm:ss'), 
    cases: allDaysCases, 
    details: provDetails,
    overall: overall
  }
  // console.log(provDetails);

  // save to json file 
  if(!DEBUG_MODE_ON) {
    const casesString = JSON.stringify(jsonData, null, 4);
    fs.writeFile("../public/assets/CanadaCasesDb.json", casesString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated Canada history cases data at ${jsonData.date}`);
    });
  }

}

getCasesTimeline();
updateHistoryCasesV2();