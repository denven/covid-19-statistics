const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment')
const DEBUG_MODE_ON = false;
// const DEBUG_MODE_ON = true;

// get latest cases from cdc canada
async function gerateUSStatesNames () {

  let states = fs.readFileSync(`./namesMapping.ini`).toString();
  let strings = states.replace(/[\t\n]/g, '').split(',');

  let statesMapping = new Array(52);
  for(let key = 0; key < strings.length;){
    statesMapping[key/3] = {
      cnName: strings[key].trim(),
      name: strings[key+1].trim(),
      abbrev: strings[key+2].trim()
    }
    key = key + 3;
  }

  // const statesNames = JSON.stringify({states: statesMapping}, null, 4);
  // fs.writeFile("./usaStatesNames.json", statesNames, (err, result) => {
  //   if(err) console.log('Error in writing data into Json file', err);
  //   console.log(`Generated US states name mapping`);
  // });

  return statesMapping;
}

const getStateEnName = (cnName, nameTable) => {

  let state = nameTable.find(state => state.cnName === cnName);
  if(state) return state.name;
  return '';
}

// get latest cases by states in USA
async function getUsaLatestCases () {

  // get latest cases data
  let url = "https://coronavirus.1point3acres.com";
  let res = await axios.get(url);

  let curCases = [];
  let statesNames = await gerateUSStatesNames();
  if(res.status === 200) {
    
    const $ = cheerio.load(res.data);
    // console.log(res.data.replace(/sup/g,'span'))
    // Note: this catch is not reliable, sometimes the data is available, sometimes it's not!!!
    // let increases = $('sup', 'span').text();
    // for(let key = 0; key < increases.length; key++) {
    //   console.log(`Increased Cases Available:`, $(increases[key]).text()[0], increases.length);
    // }

    let data = $('span', '.stat');
    for(let key = 0; key < data.length - 1;) {
      if($(data[key]).text() === '') key++;
      // console.log($(data[key]).text(), $(data[key+1]).text(), $(data[key+2]).text(), $(data[key+3]).text(), data.length, 'end' );
      if($(data[key]).text() === '地区') break;

      // let stateEnglishName = getStateEnName($(data[key]).text().trim(), statesNames);
      let stateEnglishName = $(data[key]).text().trim(); // we can get the province/state english name directly on Mar 19th
      // let stateIncreased = $(data[key + 1]).text().match(/[\d]{1,6}/g).length > 1 ? 
                          //  $(data[key + 1]).text().match(/[\d]{1,6}/g)[1] : 'N/A'; 
      // console.log($(data[key+1]).text(), stateEnglishName)//, stateIncreased, 'key:', key);

      let $confIncreased = $(data[key+1]);
      let stateIncreased = $confIncreased.find('div').text();
      let stateConfirmed = $confIncreased.text().replace(stateIncreased, '').replace(/,/, ''); // remove thousands separator 
      stateIncreased = stateIncreased.replace(/\+([\d]{1,5})$/g, '$1');  // remove '+'
      // console.log(stateConfirmed, stateIncreased === '' ? 'N/A' : stateIncreased)
      let $stateDeaths = $(data[key + 2]);
      let stateDeathsInc = $stateDeaths.find('div').text();
      let stateDeaths = $stateDeaths.text().replace(stateDeathsInc, '').replace(/,/, '');

      if(key > 280) break;
      if(stateEnglishName) {
        curCases.push({
          name: stateEnglishName,
          confirmed: stateConfirmed, // $(data[key + 1]).text().match(/[\d]{1,6}/g)[0],
          increased: stateIncreased === '' ? 'N/A' : stateIncreased,
          death: stateDeaths, //$(data[key + 2]).text().match(/[\d]{1,6}/g)[0],  // this is death number
          deathRate: $(data[key + 3]).text(),   // this is death rate
        })
      }
      key = key + 4;
    }
  }
  // console.log(curCases); 

  if(!DEBUG_MODE_ON) {
    if(curCases.length > 0) {
      let jsonData = {
        date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        cases: curCases
      }

      const casesString = JSON.stringify(jsonData, null, 4);
      fs.writeFile("../public/assets/UsaStatesCases.json", casesString, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated latest US states cases at ${jsonData.date}`);
      });
    }
  }
}

async function updateUsaHisCases () {

  let oldData = fs.readFileSync(`../public/assets/UsaCasesHistory.json`);
  let allCases = JSON.parse(oldData).cases;

  // step 1: get latest cases data in us
  let url = "https://coronavirus.1point3acres.com/en";
  let res = await axios.get(url);

  if(res.status === 200) {

    // step 2: get latest/current cases
    const $ = cheerio.load(res.data);

    let latestStatus = {};
    // let casesData = $('dd', '.jsx-4193741142'); // not available
    let casesData = $('strong', 'section');  //03-09-2020 available
    if(casesData.length > 3) {
      latestStatus = {
        date: '',
        confirmedNum: $(casesData[0]).text().replace(/,/g, ''),
        curesNum: $(casesData[1]).text().replace(/,/g, ''),
        increasedNum: 0,
        deathsNum: $(casesData[2]).text().replace(/,/g, '')
      }
    }
    // console.log($(casesData[0]).text(), latestStatus)

    // let srcDate = $('span', 'h2');
    // extract the exact date and time(UTC time)
    // let utcSrcDateStr = $(srcDate).text().match(/2020-([\d]{2}-[\d]{2} [\d]{2}:[\d]{2} UTC)/g).join();
    // change UTC time to localtime(its important for the src string containing the letters 'UTC' )
    let localSrcDateStr = moment(new Date()).format('YYYY-MM-DD');
    let srcDateStr = localSrcDateStr.slice(5).replace(/^0/,'').replace(/-[0]{0,1}/,'/');

    // Mar 16, they changed utcSrcDate to local time
    // let srcDateStr = utcSrcDateStr.slice(5, 10).replace(/^0/,'').trim()

    let lastDay = allCases[allCases.length - 1];
    // step 3-1: increase a new day's data by comparision
    // console.log(localSrcDateStr, lastDay.date, srcDateStr);
    if(lastDay.date !== srcDateStr)  {
      latestStatus.increasedNum = latestStatus.confirmedNum - lastDay.confirmedNum;
      latestStatus.date = srcDateStr;
      allCases.push(latestStatus);
    }

    // step 3-2: or update today's cases realtimely
    // console.log(latestStatus.confirmedNum, lastDay.confirmedNum)
    if(lastDay.date === srcDateStr && parseInt(lastDay.confirmedNum) < parseInt(latestStatus.confirmedNum)) {
      allCases.pop();
      lastDay = allCases[allCases.length - 1];
      latestStatus.increasedNum = latestStatus.confirmedNum - lastDay.confirmedNum;
      latestStatus.date = srcDateStr;
      allCases.push(latestStatus); //update new data for the same day
    } 

    // console.log(allCases, latestStatus);
    // step 4: save new data back to json file
    if(!DEBUG_MODE_ON) {
      let date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      const casesString = JSON.stringify({date: date, cases: allCases}, null, 4);
      fs.writeFile("../public/assets/UsaCasesHistory.json", casesString, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated USA's history cases data at ${date}`);
      });
    }
  }
}


async function _getUsaLatestCases () {

  // get latest cases data
  let url = "https://www.worldometers.info/coronavirus/country/us/";
  let res = await axios.get(url);

  let curStatesCases = [];
  let curOverallNum = {};

  if(res.status === 200) {
    
    const $ = cheerio.load(res.data);
    let tableRows = $('tr', 'tbody').toArray();

    for(let index = 0; index < tableRows.length;) {

      let rowColumns = $(tableRows[index]).find("td").toArray();
      let tdTexts = rowColumns.map(td => $(td).text().trim());

      if(Array.isArray(tdTexts)) {
        let [ name, total, increased, dead, newDeath, active ] = tdTexts;

        let lethality = '0%';
        let deadCount = (dead !== '') ? dead.replace(/,/, '') : 0;
        let totalCount = total.replace(/,/,'');
        let activeCount = active.replace(/,/,'');
        if(parseInt(dead.trim().replace(/,/,'')) > 0) {
          lethality = (100 * deadCount / totalCount).toFixed(2) + '%';
        }

        if(name === "Total:") {
          curOverallNum = {
            confirmed: total, 
            suspect: increased, 
            cured: totalCount - deadCount - activeCount, 
            death: dead, 
            fatality: lethality
          };
          // console.log(curOverallNum);          
          break;
        } 

        let stateCases = {
          name: name,
          confirmed: total,
          increased: increased,
          death: dead,
          newDeath: newDeath,
          deathRate: lethality
        };
        // console.log(stateCases);
        curStatesCases.push(stateCases);
      };
      index++;
    };
    // console.log(curStatesCases)
  }



  if(!DEBUG_MODE_ON) {
    if(curStatesCases.length > 0) {
      let jsonData = {
        date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        cases: curStatesCases,
        overall: curOverallNum
      }

      const casesString = JSON.stringify(jsonData, null, 4);
      fs.writeFile("../public/assets/UsaStatesCases.json", casesString, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated latest US states cases at ${jsonData.date}`);
      });
    }
  }
}

_getUsaLatestCases();       // by states
updateUsaHisCases();       // by days