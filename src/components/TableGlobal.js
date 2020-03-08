import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

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
  initRows.push({ countryEnglishName: loadSting, confirmedCount: 0, suspectedCount: 0, curedCount: 0, deadCount: 0 });
}

export default function StickyHeadTable({place, rows}) {
  const classes = useStyles();
  const [rowsData, setRows] = useState((rows.length === 0) ? initRows: rows);

  useEffect(() => {
    if(place === 'USA') {
      import(`../assets/UsaStatesCases.json`).then( ({cases}) => {
        // console.log(cases);
        setRows(cases.map( ({name, confirmed, death, recovered}) => {
          return {
            countryEnglishName: name,
            confirmedCount: confirmed,
            suspectedCount: '0',
            curedCount: recovered,
            deadCount: death
          }
        }));
      });
    } else {
      if(rows.length > 0) { 
        console.log('test rrr', rows);
        setRows(rows); 
      } 
    }
  },[place, rows]);

  if(place === 'USA') { 
    columns[1].label = 'State/Province'; 
  } else { 
    columns[1].label = 'Country/Place'; 
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
