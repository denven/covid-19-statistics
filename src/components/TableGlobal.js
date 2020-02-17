import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';


import axios from 'axios'
import { orderBy, filter, pick } from 'lodash';

const useStyles = makeStyles({
  table: {
    minWidth: 300,
  },
});


export default function DenseTable() {
  const classes = useStyles();

  const [rows, setRows] = useState([]);  

  useEffect(() => {
    axios.get('https://lab.isaaclin.cn/nCoV/api/area').then((data)=> {
      let chinaData = filter(data.data.results, ({cities})=>{ return (Array.isArray(cities)) });
      let otherCountries = filter(data.data.results, ({cities})=>{ return (!Array.isArray(cities)) });

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

      let countriesAllData = otherCountries.map((country) => { 
        if(country.countryName === "钻石公主号邮轮") {
          country.countryEnglishName = 'Diamond Princess'
        }        
        if(country.countryName === "阿联酋") {
          country.countryEnglishName = "United Arab Emirates";
        }
        if(country.countryEnglishName === "United States of America") {
          country.countryEnglishName = "United States";
        }

        return pick(country, "countryEnglishName", "confirmedCount", 
        "currentConfirmedCount", "suspectedCount", "curedCount", "deadCount");        
      });
      countriesAllData.push(chinaCases);
      let rowsData = filter(countriesAllData, (data) => { return (data.countryEnglishName); })
      let validRowsData = orderBy(rowsData, ['confirmedCount', 'countryEnglishName'], ['desc', 'asc'])
      setRows(validRowsData);
    });
  },[]);


  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Country/Place</TableCell>
            <TableCell align="right">Confirmed</TableCell>
            <TableCell align="right">Suspected</TableCell>
            <TableCell align="right">Recoverd</TableCell>
            <TableCell align="right">Deaths</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.countryEnglishName}>
              <TableCell component="th" scope="row">
                {row.countryEnglishName}
              </TableCell>
              <TableCell align="right">{row.confirmedCount}</TableCell>
              <TableCell align="right">{row.suspectedCount}</TableCell>
              <TableCell align="right">{row.curedCount}</TableCell>
              <TableCell align="right">{row.deadCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
