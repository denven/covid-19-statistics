import React from 'react';
import './styles/App.css';

import AppBar from './components/AppBar';
import MapChina from './components/MapChina';
import MapGlobal from './components/MapGlobal';

function App() {
  return (
    <div>
      <AppBar />
            {/* <MapGlobal data=""/> */}
      <div className="bodyContainer">
        <div className="bodyTop">          
            <p>Confirmed Cases</p>
        </div>
        <div className="bodyBottom">
          <div className="bodyLeft">
            <MapChina/>
          </div>
          <div className="bodyRight">LineChart</div>
        </div>
      </div>
    </div>
  );
}


export default App;
