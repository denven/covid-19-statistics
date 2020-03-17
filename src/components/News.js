import React, { useState, useEffect } from 'react';
import '../styles/News.css'

import axios from 'axios';
import moment from 'moment';
import titleize from 'titleize';

// One piece of news
function OnePiece ({ source, publishedAt, title, description, url, urlToImage, content }) {
  //add a defalut image
  const subImage = "https://media.graytvinc.com/images/690*392/coronavirus6.png";
  const [imgUrl, setImage] = useState(!urlToImage ? subImage : urlToImage);

  const onError = () => { setImage(subImage) }; // add substitution fallback when image cannot load

  if(description) {
    description = description.replace(/%20/g, ' ');  // fixed the content contains characters like `20%`
  }
  
  return (
      <div className="news-card">
        <div className="news-image"> 
          <a href={url} >
            <img src={imgUrl} alt={''} onError={onError} />
          </a> </div>
        <div className ='news-text'>
          <div>
            <div> <a className="news-title" href={url}>{ title.split('-') }</a> </div>
            <div className="summary">{ description ? description.slice(0, 150) : "" } ... </div>
          </div>
          <div className="news-date">
            <div className="relative"> { titleize(moment(publishedAt).fromNow()) } </div>
            <div className="relative"> { moment(publishedAt).format("YYYY-MM-DD HH:mm:ss") } </div>
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
    axios.get(`./assets/LatestNews.json`).then( ({data}) => {
      setNews(data.articles);
    });
  }, []);

  return (
    <div className="news-container">
      { news.slice(0, maxCount).map((article, index) => <OnePiece {...article} key={index} />) }
    </div>
  )
}

