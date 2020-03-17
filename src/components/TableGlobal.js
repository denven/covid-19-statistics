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

const columns = [
  { id: 'no', label: '#', maxWidth: 10},
  { id: 'countryEnglishName', label: 'Country/Place', maxWidth: 40},
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
  { id: 'infectRate', label: 'Cases/1M', align: 'right', maxWidth: 50 }
];

const StyledTableCell = withStyles(theme => ({
  head: {
    fontWeight: 600
  },
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

  useEffect(() => {
    if(place === 'USA') {
      axios.get(`./assets/UsaStatesCases.json`).then( ({data}) => {
        if(columns.length === 6) columns.pop();
        setRows(data.cases.map( ({name, confirmed, death, increased, deathRate}) => {
          // the following keys doesn't match the value name, as I don't want to change the 
          // key names for global data(the two pages share the same data structure)
          return {
            countryEnglishName: name,
            confirmedCount: confirmed,
            suspectedCount: '0',
            curedCount: death,
            deadCount: deathRate
          }
        }));
      });
    } else {
      // Global data
      if(columns.length === 5) {
        columns.push({ id: 'infectRate', label: 'Cases/1M', align: 'right', maxWidth: 50 });
      }
      
      if(rows.length > 0) { 
        //Added infected rate per million in population Mar 14, 2020
        axios.get(`./assets/WorldPopulation.json`).then( ({data}) => {    
          let dataWithInfectRate = rows.map(country => {
            let infectRate = 0;  // infection number per million 
            if( data[country.countryEnglishName] > 0 ) {
              infectRate = Math.ceil(country.confirmedCount * 1000000 / data[country.countryEnglishName]);
            };
            Object.assign(country, {"infectRate": infectRate})
            if(country.countryEnglishName === "Diamond Princess Cruise") {
              country.infectRate = (country.confirmedCount * 100 / data[country.countryEnglishName]).toFixed(2) + '%';
            }
            return country;
          });
          setRows(dataWithInfectRate); 
        });
      } 
    }
  },[place, rows]);

  if(place === 'USA') { 
    columns[1].label = 'State/Province'; 
    columns[3].label = 'Death'; 
    columns[4].label = 'Lethality'; 
  } else { 
    columns[1].label = 'Country/Place'; 
    columns[3].label = 'Cured'; 
    columns[4].label = 'Death';
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
                    const value = ((column.id === 'no') && !row[column.id]) ? (index+1) : row[column.id];
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
