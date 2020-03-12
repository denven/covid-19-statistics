
## Introduction
A web app uses react, material ui, echarts, and js scraper to collect and represent statistics of coronavirus in the world.
- New Hosting on AWS S3: http://covid-19-statistics.s3-website-us-west-2.amazonaws.com/
- Original Hosting on heroku: https://covid-19-statistics.herokuapp.com/

Note: 
- The hosting on AWS S3 is auto-deployed(epidemic data updates every 8 hours) by github Actions workflow script;
- The hosting on Heroku is auto-deployed(epidemic data updates every hour) by github Actions workflow script;
- The heroku site may not be accessible because it's sleeping when it's idle, just give a second visit after 2-3 minutes and it will be awaken.

## Collected Data Source (Auto-update every hour)
- https://lab.isaaclin.cn/nCoV/en
- https://en.wikipedia.org/wiki/2020_coronavirus_outbreak_in_Canada
- https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html

## Screenshots
### Desktop View
![Desktop GIF](https://github.com/denven/hello_world/blob/master/COVID-19-Desktop.gif#pic_center=960x500)

### Mobile View

<style>
table th:first-of-type {
    width: 33%;
}
table th:nth-of-type(2) {
    width: 33%;
}
table th:nth-of-type(3) {
    width: 33%;
}
</style>

Global Statistics           |  USA Statistics            |  Canada Ocean
:-------------------------:|:-------------------------:|:-------------------------:
  ![Global Statistics](./screenshots/1.mobile-Global.jpg "Global Statistics")|![USA Statistics](./screenshots/2.mobile-Usa.jpg "USA Statistics") |![Canada Statistics](./screenshots/3.mobile-Canada.jpg "Canada Statistics")

China Statistics           |  Latest News          | |
:-------------------------:|:-------------------------:|:-------------------------:  
  ![China Statistics](./screenshots/4.mobile-China.jpg "China Statistics")  | ![Latest News](./screenshots/5.mobile-News.jpeg#pic_center=414x736 "Latest News") | |
