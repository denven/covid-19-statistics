const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');

async function updateGlobalCases () {

  let url = "https://www.worldometers.info/coronavirus/";
  let res = await axios.get(url);

  if(res.status === 200) {
    
    const $ = cheerio.load(res.data);

    let countries = [];
    let tableRows = $('td', 'tr').toArray();

    for(let index = 0; index < tableRows.length;) {

      let name = $(tableRows[index]).text().match(/[a-zA-Z ]+/g);  // match country or place name

      if(Array.isArray(name)){
        let increasedNum = ( name[0].trim() !== 'Total' ? 
                             $(tableRows[index+2]).text().trim().slice(1) :
                             $(tableRows[index+2]).text().trim()) || '0';
        let country = {
          name: name[0].trim(),
          total: $(tableRows[index+1]).text().trim(),
          increased: increasedNum,
          dead: $(tableRows[index+3]).text().trim() || '0',
          newDeath: $(tableRows[index+4]).text().trim().slice(1) || '0',
          recovered: $(tableRows[index+5]).text().trim() || '0',
          active: $(tableRows[index+6]).text().trim() || '0',
          severe: $(tableRows[index+7]).text().trim() || '0',
          perMppl: $(tableRows[index+8]).text().trim() || '0'        
        };
        countries.push(country);

        if( name[0].trim() === 'Total') break;

        index += 9;

      } else {
        index++;
      } 
    };

    let overall = countries.pop();
    // console.log(overall);
    if(countries.length > 0) {
      let jsonData = {
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        countries: countries,
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

updateGlobalCases();