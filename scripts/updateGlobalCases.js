const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const moment = require("moment");
const _ = require("lodash");

async function updateGlobalCases() {
	let url = "https://www.worldometers.info/coronavirus/";
	let res = await axios.get(url);

	if (res.status === 200) {
		const $ = cheerio.load(res.data);

		let countries = [];
		let tableRows = $("tr", "tbody").toArray();

		let overall = {};
		// the first 7 rows returned are data not for single country or place(April 9th, 2020)
		for (let index = 8, countryFlag = true; index < tableRows.length; index++) {
			// index = 0, is the same with the last line(totol number), April 05, 2020
			// Match english and french letters, dot, space in country name
			// let name = $(tableRows[index]).text().trim().match(/[a-zA-ZàâäèéêëîïôœùûüÿçÀÂÄÈÉÊËÎÏÔŒÙÛÜŸÇ.\- ]+/g);  // match country or place name
			const rowColumns = $(tableRows[index])
				.text()
				.trim()
				.split("\n");

			if (Array.isArray(rowColumns)) {
				let [
					no, // country rank, table column added on May 14th, 2020
					name,
					total,
					increased,
					dead,
					newDeath,
					recovered,
					active,
					severe,
					perMppl
				] = rowColumns;
				name = name.trim().replace(/,/g, "");
				dead = dead.trim();
				let continent = rowColumns.pop(); // get continent name
				let placeCasesObj = {
					name,
					total,
					increased,
					dead,
					newDeath,
					recovered,
					active,
					severe,
					perMppl,
					continent
				};

				if (continent === "All") {
					countryFlag = false;
				} // end of today's data

				if (countryFlag && isNaN(name)) {
					// use isNaN(name) to exclude continents' toll data
					countries.push(placeCasesObj); // single country/place cases today
				} else {
					// if (name === "Total:" && continent === "All") {
					if (continent === "All") {
						// console.log(rowColumns);
						let [
							name,
							total,
							increased,
							dead,
							newDeath,
							recovered,
							active,
							server,
							perMppl
						] = rowColumns;

						overall = {
							name,
							total,
							increased,
							dead,
							newDeath,
							recovered,
							active,
							server,
							perMppl,
							continent
						};
						break;
					}
				}
			}
		}

		// let overall = countries.pop();
		if (countries.length > 0) {
			let jsonData = {
				time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
				countries: _.sortBy(countries, o =>
					parseInt(o.total.replace(/,/g, ""))
				).reverse(),
				overall: overall
			};

			const worldCasesStr = JSON.stringify(jsonData, null, 4);
			fs.writeFile(
				"../public/assets/GlobalCasesToday.json",
				worldCasesStr,
				(err, result) => {
					if (err) console.log("Error in writing data into Json file", err);
					console.log(
						`Updated ${countries.length} countries cases global at ${jsonData.time}`
					);
				}
			);
		}
	}
}

const updateDataFromDXY = () => {
	try {
		axios
			.get("https://lab.isaaclin.cn/nCoV/api/area")
			.then(({ data }) => {
				let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
				const worldCasesStr = JSON.stringify(data, null, 4);
				fs.writeFile(
					"../public/assets/Areas.json",
					worldCasesStr,
					(err, result) => {
						if (err) console.log("Error in writing data into Json file", err);
						console.log(`Updated global countries cases global at ${time}`);
					}
				);
			})
			.catch(err => console.log(err));
	} catch (error) {
		console.log(`Error when request data from lab.isaaclin.cn/nCoV/api`);
	}
};

// they canbe merged into using only one data source
updateGlobalCases(); // scrape live toll data from worldometer.com
updateDataFromDXY(); // use an api to get detailed cases in China and other countries
