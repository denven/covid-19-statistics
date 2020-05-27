import React, { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/line";
import axios from "axios";
// import moment from 'moment';

export default function CasesTrend({ country }) {
	const [data, setData] = useState([]);
	const [loaded, setReady] = useState(false); // flag for loading map
	const [error, setError] = useState(false); // dependency flag for re-send request

	useEffect(() => {
		const source = axios.CancelToken.source();
		let isCanceled = false;

		if (country === "China") {
			// { date, confirmedNum, suspectedNum, curesNum, deathsNum }
			axios
				.get(`./assets/ChinaHisCases.json`)
				.then(({ data }) => {
					if (!isCanceled) {
						setData(data);
						setReady(true);
					}
				})
				.catch(e => {
					setError(true); // this will activate another request
					console.log("Request history data in China", e);
				});
		}

		if (country === "USA") {
			axios.get(`./assets/UsaCasesHistory.json`).then(({ data }) => {
				if (!isCanceled) {
					setData({
						date: data.cases.map(day => day.date),
						confirmedNum: data.cases.map(day => day.confirmedNum),
						increasedNum: data.cases.map(day => day.increasedNum),
						curesNum: data.cases.map(day => day.curesNum),
						deathsNum: data.cases.map(day => day.deathsNum)
					});
					setReady(true);
				}
			});
		}

		return () => {
			source.cancel();
			isCanceled = true;
		};
	}, [country, error]);

	const getLoadingOption = () => {
		return { text: "Data Loading ..." };
	};

	const onChartReady = (chart, loaded) => {
		if (loaded) {
			setTimeout(() => {
				chart.hideLoading();
			}, 1000);
		}
	};

	const getOption = () => {
		return {
			title: {
				x: "center",
				text: "Cumulative Cases by day (clickable) in " + country
			},
			tooltip: {
				trigger: "axis"
			},
			legend: {
				data: [
					"Confirmed",
					country === "China" ? "Suspected" : "Increased",
					"Recovered",
					"Deaths"
				], // four curves
				top: "30px",
				textStyle: { fontSize: 12, fontWeight: 600 }
			},
			grid: {
				left: "center",
				right: "center",
				bottom: "8%",
				containLabel: true,
				width: "92%"
			},
			toolbox: { feature: { saveAsImage: {} } },
			xAxis: {
				type: "category",
				boundaryGap: false,
				data: data.date
			},
			yAxis: {
				type: "value"
			},
			series: [
				{
					name: "Confirmed",
					type: "line",
					// stack: 'Toll',
					data: data.confirmedNum
				},
				{
					name: country === "China" ? "Suspected" : "Increased",
					type: "line",
					// stack: 'Toll',
					data: country === "China" ? data.suspectedNum : data.increasedNum
				},
				{
					name: "Recovered",
					type: "line",
					// stack: 'Toll',
					data: data.curesNum
				},
				{
					name: "Deaths",
					type: "line",
					// stack: 'Toll',
					data: data.deathsNum
				}
			]
		};
	};

	const getModerateHeight = () => {
		let mediaQuery = window.matchMedia("(orientation: portrait)");
		// console.log('sss', mediaQuery);
		if (mediaQuery.matches) {
			if (document.body.clientWidth < 1024) {
				return "48vh";
			}
		}
		return "85vh";
	};

	return (
		// (!loaded && error) ?
		// (<div className={classes.root}>
		//   <Alert severity="warning">Sorry, failed to get history data, please Refresh page!</Alert>
		//  </div>) :
		<ReactEcharts
			style={{ height: country === "China" ? getModerateHeight() : "30vh" }}
			echarts={echarts}
			option={getOption()}
			loadingOption={getLoadingOption()}
			onChartReady={onChartReady}
			showLoading={!loaded} //official showloading always have bugs
			notMerge={true}
			lazyUpdate={true}
			theme={"theme_name"}
		/>
	);
}
