const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const _ = require('lodash');

async function updateGlobalCases () {

  let url = "https://www.worldometers.info/coronavirus/";
  let res = await axios.get(url);

  if(res.status === 200) {
    
    const $ = cheerio.load(res.data);

    let countries = [];
    let tableRows = $('tr', 'tbody').toArray();
 
    for(let index = 1; index < tableRows.length;) {
      // index = 0, is the same with the last line(totol number), April 05, 2020
      // Match english and french letters, dot, space in country name
      // let name = $(tableRows[index]).text().trim().match(/[a-zA-ZàâäèéêëîïôœùûüÿçÀÂÄÈÉÊËÎÏÔŒÙÛÜŸÇ.\- ]+/g);  // match country or place name
      const rowColumns = $(tableRows[index]).text().trim().split('\n');
      // console.log(rowColumns)
      if(Array.isArray(rowColumns)) {
          let [ name, total, increased, dead, newDeath, recovered, active, severe, perMppl ] = rowColumns;
          // total = total.trim().replace(/,/,'');
          countries.push( {name, total, increased, dead, newDeath, recovered, active, severe, perMppl} );
          if(name === "Total:") break;
      };
      index++;
    };

    let overall = countries.pop();
    // console.log(overall);
    if(countries.length > 0) {
      let jsonData = {
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        countries: _.sortBy(countries, (o) => parseInt(o.total.replace(/,/,''))).reverse(),
        overall: overall
      }

      const worldCasesStr = JSON.stringify(jsonData, null, 4);
      fs.writeFile("../public/assets/GlobalCasesToday.json", worldCasesStr, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated ${countries.length} countries cases global at ${jsonData.time}`);
      });
    }

  }
}

const updateDataFromDXY = () => {

  try {
    axios.get('https://lab.isaaclin.cn/nCoV/api/area').then( ({ data }) => {

      let time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      const worldCasesStr = JSON.stringify(data, null, 4);
      fs.writeFile("../public/assets/Areas.json", worldCasesStr, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated global countries cases global at ${time}`);
      });

    }).catch( err => console.log(err));

  } catch (error) {
    console.log(`Error when request data from lab.isaaclin.cn/nCoV/api`);
  }
}

// they canbe merged into using only one data source
updateGlobalCases();  // scrape live toll data from worldometer.com
updateDataFromDXY();  // use an api to get detailed cases in China and other countries