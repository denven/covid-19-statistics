import React from 'react';
import './styles/App.css';

import AppBar from './components/AppBar';
import MapChina from './components/MapChina';
import MapGlobal from './components/MapGlobal';

import OverallData from './components/Overall';
import ChinaTrend  from './components/LineChart';

function App() {
  return (
    <div>
      <AppBar />
            {/* <MapGlobal data=""/> */}
      <div className="bodyContainer">
        <div className="bodyTop">     
          <OverallData />
        </div>
        <div className="bodyBottom">
          <div className="bodyLeft"> <MapChina/> </div>
          <div className="bodyRight"> <ChinaTrend/> </div>
        </div>
      </div>
    </div>
  );
}


export default App;
