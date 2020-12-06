import React, { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import echarts from "echarts/lib/echarts";
// import 'echarts/lib/chart/line';
import axios from "axios";

export default function MapCanada() {
	// const [data, setData] = useState([]);
	const [loaded, setReady] = useState(false);
  const [cases, setCases] = useState({ dates: [], data: [] });
  // NOTE: cannot set Yaxis value dynamically, it leads to too many renders
  // const [barXaxis, setXaxis ] = useState(["QC", "ON", "AB", "BC", "NS", "SK", "MB", "NL", "NB", "PE", "YT", "NT", "NU"]);

	useEffect(() => {
		let isCanceled = false;

		axios.get(`./assets/CanadaGEO.json`).then(({ data }) => {
			echarts.registerMap("Canada", data);
			if (!isCanceled) setReady(true);
		});

		return () => {
			isCanceled = true;
		};
	}, []);

	useEffect(() => {
		let isCanceled = false;
		axios.get(`./assets/CanadaCasesDb.json`).then(({ data }) => {
			if (!isCanceled) {
				setCases({
					dates: data.cases.map(day => day.date), // for timeline component
					data: data.cases.map(day => day.cases) // for map component
				});
			}
		});
		return () => {
			isCanceled = true;
		};
	}, []);

	const getLoadingOption = () => {
		return {
			text: "Data Loading ..."
		};
	};

	const onChartReady = chart => {
		if (Array.isArray(cases) && cases.length > 0) {
			setTimeout(() => {
				chart.hideLoading();
			}, 1500);
		}
	};

	const setVisualMap = () => {
		return {
			show: true,
			type: "piecewise",
			min: 0,
			max: 10000,
			align: "right",
			bottom: "4%",
			left: "center",
			orient: "horizontal",
			inRange: { color: ["#ffc0b1", "#ff8c71", "#ef1717", "#9c0505"] },
			pieces: [
				{ min: 3000 },
				{ min: 1000, max: 2999 },
				{ min: 500, max: 999 },
				{ min: 100, max: 499 },
				{ min: 0, max: 99 }
			],
			padding: 30,
			showLabel: true,
			text: ["Outbreak", "Confirmed Cases"],
			itemWidth: 10,
			itemHeight: 10,
			textStyle: { fontSize: 12, fontWeight: "bold" }
		};
	};

	const getOptionConfig = () => {
		return {
			//global settings
			baseOption: {
				timeline: {
					// by day
					loop: false,
					axisType: "category",
					show: true,
					autoPlay: true,
					playInterval: 500, // fast play, adjusted on 10th, June
					data: cases.dates, // Days since the 1st cases
					currentIndex: 0, //cases.dates.length - 7 // start to play from the last seven days
				},
				title: {
					x: "center",
					text: "Cases by Province (clickable) in Canada",
					subtext: "Data from https://www.canada.ca/en/public-health",
					textStyle: { fontSize: 18 }
				},
				tooltip: {
					show: true,
					trigger: "item"
				},
				visualMap: setVisualMap(),
				xAxis: [
					{
						type: "value",
            max: 150000, // max cases number, May 4th, 2020 adjusted
						axisLine: { show: false },
						axisTick: { show: false },
						axisLabel: { show: false },
						splitLine: { show: false }
					}
				],
				yAxis: [
					{
						type: "category",
						inverse: true,
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],  // 13 provinces and territories in Canada
            // [ "QC", "ON", "AB", "BC", "MB", "SK", "NS", "NL", "NB", "PE", "YT", "NT", "NU" ]
					}
				],
				grid: {
					// Set margin of all charts
					left: "5%",
					right: "5%",
					bottom: "10%",
					containLabel: true
				},
				series: [
					{
						// left: '0%', // not working, cannot be adjusted
						z: 200, //make bar on top of map
						stack: "All",
						type: "bar",
            barMinHeight: 32,
            // itemStyle: {
            //   // normal:{
            //     color: function(params) {
            //       return '#cccccc';
            //       if(params.data.value < 100) return "#9c0505";
            //       if(params.data.value < 500) return "#ef1717";
            //       if(params.data.value < 1000) return "#ff8c71";
                  
            //     // }
            //   },
            // },
						label: {
              position: "insideRight",
              distance: -20,
							show: true,
              color: "blue", // font color
              fontWeight: 'bold',
              // width: 300,
              // align: 'left',

              // padding: [0, 10, 0, 10],
              // formatter: name => (`{name|${name}}`),
              formatter: function (params) {
                return params.data.value + '  ' + params.data.abbr
                // return  ['{name|' + params.data.abbr + '}',  '{value|' + params.data.value + '}'];
                // console.log(option.xAxis.data.length);
                // return  [`{name|${params.data.abbr}}`, `{c|${params.data.value}}`].join("");

              },
              // The rich text feature is not working well in react, e.g. the align prop doesn't work
              // And it's not easy to align two text fragments to space between the full bar length
              // rich: {
              //   name: {
              //     color: '#fff',
              //     shadowBlur: 3,
              //     borderWidth: 1,
              //     borderColor: 'green',
              //     borderRadius: 2,
              //     // width: '200%'
              //   },
              //   c: {
              //     color: 'blue',
              //   },
              // }
						}
						// name: 'Confirmed',
						// color: 'rgb(64,141,39)',
					},
					{
						z: 100,
						left: "15%",
						right: "5%",
						top: "27%",
						bottom: "13%",
						type: "map",
						name: "",
						geoIndex: 0,
						// data: data, // area(provinces) data, put this into OPTIONS' series
						map: "Canada",
						silent: false, // province area is clickable
						label: {
							normal: { show: false, fontSize: 16, color: "rgba(0,0,0,0.7)" }
						},
						itemStyle: {
							normal: {
								borderColor: "rgba(0, 0, 0, 0.7)",
								areaColor: "#B2E5BC" // default area color
							},
							emphasis: {
								areaColor: "#53adf3", // change color when click
								shadowOffsetX: 0,
								shadowOffsetY: 0,
								shadowBlur: 20,
								borderWidth: 0,
								shadowColor: "rgba(0, 0, 0, 0.5)"
							}
						},
						mapType: "map",
						zoom: 1.0,
						roam: false,
						showLegendSymbol: false,
						rippleEffect: {
							show: true,
							brushType: "stroke",
							scale: 2.5,
							period: 4
						}
					}
				]
			},

      // played data changes here, one timespot(day) one data
      // returns an array, each item is one-day's data array containing provinces' daily cases
      // how did the day case number map to the coresponding province name?
			options: cases.data.map((dayCases, index) => {

        dayCases.sort( (provA, provB) => {
          let provAvalue =  Number(provA.value) + Number(provA.suspect ? provA.suspect : 0);
          let provBvalue =  Number(provB.value) + Number(provB.suspect ? provB.suspect : 0);
          return (provBvalue - provAvalue);
        });

        let repIndex = dayCases.findIndex(prov => prov.abbr === "Repatriated");
        if(repIndex != -1) dayCases.splice(repIndex, 1);

        // if(!casesDescProvs.every( (item, index) => item === barXaxis[index])) {
        //   setXaxis(casesDescProvs);
        // }

        // console.log(JSON.stringify(casesDescProvs) === JSON.stringify(barXaxis))
        // if(JSON.stringify(casesDescProvs) !== JSON.stringify(barXaxis)) {
        //   setXaxis(casesDescProvs);

        // }

        // console.log("TESTING....",  dayCases, cases.data, casesDescProvs);

				// for different days
				return {
					title: {
						text: "Cases by Province (clickable) on " + cases.dates[index] + ", 2020"
					}, //by day
					series: [
            { 
              // bar data: one day's case number for all provinces
              // the proivinces data is listed according to map data
              data: dayCases
              // .map(
							// 	prov => parseInt(prov.value) + parseInt(prov.suspect ? prov.suspect : 0)
							// ) 
						},

						{
							data: dayCases, // map data: match map by province name
							tooltip: {
								formatter: ({ name, value, data }) => {
									if (!value) {
										return `<b>${name}</b><br />Confirmed: ${value || "No Case"}`;
									}

									let { cured, death, lethality } = data;
									const valueFormat = value => {
										return (value || "0")
											.toString()
											.replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,");
									};

									let tipString = `<b>${name}</b><br />
                                Active: ${valueFormat(
																	value - cured - death
																)}<br />
                                Confirmed: ${valueFormat(value)}<br />
                                Cured:\t${valueFormat(cured)}<br />
                                Death:\t${valueFormat(death)}<br />
                                Lethality:\t${lethality || "0%"}`;
									return tipString;
								}
							}
						}
					]
				};
			})
		};
	};

	const getModerateHeight = () => {
		let mediaQuery = window.matchMedia("(orientation: portrait)");
		// console.log('sss', mediaQuery);
		if (mediaQuery.matches) {
			if (document.body.clientWidth < 1024) {
				return "65vh";
			}
		}
		return "83vh";
  };

  
	return (
		<ReactEcharts
			style={{ height: getModerateHeight() }}
			echarts={echarts}
			option={getOptionConfig()}
			loadingOption={getLoadingOption()}
			onChartReady={onChartReady}
			showLoading={!loaded}
			notMerge={true}
			lazyUpdate={true}
			theme={"theme_name"}
			// onEvents={EventsDict}
			// opts={}
		/>
	);
}
