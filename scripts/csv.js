const axios = require('axios');

const BCLabTestUrl = 'http://www.bccdc.ca/Health-Info-Site/Documents/BCCDC_COVID19_Dashboard_Lab_Information.csv';

const getBCLatestTests = async () => {
  let csvFile = await axios.get(BCLabTestUrl);
  let rows = csvFile.data.split('\r\n');
  let BCTests = [];
  console.log(rows[0])
  for(const row of rows) {
    let rowColsData = row.split(',');
    if(rowColsData[1] === `"BC"`) BCTests.push(rowColsData);
  }

  console.log(BCTests);
  if(BCTests.length > 0) {
    return BCTests[BCTests.length - 1][3];
  } else {
    return 0;
  }  
}

getBCLatestTests();