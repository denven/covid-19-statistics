## Website description

https://covid19-sdata.site/

> This website was created at the early stage when COVID19 came into Canada, 2020. Due to failure of EC2 instance, there were data loss(not collected) since 1st Jan, 2021. It archived data to the end of 2020 and will not collect new data since then. As today, there are many websites providing COVID19 data, I won't spent extra time to fix it.


## Reminder

- It is highly recommended to **<font size=4 color='blue'>ZOOM OUT</font>** your broswer to view all data in a single page view;
- The heroku site may not be accessible because it's sleeping when it's idle, just give a second visit after 2-3 minutes and it will be awaken.

## Introduction

This web app uses react, material ui, echarts, and js scraper to collect and represent statistics of coronavirus in the world.

- Latest host on AWS EC2: https://covid19-stat.site/ (update every 10 minutes)
- New Hosting on AWS S3: http://covid-19-statistics.s3-website-us-west-2.amazonaws.com/ (limited update by github actions)
- Original Hosting on heroku: https://covid-19-statistics.herokuapp.com/ (limited update by github actions))

## Data Sources

- https://en.wikipedia.org/wiki/2020_coronavirus_outbreak_in_Canada
- http://www.bccdc.ca/health-info/diseases-conditions/covid-19/data
- https://kustom.radio-canada.ca/
- https://www.worldometers.info/coronavirus/
- https://lab.isaaclin.cn/nCoV/en

### Epidemic data collected for downloading

- Latest cases numbers are collected/scraped periodically and written into JSON files in [assets](https://github.com/denven/covid-19-statistics/tree/master/public/assets) directory.

## Screenshots

### Desktop View

![Desktop GIF](https://github.com/denven/hello_world/blob/master/COVID-19-Desktop.gif#pic_center=960x500)

### Mobile View

|                              Global Statistics                              |                           USA Statistics                           |                              Canada Statistics                              |
| :-------------------------------------------------------------------------: | :----------------------------------------------------------------: | :-------------------------------------------------------------------------: |
| ![Global Statistics](./screenshots/1.mobile-Global.jpg "Global Statistics") | ![USA Statistics](./screenshots/2.mobile-Usa.jpg "USA Statistics") | ![Canada Statistics](./screenshots/3.mobile-Canada.jpg "Canada Statistics") |

|                             China Statistics                             |                                    Latest News                                    |                                  |
| :----------------------------------------------------------------------: | :-------------------------------------------------------------------------------: | :------------------------------: |
| ![China Statistics](./screenshots/4.mobile-China.jpg "China Statistics") | ![Latest News](./screenshots/5.mobile-News.jpeg#pic_center=414x736 "Latest News") | <div style="width: 350px"></div> |
