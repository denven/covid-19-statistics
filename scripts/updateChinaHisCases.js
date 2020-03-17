const fs = require('fs');
const moment = require('moment');
const axios = require('axios');

const updateChinaHisCases = () => {

  const hisDataUrl = 'https://www.windquant.com/qntcloud/data/edb?' + process.env.WINDAPIKEY;
  const indicators = '&indicators=S6274770,S6274773,S6274772,S6274771&startdate=2020-01-20&enddate=';
  const endDate = moment().format('YYYY-MM-DD');  // today
  // console.log(hisDataUrl + indicators + endDate);
  axios.get(hisDataUrl + indicators + endDate).then( hisData => {

    if(hisData.data.errCode === 0) {
      let jsonHisDataObj = { 
        date: hisData.data.times.map( s => { return moment.unix(s / 1000).format('YYYY-MM-DD') }),
        confirmedNum: hisData.data.data[0],
        suspectedNum: hisData.data.data[1], 
        curesNum: hisData.data.data[2],
        deathsNum: hisData.data.data[3]
      };

      let date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      const newsString = JSON.stringify(jsonHisDataObj, null, 4);
      fs.writeFile("../public/assets/ChinaHisCases.json", newsString, (err, result) => {
        if(err) console.log('Error in writing data into Json file', err);
        console.log(`Updated China History Cases at ${date}`);
      });

    } else {
      console.log('Requst for history data in China, errCode:', hisData.data.errCode);
    }        

  });
}

updateChinaHisCases();
