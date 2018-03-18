import React, { Component } from 'react';
import Translate from './Translate';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <div>
          <Translate cmsKey='CMS Project' language='en' country='us' pageName='testPage'/>
        </div>
      </div>
    );
  }
}

export default App;
