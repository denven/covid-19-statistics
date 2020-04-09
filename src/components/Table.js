// Table for Global and USA Page

import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import axios from 'axios';
import _ from 'lodash';

const formStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(0),
    minWidth: 30,    
  },
  selectEmpty: {
    marginTop: theme.spacing(1),
  },
}));

function ContinentSelect({changeContinent}) {
  const classes = formStyles();
  const [continent, setContinent] = React.useState(0);  // default option: 0 --> worldwide

  const handleChange = (event) => {
    setContinent(event.target.value);
    changeContinent(event.target.value);  // pass state to father component
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <Select
          defaultValue={1}
          value={continent}
          onChange={handleChange}
          style={{fontWeight: 600}}
        >
          <MenuItem value={0}>World</MenuItem>
          <MenuItem value={1}>Africa</MenuItem>
          <MenuItem value={2}>Asia</MenuItem>
          <MenuItem value={3}>Europe</MenuItem>
          <MenuItem value={4}>Oceania</MenuItem>
          <MenuItem value={5}>N. America</MenuItem>
          <MenuItem value={6}>S. America</MenuItem>
        </Select>
      </FormControl>
      </div>
  );
}

const columns = new Array(9); // max columns is 9

const makeColumns = (place) => {

  columns[0] = { id: 'no', label: '#', maxWidth: 10};
  columns[1] = { id: 'name', label: 'Country/Place', maxWidth: 30};
  columns[2] = { id: 'confirmedCount', label: 'Confirmed', align: 'right', maxWidth: 30 };
  columns[3] = { id: 'increased', label: 'New', align: 'right', maxWidth: 30 };

  if(place === 'USA') {
    columns[1].label = 'State';
    columns[4] = { id: 'deadCount', label: 'Deaths', align: 'right', maxWidth: 30 };
    columns[5] = { id: 'newDeath', label: 'Deaths(+)', align: 'right', maxWidth: 30 };  
    columns[6] = { id: 'infectRate', label: 'Cases/M', align: 'right', maxWidth: 30 };  
    columns[7] = { id: 'lethality', label: 'Lethality', align: 'right', maxWidth: 30 };
    if(columns.length > 8)
      columns.pop();
  } else {
    columns[4] = { id: 'curedCount', label: 'Cured', align: 'right', maxWidth: 30 };
    columns[5] = { id: 'deadCount', label: 'Deaths', align: 'right', maxWidth: 30 };
    columns[6] = { id: 'newDeath', label: 'Deaths(+)', align: 'right', maxWidth: 30 };
    columns[7] = { id: 'infectRate', label: 'Cases/M', align: 'right', maxWidth: 30 };  
    columns[8] = { id: 'lethality', label: 'Lethality', align: 'right', maxWidth: 30 };  
  }
}

const StyledTableCell = withStyles(theme => ({
  head: { fontWeight: 600 },
  body: { fontSize: 14, },
}))(TableCell);

const useStyles = makeStyles({
  root: { width: '100%', }, container: { maxHeight: "83vh" },
});

let initRows = [];  // Init an empty table data array
for(let i = 0, loadSting = 'Loading '; i < 3; i++) {
  loadSting +='..';
  initRows.push({ name: loadSting, confirmedCount: 0, suspectedCount: 0, curedCount: 0, deadCount: 0, infectRate: 0 });
}

export default function StickyHeadTable({place, rows}) {
  const classes = useStyles();
  const [rowsData, setRows] = useState((Array.isArray(rows)) ? initRows: rows);
  const [worldData, setData] = useState([]);  // store data separately used for continent switch

  makeColumns(place); 

  const getTotalOfContinent = (continentData) => {
    const sumBy = (arr, prop) => {
      let total = _.sumBy(arr, (obj) => {
        let value = obj[prop].toString();
        let trimed = value.replace(/[,+\s]{0,5}/g, '');
        if(!trimed || isNaN(trimed)){  // empty string
          return 0;
        } 
        return parseInt(trimed);
      });
      if(prop === 'newDeath' || prop === 'increased') {
        total = '+' + total;
      }
      return total;
    }

    return {
      name: 'Total',
      confirmedCount: sumBy(continentData, 'confirmedCount'),
      increased: sumBy(continentData, 'increased'),
      currentConfirmedCount: sumBy(continentData, 'currentConfirmedCount'),
      curedCount: sumBy(continentData, 'curedCount'),
      deadCount: sumBy(continentData, 'deadCount'),
      newDeath: sumBy(continentData, 'newDeath'),
      infectRate: "-",
      lethality: "-",
      continent: 'Total',
    }            
  }

  useEffect(() => {

    let isCanceled = false;
    if(place === 'USA') {

      axios.get(`./assets/UsaStatesCases.json`).then( ({data}) => {
        // if(columns.length === 6) columns.pop();
        if(!isCanceled) {
          setRows(data.cases.map( ({name, confirmed, death, increased, newDeath, perMppl, deathRate}) => {
            return {
              name: name,
              confirmedCount: confirmed,
              increased: increased,
              deadCount: death,
              newDeath: newDeath,
              infectRate: perMppl,
              lethality: deathRate.replace(/([\d]{1,2}.[\d])%/,'$10%')
            }
          }));
        }
      });
    } else {
      // Global data     
      const getCountriesCases = async () => {
        const casesResult = await axios.get(`./assets/GlobalCasesToday.json`); 
        let dataWithInfectRate = casesResult.data.countries.map(
          ( {name, total, active, increased, recovered, dead, newDeath, perMppl, continent} ) => {

            let lethality = '0%';
            let deadCount = parseInt(dead.trim().replace(/,/g,''));
            let totalCount = parseInt(total.trim().replace(/,/g,''));
            if(deadCount > 0) {
              lethality = (100 * deadCount / totalCount).toFixed(2) + '%';
              lethality = lethality.replace(/([\d]{1,2}).00%/,'$1%');
            }

            return {
              name: name,
              confirmedCount: total,
              increased: increased,
              currentConfirmedCount: active,
              curedCount: recovered,
              deadCount: deadCount,
              newDeath: newDeath,
              infectRate: perMppl,
              lethality: lethality,
              continent: continent
            }
        });
                
        if(!isCanceled) {
          let total = getTotalOfContinent(dataWithInfectRate);         
          setData(dataWithInfectRate);
          dataWithInfectRate.push(total);
          setRows(dataWithInfectRate); 
        }
      }
      getCountriesCases();  
    }

    return () => {isCanceled = true;};

  },[place, rows]);

  const valueFormat = (value) => {
    return (value || '0').toString().replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
  }

  //handle select option changes in son component
  const handleSelectChange = (value) => {
    let name = 'World';
    switch(value) {
      case 1: name = 'Africa'; break;
      case 2: name = 'Asia'; break;
      case 3: name = 'Europe'; break;
      case 4: name = 'Oceania'; break;
      case 5: name = 'North America'; break;
      case 6: name = 'South America'; break;
      default:
        name = 'World';
    }

    let filteredRowsData = worldData.filter(country => {
      if(name === 'World') {
        return true;
      } else if(country.continent.includes(name)) {
        return true;
      } 
      return false;
    });
    if(name !== 'World') {
      let total = getTotalOfContinent(filteredRowsData);
      filteredRowsData.push(total);
    }
    setRows(filteredRowsData);
  };

  return (
    <Paper className={classes.root} elevation={0} >
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead >
            <TableRow>
              {columns.map(column => (
                <StyledTableCell key={column.id} align={column.align}
                  style={{ minWidth: column.minWidth, maxWidth: columns.maxWidth }} >

                  {
                    (column.id === 'name' && place !== 'USA') ? 
                    <ContinentSelect changeContinent = {handleSelectChange}/> : 
                    column.label
                  }

                </StyledTableCell> )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsData.map( (row, index) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.name}>
                  {columns.map(column => {
                    let value = ((column.id === 'no') && !row[column.id]) ? (index+1) : row[column.id];
                    value = valueFormat(value);

                    return (
                      <TableCell key={column.id} align={column.align} 
                        style={{
                          color: value.includes('+') ? 'red' : 'black',  
                          fontWeight: row.name === 'Total' ? 600 : 400,
                        }}
                      >
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
