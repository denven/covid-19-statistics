
## Introduction
A web app uses react, material ui and echarts, and js scraper to collect and represent statistics of coronavirus in the world.
- New Hosting on AWS S3: http://covid-19-statistics.s3-website-us-west-2.amazonaws.com/
- Original Hosting on heroku: http://covid-19-statistics.herokuapp.com/

Note: 
- The new hosting on AWS S3 is auto-deployed(updating epidemic data) by github Actions workflow script;
- If you cannot access heroku site for the first time, that's because it's sleeping when it's idle. So try a second visit after 2-3 minutes as it will be awaken once you've started first access.

## Collected Data Source (Auto-update every 4 hours)
- https://lab.isaaclin.cn/nCoV/en
- https://en.wikipedia.org/wiki/2020_coronavirus_outbreak_in_Canada
- https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html

## Screenshots
![Global Statistics](./screenshots/2.WorldStatistics.png#pic_center=960x500)
![Canada Statistics](./screenshots/3.CanadaStatistics.png#pic_center=960x500)
![China Statistics](./screenshots/1.ChinaStatistics.png#pic_center=960x500)
![News Feeds](./screenshots/4.NewsFeeds.png#pic_center=960x500)

