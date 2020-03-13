const fs = require('fs');
const { pick } = require('lodash');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWSAPIKEY);

const updateHeadlines = () => {

  newsapi.v2.topHeadlines({
    // sources: 'bbc-news,the-verge',
    q: 'coronavirus',
    qInTitle: 'Coronavirus',
    category: 'health',
    language: 'en',
    country: 'ca',
    sortBy: 'publishedAt',
  }).then(response => {
    let articles = response.articles.map((article) => { 
      return pick(article, "source", "publishedAt", "title", "url", "urlToImage", "description", "content")} 
    );

    let date = new Date();
    const newsString = JSON.stringify({articles: articles}, null, 4);
    fs.writeFile("../src/assets/LatestNews.json", newsString, (err, result) => {
      if(err) console.log('Error in writing data into Json file', err);
      console.log(`Updated latest news at ${date}`);
    });
  });

}

updateHeadlines();
