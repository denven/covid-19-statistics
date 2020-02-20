import React, { useState, useEffect } from 'react';
import '../styles/News.css'

import { pick } from 'lodash';
import moment from 'moment';
import titleize from 'titleize';

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('2845360f3ed1414c96bfa71468b0cc5c');

// One piece of news
function OnePiece ({ source, publishedAt, title, description, url, urlToImage, content }) {
  //add a defalut image
  const subImage = "https://media.graytvinc.com/images/690*392/coronavirus6.png";
  const [imgUrl, setImage] = useState(!urlToImage ? subImage : urlToImage);

  const onError = () => { setImage(subImage) }; // add substitution fallback when image cannot load

  return (
      <div className="news-card">
        <div className="news-image"> 
          <a href={url} >
            <img src={imgUrl} alt={''} onError={onError} />
          </a> </div>
        <div className ='news-text'>
          <div>
            <div> <a className="news-title" href={url}>{ title.split('-')[0].split('.')[0] }</a> </div>
            <div className="summary">{ description ? description.slice(0, 100) : "" } ... </div>
          </div>
          <div className="news-date">
            <div className="relative"> { titleize(moment(publishedAt).fromNow()) } </div>
            <div className="relative"> { moment(publishedAt).format("YYYY-MM-DD HH:MM:SS") } </div>
            {/* <div className="relative"> { source.name } </div> */}
          </div>
        </div>
      </div>
  )
}

export default function LatestNews () {
  let maxCount = 20;
  const [news, setNews] = useState([])

  useEffect(() => {
    newsapi.v2.topHeadlines({
      // sources: 'bbc-news,the-verge',
      q: 'coronavirus',
      qInTitle: 'Coronavirus',
      category: 'health',
      language: 'en',
      country: 'ca',
      sortBy: 'publishedAt',
    }).then(response => {
      setNews( response.articles.map((article) => { 
        return pick(article, "source", "publishedAt", "title", "url", "urlToImage", "description", "content")} 
      ));
    });
  }, []);

  return (
    <div className="news-container">
      { news.slice(0, maxCount).map((article, index) => <OnePiece {...article} key={index} />) }
    </div>
  )
}

