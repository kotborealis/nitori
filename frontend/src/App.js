import React from 'react';
import './App.css';
import {AppBar} from 'react-toolbox/components/app_bar/AppBar';

function App() {
  return (
    <div className="App">
        <AppBar
            title="C++ testing"
            leftIcon="menu"
            flat={true}
            fixed={true}
        ></AppBar>
    </div>
  );
}

export default App;
