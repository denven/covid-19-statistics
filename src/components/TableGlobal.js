import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';

const columns = new Array(6);

const makeColumns = (place) => {

  columns[0] = { id: 'no', label: '#', maxWidth: 10};
  columns[1] = { id: 'countryEnglishName', label: 'Country/Place', maxWidth: 40};
  columns[2] = { id: 'confirmedCount', label: 'Confirmed', align: 'right', };

  if(place === 'USA') {
    columns[1].label = 'State/Province';
    columns[3] = { id: 'increased', label: 'Increased', align: 'right', maxWidth: 50 };
    columns[4] = { id: 'deadCount', label: 'Deaths', align: 'right', maxWidth: 50 };
    columns[5] = { id: 'lethality', label: 'Lethality', align: 'right', maxWidth: 50 };
  } else {
    columns[3] = { id: 'curedCount', label: 'Cured', align: 'right', maxWidth: 50 };
    columns[4] = { id: 'deadCount', label: 'Deaths', align: 'right', maxWidth: 50 };
    columns[5] = { id: 'infectRate', label: 'Cases/1M', align: 'right', maxWidth: 50 };  
  }
}

const StyledTableCell = withStyles(theme => ({
  head: { fontWeight: 600 },
  body: { fontSize: 14, },
}))(TableCell);

const useStyles = makeStyles({
  root: { width: '100%', }, container: { maxHeight: "82vh" },
});

let initRows = [];  // Init an empty table data array
for(let i = 0, loadSting = 'Loading '; i < 3; i++) {
  loadSting +='..';
  initRows.push({ countryEnglishName: loadSting, confirmedCount: 0, suspectedCount: 0, curedCount: 0, deadCount: 0, infectRate: 0 });
}

export default function StickyHeadTable({place, rows}) {
  const classes = useStyles();
  const [rowsData, setRows] = useState((Array.isArray(rows)) ? initRows: rows);

  makeColumns(place); 

  useEffect(() => {

    let isCanceled = false;
    if(place === 'USA') {

      axios.get(`./assets/UsaStatesCases.json`).then( ({data}) => {
        // if(columns.length === 6) columns.pop();
        if(!isCanceled) {
          setRows(data.cases.map( ({name, confirmed, death, increased, deathRate}) => {
            return {
              countryEnglishName: name,
              confirmedCount: confirmed,
              increased: increased,
              deadCount: death,
              lethality: deathRate
            }
          }));
        }
      });
    } else {
      // Global data      
      if(rows.length > 0) { 
        //Added infected rate per million in population Mar 14, 2020
        axios.get(`./assets/WorldPopulation.json`).then( ({data}) => {    

          let dataWithInfectRate = rows.map(country => {

            let infectRate = 0;  // infection number per million 
            if( data[country.countryEnglishName] > 0 ) {
              infectRate = Math.ceil(country.confirmedCount * 1000000 / data[country.countryEnglishName]);
            };

            Object.assign(country, {"infectRate": infectRate})
            return country;
          });

          if(!isCanceled) setRows(dataWithInfectRate); 
        });
      } 
    }
    return () => {isCanceled = true;};
  },[place, rows]);

  const valueFormat = (value) => {
    return (value || '0').toString().replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
  }

  return (
    <Paper className={classes.root} elevation={0} >
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead >
            <TableRow>
              {columns.map(column => (
                <StyledTableCell key={column.id} align={column.align}
                  style={{ minWidth: column.minWidth }} >
                  {column.label}
                </StyledTableCell> )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsData.map( (row, index) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.countryEnglishName}>
                  {columns.map(column => {
                    let value = ((column.id === 'no') && !row[column.id]) ? (index+1) : row[column.id];
                    value = valueFormat(value);
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

    </Paper>
  );
}
