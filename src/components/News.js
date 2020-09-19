import React, { useState, useEffect } from "react";
import "../styles/News.css";

import axios from "axios";
import moment from "moment";
import titleize from "titleize";

// One piece of news
function OnePiece({ source, publishedAt, title, description, url, urlToImage, content }) {
	//add a defalut image
	const subImages = [
		"https://cdn.the-scientist.com/assets/articleNo/67006/aImg/35679/coronavirus-thumb-l.png",
		"https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/article_thumbnails/other/1800x1200_virus_3d_render_red_03_other.jpg",
		"https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/article_thumbnails/news/2020/01_2020/coronavirus_1/1800x1200_coronavirus_1.jpg",
		"https://cdn.clipart.email/219b08c78df7864188d80f1b2628574b_sars-coronavirus-spike-n-term-the-native-antigen-company_1000-750.png",
		"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTCqqYA2UKZS2lQe0W6exK9AKKzg4nqJxQ27lfW2x9PGg&usqp=CAU&ec=45702844",
	];
	const subImage = subImages[Math.floor(Math.random() * 4)];
	const [imgUrl, setImage] = useState(!urlToImage ? subImage : urlToImage);

	const onError = () => {
		setImage(subImage);
	}; // add substitution fallback when image cannot load

	if (description) {
		description = description.replace(/%20/g, " "); // fixed the content contains characters like `20%`
	}

	return (
		<div className="news-card">
			<div className="news-image">
				<a href={url} rel="noopener noreferrer" target="_blank">
					<img src={imgUrl} alt={""} onError={onError} />
				</a>{" "}
			</div>
			<div className="news-text">
				<div>
					<div>
						{" "}
						<a className="news-title" href={url} rel="noopener noreferrer" target="_blank">
							{title.split("-")}
						</a>{" "}
					</div>
					<div className="summary">{description ? description.slice(0, 150) : ""} ... </div>
				</div>
				<div className="news-date">
					<div className="relative"> {titleize(moment(publishedAt).fromNow())} </div>
					<div className="relative"> {moment(publishedAt).format("YYYY-MM-DD HH:mm:ss")} </div>
					{/* <div className="relative"> { source.name } </div> */}
				</div>
			</div>
		</div>
	);
}

export default function LatestNews() {
	let maxCount = 20;
	const [news, setNews] = useState([]);

	useEffect(() => {
		const source = axios.CancelToken.source();
		let isCanceled = false;
		axios.get(`./assets/LatestNews.json`).then(({ data }) => {
			if (!isCanceled) setNews(data.articles);
		});
		return () => {
			source.cancel();
			isCanceled = true;
		};
	}, []);

	return (
		<div className="news-container">
			{news.slice(0, maxCount).map((article, index) => (
				<OnePiece {...article} key={index} />
			))}
		</div>
	);
}
