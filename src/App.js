import React, { Component } from 'react';
import logo from './logo.svg';
import Translate from './Translate';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <div>
          <Translate cmsKey="CMS Project" language="en"/>
        </div>
      </div>
    );
  }
}

export default App;
