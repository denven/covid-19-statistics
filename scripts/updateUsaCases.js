const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');

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

  const statesNames = JSON.stringify({states: statesMapping}, null, 4);
  fs.writeFile("./usaStatesNames.json", statesNames, (err, result) => {
    if(err) console.log('Error in writing data into Json file', err);
    console.log(`Generated US states name mapping`);
  });

  return statesMapping;
}

const getStateEnName = (cnName, nameTable) => {

  let state = nameTable.find(state => state.cnName === cnName);
  if(state) return state.name;
  return '';
}

// get latest cases by states in USA
async function getLatestCases () {

  // get latest cases data
  let url = "https://coronavirus.1point3acres.com/en";
  let res = await axios.get(url);

  let curCases = [];
  let statesNames = await gerateUSStatesNames();
  if(res.status === 200) {
    const $ = cheerio.load(res.data);

    let data = $('span', '.jsx-2915694336');
    for(let key = 4; key < data.length;) {
      if($(data[key]).text() === '地区') 
        break;
      curCases.push({
        name: getStateEnName($(data[key]).text(), statesNames),
        confirmed: $(data[key + 1]).text(),
        recovered: $(data[key + 2]).text(),
        death: $(data[key + 3]).text()
      })
      key = key + 4;
    }
  }

  if(curCases.length > 0) {
    let jsonData = {
      date: (new Date()),
      cases: curCases
    }

    const casesString = JSON.stringify(jsonData, null, 4);
    fs.writeFile("../src/assets/UsaStatesCases.json", casesString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated latest US states cases at ${jsonData.date}`);
    });
  }
}

async function updateHistoryCases () {

  let oldData = fs.readFileSync(`../src/assets/UsaCasesHistory.json`);
  let allCases = JSON.parse(oldData).cases;
  let lastDay = allCases[allCases.length - 1];

  // step 1: get latest cases data in us
  let url = "https://coronavirus.1point3acres.com/en";
  let res = await axios.get(url);

  if(res.status === 200) {

    // step 2: get latest/current cases
    const $ = cheerio.load(res.data);

    let latestStatus = {};
    let casesData = $('dd', '.jsx-4193741142');
    if(casesData.length > 3) {
      latestStatus = {
        date: '',
        confirmedNum: $(casesData[0]).text(),
        curesNum: $(casesData[1]).text(),
        increasedNum: 0,
        deathsNum: $(casesData[2]).text()
      }
    }

    let srcDate = $('span', '.jsx-2711182874');
    let srcDateStr = $(srcDate).text().match(/2020-([\d]{2}-[\d]{2})/g).join(); 
    srcDateStr = srcDateStr.slice(5).replace(/^0/,'').replace(/-[0]{0,1}/,'/');

    // step 3: increase a new day's data by comparision
    if(lastDay.date !== srcDateStr)  {
      latestStatus.increasedNum = latestStatus.confirmedNum - lastDay.confirmedNum;
      latestStatus.date = srcDateStr;
      allCases.push(latestStatus);
    }

    // step 3: or update today's cases realtimely
    if(lastDay.date === srcDateStr && lastDay.confirmedNum < latestStatus.confirmedNum) {
      allCases.pop();
      latestStatus.increasedNum = latestStatus.confirmedNum - lastDay.confirmedNum;
      latestStatus.date = srcDateStr;
      allCases.push(latestStatus); //update new data for the same day
    } 

    // step 4: save new data back to json file
    let date = new Date();
    const casesString = JSON.stringify({date: date, cases: allCases}, null, 4);
    fs.writeFile("../src/assets/UsaCasesHistory.json", casesString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated USA's history cases data at ${date}`);
    });

  }
}

getLatestCases();       // by states
updateHistoryCases();