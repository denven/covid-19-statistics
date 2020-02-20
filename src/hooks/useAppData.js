import { useEffect, useReducer } from "react";
import axios from "axios";
import moment from 'moment';
import { filter, pick, orderBy } from 'lodash';

import reducer, { SET_LOAD_STATUS, SET_OVERALL, SET_TABLE_DATA, SET_MAP_DATA } from "./reducer";

export default function useAppData(props) {

  const initialData = { loaded: false, overall: {}, mapData: [], tableData: []};
  const [covidData, dispatch] = useReducer(reducer, initialData);

  // const setOverall = data => dispatch({type: SET_OVERALL, overall: data});
  // const setMapData = data => dispatch({type: SET_MAP_DATA, mapData: data});
  // const setTableData = data => dispatch({type: SET_TABLE_DATA, tableData: data})

  const getUpdateTime = (data) => {
    let time = moment.unix(data[0].updateTime/1000).toString();
    return moment(time).format("YYYY-MM-DD HH:mm:ss");
  };

  // overall data without China
  const getOverall = (otherCountries, updateTime) => {      
    let globalCases = { 
      currentConfirmedCount: 0, 
      confirmedCount: 0, 
      suspectedCount: 0, 
      curedCount: 0, 
      deadCount: 0
    };

    for(const country of otherCountries) {
      if(country.countryEnglishName) {
        globalCases.confirmedCount += country.confirmedCount;
        globalCases.currentConfirmedCount += country.currentConfirmedCount;
        globalCases.curedCount += country.curedCount;
        globalCases.deadCount += country.deadCount;
        globalCases.suspectedCount += country.suspectedCount;
      }
    }      

    return { 
      time: updateTime,
      confirmed: globalCases.confirmedCount, 
      suspect: globalCases.suspectedCount,
      cured: globalCases.curedCount, 
      death: globalCases.deadCount,
      fatality: (100 * globalCases.deadCount / (globalCases.confirmedCount + globalCases.curedCount)).toFixed(2) + '%'
    };
  }

  const getMapData = (chinaData, otherCountries) => {

    let chinaCases = { 
      countryEnglishName: 'China', 
      currentConfirmedCount: 0, 
      confirmedCount: 0, 
      suspectedCount: 0, 
      curedCount: 0, 
      deadCount: 0
    };

    for(const prov of chinaData) {
      chinaCases.confirmedCount += prov.confirmedCount;
      chinaCases.currentConfirmedCount += prov.currentConfirmedCount;
      chinaCases.curedCount += prov.curedCount;
      chinaCases.deadCount += prov.deadCount;
      chinaCases.suspectedCount += prov.suspectedCount;
    }

    let countriesData = otherCountries.map((country) => { 
      if(country.countryName === "阿联酋") {
        country.countryEnglishName = "United Arab Emirates";
      }
      return pick(country, "countryEnglishName", "confirmedCount", 
      "currentConfirmedCount", "suspectedCount", "curedCount", "deadCount")} 
    );
    
    let countriesDataWithChina = countriesData.map((country) => {          
      if(country.countryEnglishName === "United States of America") {
        country.countryEnglishName = "United States";
      }

      if(country.countryEnglishName) {
        return {name: country.countryEnglishName, value: country.confirmedCount};
      }
    });
    countriesDataWithChina.push({name: 'China', value: chinaCases.confirmedCount});
    return countriesDataWithChina;
  }

  const getTableData = (chinaData, otherCountries) => {

    let chinaCases = { 
      countryEnglishName: 'China', 
      currentConfirmedCount: 0, 
      confirmedCount: 0, 
      suspectedCount: 0, 
      curedCount: 0, 
      deadCount: 0
    };

    for(const prov of chinaData) {
      chinaCases.confirmedCount += prov.confirmedCount;
      chinaCases.currentConfirmedCount += prov.currentConfirmedCount;
      chinaCases.curedCount += prov.curedCount;
      chinaCases.deadCount += prov.deadCount;
      chinaCases.suspectedCount += prov.suspectedCount;
    }

    let countriesData = otherCountries.map((country) => { 
      return pick(country, "countryEnglishName", "confirmedCount", 
      "currentConfirmedCount", "suspectedCount", "curedCount", "deadCount");        
    });

    countriesData.push(chinaCases);
    let rowsData = filter(countriesData, (data) => { return (data.countryEnglishName); });
    return orderBy(rowsData, ['confirmedCount', 'curedCount', 'countryEnglishName'], ['desc', 'desc', 'asc']);   
  }

  useEffect(() => {
    axios.get('https://lab.isaaclin.cn/nCoV/api/area').then((data)=> {
      
      let chinaData = filter(data.data.results, ({cities})=>{ return (Array.isArray(cities)) });
      let otherCountries = filter(data.data.results, ({cities})=>{ return (!Array.isArray(cities)) });

      // spectial process of unmatched data with map geo
      for(const country of otherCountries) {
        if(country.countryName === "钻石公主号邮轮") {
          country.countryEnglishName = 'Diamond Princess Cruise'
        }        
        if(country.countryName === "阿联酋") {
          country.countryEnglishName = "United Arab Emirates";
        }
        if(country.countryEnglishName === "United States of America") {
          country.countryEnglishName = "United States";
        }
      }

      let overall = getOverall(otherCountries, getUpdateTime(data.data.results));
      let mapData = getMapData(chinaData, otherCountries);
      let tableData = getTableData(chinaData, otherCountries);
      dispatch({type: SET_LOAD_STATUS, loaded: true});
      dispatch({type: SET_OVERALL, overall: overall});
      dispatch({type: SET_MAP_DATA, mapData: mapData});
      dispatch({type: SET_TABLE_DATA, tableData: tableData})

    }).catch(e => console.log('Request global data:', e));
  }, []);

  return covidData;
}