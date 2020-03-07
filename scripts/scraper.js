const fs = require('fs');
const cheerio = require('cheerio');
const wiki = require('wikijs').default;
const axios = require('axios');

// get cases timeline announced by the gov
async function getCasesTimeline () {

  let casesTimeline = [];
  let data = await wiki().page('2020_coronavirus_outbreak_in_Canada').then(page => page.html());
  const $ = cheerio.load(data);
        
  $('p', 'div').each( (index, ele) => {
    if(index > 0) {
      let message = $(ele).text().replace(/\[\d{1,2}\]/g,'');
      let date = message.match(/^On [A-Z][a-z]{2,10} \d{1,2}/g);
      let content = message.replace(/^On [A-Z][a-z]{2,10} \d{1,2},/g, '').trim();
      if(date) {
        date = date[0].slice(3) + ', 2020';
        content = content.charAt(0).toUpperCase() + content.substring(1);
        if(content.search('Shopify') > -1) return '';
        if(content.search('TED') > -1) return '';
        if(content.search('Collision') > -1) return '';
        casesTimeline.push({date, content});
      }
    }        
  });

  $('p', 'div').each( (index, ele) => {

    if(index < 5 && $(ele).text()) {   
      let message = $(ele).text().replace(/\[[a-z]{0,10}\d{0,2}\]/g,'');
      let date = message.match(/As of [A-Z][a-z]{2,10}.*, 2020/g);
      let content = message.replace(/(.*)As of [A-Z][a-z]{2,10}.*, 2020, /g, '').trim();
      if(date) {
        date = date[0];
        content = content.charAt(0).toUpperCase() + content.substring(1);
        casesTimeline.push({date, content});
      }
    }
  });

  if(casesTimeline.length > 0) {
    let jsonData = {
      time: (new Date()),
      cases: casesTimeline.reverse()
    }
    const timelineString = JSON.stringify(jsonData, null, 4);
    // console.log(timelineString);
    fs.writeFile("../src/assets/Timeline.json", timelineString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated timeline data at ${jsonData.time}`);
    });
  }
}

// get cases timeline announced by the gov
async function getHistoryCases () {

  // step 1: read current data
  // step 2: get last line of data
  // step 3: compare the last data and save new cases data
  // step 4: rewrite data to json file

  let oldData = fs.readFileSync(`../src/assets/CasesDb.json`);
  let allCases = JSON.parse(oldData).cases;
  let lastDay = allCases[allCases.length - 1];
  let totalCases = 0;

  totalCases = lastDay.cases.reduce((total, curProv) => {
    return total = parseInt(total) + parseInt(curProv.value); 
  },[0]);

  // fetch data by scraping
  let html = await wiki().page('2020_coronavirus_outbreak_in_Canada').then(page => page.html());
  const $ = cheerio.load(html);

  let ele = $('tr', '.wikitable').last();
  let countryCases = $(ele).text().trim().replace(/\n{1,5}/g, ',').match(/\d{1,3}/g);

  // get new cases data
  if(countryCases && (countryCases[countryCases.length - 1] - totalCases) !== 0) {
    let provinces = ["Ontario", "British Columbia", "Quebec", "Alberta"];

    let curCases = provinces.map( (prov, index) => {
      let caseIdx = 0;
      if(index === 0) caseIdx = 2;
      if(index === 1) caseIdx = 0;
      if(index === 2) caseIdx = 3;
      if(index === 3) caseIdx = 1;

      if(index < countryCases.length - 1) {
        return {
          "name": prov,
          "value": countryCases[caseIdx]
        }
      }
    });

    // save new cases data to array
    let date = new Date();
    let dateString = (date.getMonth() + 1) + '/' + date.getDate();
    if(dateString !== allCases[allCases.length - 1].date)
      allCases.push({date: dateString, cases: curCases});

    // save to json file
    const casesString = JSON.stringify({date: date, cases: allCases}, null, 4);
    fs.writeFile("../src/assets/CasesDb.json", casesString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated history cases data at ${date}`);
    });

  }
}

// get latest cases from cdc canada
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
getLatestCases(); // no needed right now
getHistoryCases();