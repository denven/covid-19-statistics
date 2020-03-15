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
    let increases = $('sup', 'span').text();
    for(let key = 0; key < increases.length; key++) {
      console.log(`Increased Cases Available:`, $(increases[key]).text(), increases.length);
    }

    let data = $('span', '.stat');
    for(let key = 0; key < data.length - 1;) {
      if($(data[key]).text() === '') key++;
      // console.log($(data[key]).text(), $(data[key+1]).text(), $(data[key+2]).text(), $(data[key+3]).text(), data.length, 'end' );
      if($(data[key]).text() === '地区') break;

      let stateEnglishName = getStateEnName($(data[key]).text().trim(), statesNames);
      let stateIncreased = $(data[key + 1]).text().match(/[\d]{1,4}/g).length > 1 ? 
                           $(data[key + 1]).text().match(/[\d]{1,4}/g)[1] : '0'; 

      if(stateEnglishName) {
        curCases.push({
          name: stateEnglishName,
          confirmed: $(data[key + 1]).text().match(/[\d]{1,4}/g)[0],
          increased: stateIncreased,
          death: $(data[key + 2]).text().match(/[\d]{1,4}/g)[0],  // this is death number
          deathRate: $(data[key + 3]).text()   // this is death rate
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
      fs.writeFile("../src/assets/UsaStatesCases.json", casesString, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated latest US states cases at ${jsonData.date}`);
      });
    }
  }
}

async function updateUsaHisCases () {

  let oldData = fs.readFileSync(`../src/assets/UsaCasesHistory.json`);
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
        confirmedNum: $(casesData[0]).text(),
        curesNum: $(casesData[1]).text(),
        increasedNum: 0,
        deathsNum: $(casesData[2]).text()
      }
    }
    // console.log($(casesData[0]).text(), latestStatus)

    let srcDate = $('span', 'h2');
    // extract the exact date and time(UTC time)
    let utcSrcDateStr = $(srcDate).text().match(/2020-([\d]{2}-[\d]{2} [\d]{2}:[\d]{2} UTC)/g).join();
    // change UTC time to localtime(its important for the src string containing the letters 'UTC' )
    let localSrcDateStr = moment(new Date(utcSrcDateStr)).format('YYYY-MM-DD');
    let srcDateStr = localSrcDateStr.slice(5).replace(/^0/,'').replace(/-[0]{0,1}/,'/');

    let lastDay = allCases[allCases.length - 1];
    // step 3-1: increase a new day's data by comparision
    // console.log(utcSrcDateStr, localSrcDateStr, lastDay.date, srcDateStr);
    if(lastDay.date !== srcDateStr)  {
      latestStatus.increasedNum = latestStatus.confirmedNum - lastDay.confirmedNum;
      latestStatus.date = srcDateStr;
      allCases.push(latestStatus);
    }

    // step 3-2: or update today's cases realtimely
    if(lastDay.date === srcDateStr && lastDay.confirmedNum < latestStatus.confirmedNum) {
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
      fs.writeFile("../src/assets/UsaCasesHistory.json", casesString, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated USA's history cases data at ${date}`);
      });
    }
  }
}

async function getCaLatestCases () {

  // get latest cases data
  let url = "https://coronavirus.1point3acres.com/en";
  let res = await axios.get(url);

  let curCases = [];
  let statesNames = await gerateUSStatesNames();
  if(res.status === 200) {
    const $ = cheerio.load(res.data);

    let data = $('span', '.jsx-2915694336');
    for(let key = 4; key < data.length;) {
      if($(data[key]).text() === '地区') {
        console.log(key)
        curCases.push({
          name: getStateEnName($(data[key]).text(), statesNames),
          confirmed: $(data[key + 1]).text(),
          recovered: $(data[key + 2]).text(),
          death: $(data[key + 3]).text()
        });
      }
      key = key + 4;
    }
    console.log('ca', curCases);
  }
}

getUsaLatestCases();       // by states
updateUsaHisCases();       // by days