import React from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import AppBar from './components/AppBar';
import './styles/App.css';

export default function App() {
  return (
    <div style={{display: 'flex'}}>
      <Router>
        <AppBar />
      </Router>
    </div>
  );
}

