const fs = require('fs');
const cheerio = require('cheerio');
const wiki = require('wikijs').default;
const axios = require('axios');

async function getCasesTimeline () {

  let casesTimeline = [];
  let data = await wiki().page('2020_coronavirus_outbreak_in_Canada').then(page => page.html());
  const $ = cheerio.load(data);

  $('p', 'div').each( (index, ele) => {
    // console.log($(ele).text());
    if(index > 0) {
      let message = $(ele).text().replace(/\[\d{1,2}\]/g,'');
      let date = message.match(/^On [A-Z][a-z]{2,10} \d{1,2}/g);
      let content = message.replace(/^On [A-Z][a-z]{2,10} \d{1,2},/g, '').trim();
      if(date) {
        date = date[0].slice(3) + ', 2020';
        content = content.charAt(0).toUpperCase() + content.substring(1);
        if(content.search('Shopify') > -1) return '';
        if(content.search('TED') > -1) return '';
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

async function getHistoryCases () {

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
    fs.writeFile("../src/assets/CasesDb.json", casesString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated cases data at ${jsonData.date}`);
    });
  }
}

getCasesTimeline();  // get all the cases reported
getHistoryCases();
