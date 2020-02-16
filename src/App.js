import React from 'react';
import './styles/App.css';

import AppBar from './components/AppBar';
import MapChina from './components/MapChina';

function App() {
  return (
    <div>
      <AppBar />
      <div className="bodyContainer">
        <div className="bodyLeft">
          <MapChina data=""/>
        </div>
        <div className="bodyRight">LineChart</div>
      </div>
    </div>
  );
}


export default App;
