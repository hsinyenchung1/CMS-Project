import React , { Component } from 'react';
import ProTypes from 'prop-types'
class Translate extends React.Component {
  render(){
    return (
      <span>{this.props.cmsKey}</span>
    );
  }
}

Translate.ProTypes = {
  cmsKey: ProTypes.string,
  language: ProTypes.string
}

export default Translate;
