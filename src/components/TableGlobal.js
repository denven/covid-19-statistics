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

const columns = [
  { id: 'countryEnglishName', label: 'Place', maxWidth: 50},
  {
    id: 'confirmedCount',
    label: 'Confirmed',
    align: 'right',
    format: value => {
      let newVal = (value + '').split('.');
      return newVal[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
    },
  },
  // { id: 'suspectedCount', label: 'Suspected', align: 'right', maxWidth: 50 },
  { id: 'curedCount', label: 'Cured', align: 'right', maxWidth: 50 },
  { id: 'deadCount', label: 'Deaths', align: 'right', maxWidth: 50 },
];

const useStyles = makeStyles({
  root: { width: '100%', }, container: { maxHeight: 600 },
});

let initRows = [];  // Init an empty table data array
for(let i = 0; i < 25; i++) {
  initRows.push({ countryEnglishName: 'Loading...', confirmedCount: 0, suspectedCount: 0, curedCount: 0, deadCount: 0 });
}

export default function StickyHeadTable() {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [rows, setRows] = useState([]);   // data operation

  useEffect(() => {
    // setRows(initRows);
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
      let validRowsData = orderBy(rowsData, ['confirmedCount', 'curedCount', 'countryEnglishName'], ['desc', 'desc', 'asc'])
      setRows(validRowsData);
    }).catch(e => console.log('Request global data:', e));
  }, []);

  return (
    <Paper className={classes.root} elevation={0} >
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.countryEnglishName}>
                  {columns.map(column => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      /> */}
    </Paper>
  );
}
